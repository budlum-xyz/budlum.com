//! `NodeRepository` — Budlum node JSON-RPC'ye bağlı `ExplorerRepository` impl.
//!
//! Budlum ağı için: zincir durumu (bakiye, nonce, blok/işlem geçmişi, BNS
//! çözümleme, durum) doğrudan çalışan Budlum node'undan gelir. Node RPC'sinin
//! sunmadığı explorer-agregasyonları (cüzdan/token grafikleri, market, öne
//! çıkanlar, hesap varlıkları) tam indexer + DB (seçenek 3) kurulana kadar
//! `SeededRepository`'ye delege edilir — API/tipler sabit.
//!
//! Çalışma: `DATA_SOURCE=node` + `BUDLUM_RPC_URL=http://node:8545`.

use async_trait::async_trait;

use crate::error::Result;
use crate::node::{tx_wire_to_row, BudlumNodeClient};
use crate::repo::{ExplorerRepository, SeededRepository, PAGE_SIZE};
use crate::types::{
    AssetAmount, MarketRow, NftHoldingRow, OwnAccount, SearchResult, TokenHoldingRow, TokenMeta,
    TokenVariant, TransactionPage, TrendingRow, WalletGraph, WalletSummary,
};

/// Son kaç bloğun taranacağı (işlem geçmişi için). Üretimde bir indexer DB'si
/// bunu değiştirir; node taraması sadece küçük bir pencere için pratiktir.
const TX_SCAN_BLOCKS: u64 = 20;

pub struct NodeRepository {
    node: BudlumNodeClient,
    fallback: SeededRepository,
}

impl NodeRepository {
    pub fn new(rpc_url: String) -> Self {
        Self {
            node: BudlumNodeClient::new(rpc_url),
            fallback: SeededRepository::new(),
        }
    }
}

#[async_trait]
impl ExplorerRepository for NodeRepository {
    async fn wallet_summary(&self, address: &str) -> Result<Option<WalletSummary>> {
        // Zincir durumu (BUD bakiyesi) node'dan; sunum alanları (ad, avatar,
        // token/nft sayıları, uygulamalar) fallback'ten. Bakiye gerçek.
        let balance = self.node.get_balance(address).await.unwrap_or(0);
        let mut summary = match self.fallback.wallet_summary(address).await? {
            Some(s) => s,
            None => return Ok(None),
        };
        summary.primary_balance = AssetAmount {
            amount: balance.to_string(),
            symbol: "BUD".into(),
            variant: Some(TokenVariant::Sage),
        };
        // Node'dan türetilen son transferler (varsa fallback'ininkini geçersiz kılar).
        if let Some(recent) = self.recent_transfers_for(address, 4).await {
            if !recent.is_empty() {
                summary.recent_transfers = recent;
            }
        }
        Ok(Some(summary))
    }

    async fn wallet_relations(&self, address: &str) -> Result<WalletGraph> {
        self.fallback.wallet_relations(address).await
    }

    async fn token_distribution(&self, token_id: &str) -> Result<WalletGraph> {
        self.fallback.token_distribution(token_id).await
    }

    async fn transactions(&self, filter: crate::repo::TxFilter) -> Result<TransactionPage> {
        // Gerçek Budlum işlem geçmişi: son TX_SCAN_BLOCKS bloğu tara, tx'leri
        // topla, adres filtresi uygula, sayfala.
        let latest = self.node.block_number().await.unwrap_or(0);
        let mut rows: Vec<crate::types::TransactionRow> = Vec::new();
        let start_block = latest.saturating_sub(TX_SCAN_BLOCKS - 1);
        for n in (start_block..=latest).rev() {
            if let Some(block) = self.node.get_block_by_number(n).await? {
                for tx in &block.transactions {
                    let row = tx_wire_to_row(tx);
                    if filter
                        .address
                        .as_deref()
                        .is_none_or(|a| tx.from == a || tx.to == a)
                    {
                        rows.push(row);
                    }
                }
            }
        }
        let page = filter.page.unwrap_or(0);
        let start = (page as usize) * PAGE_SIZE;
        let total_pages = (rows.len().div_ceil(PAGE_SIZE)) as u32;
        let items = rows.into_iter().skip(start).take(PAGE_SIZE).collect();
        Ok(TransactionPage {
            items,
            cursor: None,
            block: latest.to_string(),
            total_pages,
            page,
        })
    }

    async fn search(&self, query: &str) -> Result<Option<SearchResult>> {
        let q = query.trim();
        if q.is_empty() {
            return Ok(None);
        }
        // BNS: isim → adres. Budlum .bud ad alanı.
        if let Some(addr) = self.node.bns_resolve(q).await? {
            return Ok(Some(SearchResult::Wallet { address: addr }));
        }
        self.fallback.search(q).await
    }

    async fn token(&self, id: &str) -> Result<Option<TokenMeta>> {
        self.fallback.token(id).await
    }

    async fn market_categories(&self) -> Result<Vec<String>> {
        self.fallback.market_categories().await
    }

    async fn market(&self) -> Result<Vec<MarketRow>> {
        self.fallback.market().await
    }

    async fn trending(&self) -> Result<Vec<TrendingRow>> {
        self.fallback.trending().await
    }

    async fn own_accounts(&self) -> Result<Vec<OwnAccount>> {
        self.fallback.own_accounts().await
    }

    async fn own_account(&self, id: &str) -> Result<Option<OwnAccount>> {
        self.fallback.own_account(id).await
    }

    async fn token_holdings(&self) -> Result<Vec<TokenHoldingRow>> {
        self.fallback.token_holdings().await
    }

    async fn nfts(&self) -> Result<Vec<NftHoldingRow>> {
        self.fallback.nfts().await
    }
}

impl NodeRepository {
    /// Adresin son transferlerini son bloklardan türet (limit kadar).
    async fn recent_transfers_for(
        &self,
        address: &str,
        limit: usize,
    ) -> Option<Vec<crate::types::TransferPreview>> {
        let latest = self.node.block_number().await.ok()?;
        let start = latest.saturating_sub(TX_SCAN_BLOCKS - 1);
        let mut out = Vec::new();
        for n in (start..=latest).rev() {
            if let Ok(Some(block)) = self.node.get_block_by_number(n).await {
                for tx in &block.transactions {
                    if tx.from != address && tx.to != address {
                        continue;
                    }
                    let counterparty = if tx.from == address {
                        tx.to.clone()
                    } else {
                        tx.from.clone()
                    };
                    let amount_dec = crate::node::parse_hex_u64(&tx.amount)
                        .unwrap_or(0)
                        .to_string();
                    out.push(crate::types::TransferPreview {
                        id: tx.hash.clone(),
                        amount: amount_dec,
                        symbol: "BUD".into(),
                        variant: Some(TokenVariant::Sage),
                        counterparty,
                        counterparty_asset: None,
                    });
                    if out.len() >= limit {
                        return Some(out);
                    }
                }
            }
        }
        Some(out)
    }
}
