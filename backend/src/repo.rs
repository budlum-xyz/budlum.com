//! Veri erişim soyutlaması — `queries/index.ts` mock katmanının Rust karşılığı.
//!
//! `ExplorerRepository` trait'i veri KAYNAĞINI gizler: şimdi `SeededRepository`
//! (tohum veri) uygular; gerçek indexer + veritabanı hazır olunca yeni bir impl
//! (örn. `IndexerRepository`) aynı trait'e uyar ve `main.rs`'de değiştirilir —
//! HTTP API ve tipler sabit kalır. (Kullanıcı kararı: seeded şimdi, indexer'a
//! hazırlık.)

use std::collections::HashMap;
use std::sync::Arc;

use async_trait::async_trait;

use crate::error::Result;
use crate::graph;
use crate::seed;
use crate::types::{
    MarketRow, NftHoldingRow, OwnAccount, SearchResult, TokenHoldingRow, TokenMeta,
    TransactionPage, TransactionRow, TrendingRow, WalletGraph, WalletSummary,
};

/// İşlem listesi sorgu filtresi — `getTransactions({address?, counterparty?, page?})`.
#[derive(Debug, Clone, Default)]
pub struct TxFilter {
    pub address: Option<String>,
    pub counterparty: Option<String>,
    pub page: Option<u32>,
}

pub const PAGE_SIZE: usize = 13;

/// Explorer veri kaynağı. Tüm async metotlar object-safe (async_trait).
#[async_trait]
pub trait ExplorerRepository: Send + Sync {
    async fn wallet_summary(&self, address: &str) -> Result<Option<WalletSummary>>;
    async fn wallet_relations(&self, address: &str) -> Result<WalletGraph>;
    async fn token_distribution(&self, token_id: &str) -> Result<WalletGraph>;
    async fn transactions(&self, filter: TxFilter) -> Result<TransactionPage>;
    async fn search(&self, query: &str) -> Result<Option<SearchResult>>;
    async fn token(&self, id: &str) -> Result<Option<TokenMeta>>;

    // Bonus (market / accounts / holdings) — fixtures.ts satır tipleri.
    async fn market_categories(&self) -> Result<Vec<String>>;
    async fn market(&self) -> Result<Vec<MarketRow>>;
    async fn trending(&self) -> Result<Vec<TrendingRow>>;
    async fn own_accounts(&self) -> Result<Vec<OwnAccount>>;
    async fn own_account(&self, id: &str) -> Result<Option<OwnAccount>>;
    async fn token_holdings(&self) -> Result<Vec<TokenHoldingRow>>;
    async fn nfts(&self) -> Result<Vec<NftHoldingRow>>;

    // ── Budlum veri modeli pass-through (gerçek şekli; Figma tiplerine
    //    zorla çevrilmez — frontend Budlum-native veriyi consumes eder). ──
    /// `bud_atlasGetWalletContext` — bakiye + Pollen dataAssets/grants.
    async fn atlas_wallet_context(&self, address: &str) -> Result<serde_json::Value>;
    /// `bud_marketGetOffers` — Pollen veri-pazarı teklifleri.
    async fn market_offers(&self) -> Result<serde_json::Value>;
    /// `bud_hubGetApps` — hub uygulamaları.
    async fn hub_apps(&self) -> Result<serde_json::Value>;
    /// `bud_getValidatorSet`.
    async fn validator_set(&self) -> Result<serde_json::Value>;
    /// `bud_getConsensusDomains`.
    async fn consensus_domains(&self) -> Result<serde_json::Value>;
}

/// Tohum (Figma) veri ile uygulanmış repository.
#[derive(Debug)]
pub struct SeededRepository {
    wallets: HashMap<String, WalletSummary>,
    own_by_id: HashMap<String, OwnAccount>,
    own_by_addr: HashMap<String, WalletSummary>,
    tokens: HashMap<String, TokenMeta>,
    all_tx: Vec<TransactionRow>,
    market: Vec<MarketRow>,
    market_categories: Vec<String>,
    trending: Vec<TrendingRow>,
    holdings: Vec<TokenHoldingRow>,
    nfts: Vec<NftHoldingRow>,
}

impl SeededRepository {
    pub fn new() -> Self {
        let wallets = seed::wallets();
        let tokens = seed::tokens();
        let own = seed::own_accounts();
        let own_by_id: HashMap<String, OwnAccount> =
            own.iter().cloned().map(|a| (a.id.clone(), a)).collect();
        let own_by_addr: HashMap<String, WalletSummary> = own
            .iter()
            .map(|a| (a.address.clone(), a.summary.clone()))
            .collect();
        Self {
            wallets,
            own_by_id,
            own_by_addr,
            tokens,
            all_tx: seed::build_transactions(40),
            market: seed::market_rows(),
            market_categories: seed::market_categories(),
            trending: seed::trending_rows(),
            holdings: seed::own_token_holdings(),
            nfts: seed::own_nfts(),
        }
    }
}

impl Default for SeededRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl ExplorerRepository for SeededRepository {
    async fn wallet_summary(&self, address: &str) -> Result<Option<WalletSummary>> {
        if let Some(w) = self.wallets.get(address) {
            return Ok(Some(w.clone()));
        }
        if let Some(w) = self.own_by_addr.get(address) {
            return Ok(Some(w.clone()));
        }
        // Bilinmeyen adres: anonim cüzdan (avatar yok, düşük veri) — boş durum değil.
        if address.len() < 8 {
            return Ok(None);
        }
        Ok(Some(WalletSummary {
            address: address.into(),
            display_name: None,
            avatar_url: None,
            coordinate: None,
            primary_balance: crate::types::AssetAmount {
                amount: "0M".into(),
                symbol: "LUM".into(),
                variant: Some(crate::types::TokenVariant::Sage),
            },
            token_count: 0,
            token_total: crate::types::AssetAmount {
                amount: "0M".into(),
                symbol: "LUM".into(),
                variant: None,
            },
            nft_count: 0,
            recent_transfers: vec![],
            recent_apps: vec![],
        }))
    }

    async fn wallet_relations(&self, address: &str) -> Result<WalletGraph> {
        Ok(graph::build_wallet_graph(address))
    }

    async fn token_distribution(&self, token_id: &str) -> Result<WalletGraph> {
        Ok(graph::build_token_distribution(token_id))
    }

    async fn transactions(&self, filter: TxFilter) -> Result<TransactionPage> {
        let page = filter.page.unwrap_or(0);
        let start = (page as usize) * PAGE_SIZE;
        let items: Vec<TransactionRow> = self
            .all_tx
            .iter()
            .filter(|t| filter.address.as_deref().is_none_or(|a| t.by == a))
            .skip(start)
            .take(PAGE_SIZE)
            .cloned()
            .collect();
        Ok(TransactionPage {
            items,
            cursor: None,
            block: "456789".into(),
            total_pages: (self.all_tx.len().div_ceil(PAGE_SIZE)) as u32,
            page,
        })
    }

    async fn search(&self, query: &str) -> Result<Option<SearchResult>> {
        let q = query.trim();
        if q.is_empty() {
            return Ok(None);
        }
        if let Some(t) = self.tokens.get(&q.to_lowercase()) {
            return Ok(Some(SearchResult::Token {
                token_id: t.id.clone(),
            }));
        }
        // İsimle bilinen cüzdan?
        let by_name = self.wallets.values().find(|w| {
            w.display_name
                .as_deref()
                .map(|n| n.eq_ignore_ascii_case(q))
                .unwrap_or(false)
        });
        if let Some(w) = by_name {
            return Ok(Some(SearchResult::Wallet {
                address: w.address.clone(),
            }));
        }
        Ok(Some(SearchResult::Wallet { address: q.into() }))
    }

    async fn token(&self, id: &str) -> Result<Option<TokenMeta>> {
        Ok(self.tokens.get(&id.to_lowercase()).cloned())
    }

    async fn market_categories(&self) -> Result<Vec<String>> {
        Ok(self.market_categories.clone())
    }

    async fn market(&self) -> Result<Vec<MarketRow>> {
        Ok(self.market.clone())
    }

    async fn trending(&self) -> Result<Vec<TrendingRow>> {
        Ok(self.trending.clone())
    }

    async fn own_accounts(&self) -> Result<Vec<OwnAccount>> {
        Ok(self.own_by_id.values().cloned().collect())
    }

    async fn own_account(&self, id: &str) -> Result<Option<OwnAccount>> {
        Ok(self.own_by_id.get(id).cloned())
    }

    async fn token_holdings(&self) -> Result<Vec<TokenHoldingRow>> {
        Ok(self.holdings.clone())
    }

    async fn nfts(&self) -> Result<Vec<NftHoldingRow>> {
        Ok(self.nfts.clone())
    }

    // Budlum passthrough — tohum veride bu veriler yok; boş/düz metadata döner
    // (node modunda NodeRepository gerçek veriyi verir).
    async fn atlas_wallet_context(&self, address: &str) -> Result<serde_json::Value> {
        Ok(serde_json::json!({
            "address": address, "balance": "0x0", "nonce": "0x0",
            "dataAssets": [], "accessGrants": [], "saleAuthorizations": [],
        }))
    }
    async fn market_offers(&self) -> Result<serde_json::Value> {
        Ok(serde_json::json!([]))
    }
    async fn hub_apps(&self) -> Result<serde_json::Value> {
        Ok(serde_json::json!([]))
    }
    async fn validator_set(&self) -> Result<serde_json::Value> {
        Ok(serde_json::json!({ "validatorAddress": "", "validatorSetHash": "" }))
    }
    async fn consensus_domains(&self) -> Result<serde_json::Value> {
        Ok(serde_json::json!([]))
    }
}

/// Üretim-seviye isim (unused şimdilik; indexer impl için referans).
#[allow(dead_code)]
pub fn default_repository() -> Arc<dyn ExplorerRepository> {
    Arc::new(SeededRepository::new())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::seed::Addresses;

    #[tokio::test]
    async fn seeded_summary_known_and_anon() {
        let r = SeededRepository::new();
        assert!(r.wallet_summary(Addresses::BEYZA).await.unwrap().is_some());
        assert!(r.wallet_summary("short").await.unwrap().is_none());
        let anon = r
            .wallet_summary("0ANONADDRESS1234567890")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(anon.token_count, 0);
    }

    #[tokio::test]
    async fn seeded_search_token_and_wallet() {
        let r = SeededRepository::new();
        assert!(matches!(
            r.search("lum").await.unwrap(),
            Some(SearchResult::Token { .. })
        ));
        assert!(matches!(
            r.search(Addresses::BEYZA).await.unwrap(),
            Some(SearchResult::Wallet { .. })
        ));
        assert!(r.search("").await.unwrap().is_none());
    }

    #[tokio::test]
    async fn seeded_transactions_pagination() {
        let r = SeededRepository::new();
        let p0 = r
            .transactions(TxFilter {
                page: Some(0),
                ..default()
            })
            .await
            .unwrap();
        assert_eq!(p0.page, 0);
        assert!(p0.items.len() <= PAGE_SIZE);
    }

    fn default() -> TxFilter {
        TxFilter {
            address: None,
            counterparty: None,
            page: None,
        }
    }
}
