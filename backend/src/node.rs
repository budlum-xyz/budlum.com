//! Budlum node JSON-RPC istemcisi — budlum çekirdek (`budlum-xyz/budlum`)
//! `src/rpc/server.rs` RPC yüzeyine birebir bağlı. Metot adları, parametre ve
//! dönüş şekilleri çekirdek RPC'den doğrudan (Budlum-uyumluluğun kaynağı):
//!   bud_blockNumber() -> hex
//!   bud_getBalance(addr) -> hex
//!   bud_getNonce(addr) -> hex
//!   bud_getBlockByNumber(n) -> block json | null
//!   bud_getTransactionByHash(h) -> tx json | null
//!   bud_getStatus() -> {height, chainId, mempool, baseFee, validatorSetHash,...}
//!   bud_bnsResolve(name) -> address | null
//!
//! Budlum adres formatı ve tx modeli (from/to/amount/fee/nonce/type) Ethereum
//! değil, Budlum'a özgü. Tel tipler (TxWire/BlockWire) Budlum RPC JSON'una
//! birebir; explorer tiplerine (TransactionRow vb.) çevrim `*_to_*` fonksiyonları.

use serde::{de::DeserializeOwned, Deserialize, Serialize};

use crate::error::{AppError, Result};
use crate::types::{TokenVariant, TransactionRow};

/// Budlum node RPC JSON-RPC istemcisi.
#[derive(Clone)]
pub struct BudlumNodeClient {
    http: reqwest::Client,
    url: String,
}

impl BudlumNodeClient {
    pub fn new(url: String) -> Self {
        Self {
            http: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(10))
                .build()
                .expect("reqwest client"),
            url,
        }
    }

    /// Tek bir JSON-RPC çağrısı — `result` alanını döndürür.
    async fn rpc<T: DeserializeOwned>(&self, method: &str, params: serde_json::Value) -> Result<T> {
        #[derive(Serialize)]
        struct Req<'a> {
            jsonrpc: &'a str,
            method: &'a str,
            params: serde_json::Value,
            id: u64,
        }
        let req = Req {
            jsonrpc: "2.0",
            method,
            params,
            id: 1,
        };
        let resp: serde_json::Value = self
            .http
            .post(&self.url)
            .json(&req)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("node rpc {method}: {e}")))?
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("node rpc {method} decode: {e}")))?;
        if let Some(err) = resp.get("error") {
            return Err(AppError::Internal(format!("node rpc {method}: {}", err)));
        }
        let result = resp
            .get("result")
            .ok_or_else(|| AppError::Internal(format!("node rpc {method}: result yok")))?;
        serde_json::from_value(result.clone())
            .map_err(|e| AppError::Internal(format!("node rpc {method} tip: {e}")))
    }

    pub async fn block_number(&self) -> Result<u64> {
        let h: String = self.rpc("bud_blockNumber", serde_json::json!([])).await?;
        Ok(parse_hex_u64(&h).unwrap_or(0))
    }

    pub async fn get_balance(&self, address: &str) -> Result<u64> {
        let b: String = self
            .rpc("bud_getBalance", serde_json::json!([address]))
            .await?;
        Ok(parse_hex_u64(&b).unwrap_or(0))
    }

    pub async fn get_nonce(&self, address: &str) -> Result<u64> {
        let n: String = self
            .rpc("bud_getNonce", serde_json::json!([address]))
            .await?;
        Ok(parse_hex_u64(&n).unwrap_or(0))
    }

    pub async fn get_block_by_number(&self, number: u64) -> Result<Option<BlockWire>> {
        self.rpc("bud_getBlockByNumber", serde_json::json!([number]))
            .await
    }

    pub async fn get_transaction_by_hash(&self, hash: &str) -> Result<Option<TxWire>> {
        self.rpc("bud_getTransactionByHash", serde_json::json!([hash]))
            .await
    }

    pub async fn get_status(&self) -> Result<StatusWire> {
        self.rpc("bud_getStatus", serde_json::json!([])).await
    }

    /// BNS: isim (.bud) → adres. Bulunamazsa None.
    pub async fn bns_resolve(&self, name: &str) -> Result<Option<String>> {
        // Çekirdek null dönebilir — serde null → Option<String>::None.
        self.rpc("bud_bnsResolve", serde_json::json!([name])).await
    }

    // ── Budlum veri modeli pass-through (gerçek şekliyle; Figma tiplerine
    //    zorla çevrilmez — frontend gerçek Budlum verisini consumes eder). ──

    /// `bud_atlasGetWalletContext` — zengin cüzdan bağlamı (bakiye, nonce,
    /// Pollen dataAssets, accessGrants, saleAuthorizations). Explorer wallet/me
    /// sayfaları için Budlum-native kaynak.
    pub async fn atlas_wallet_context(&self, address: &str) -> Result<serde_json::Value> {
        self.rpc_value("bud_atlasGetWalletContext", serde_json::json!([address]))
            .await
    }

    /// `bud_marketGetOffers` — Pollen veri-pazarı teklifleri (DataOffer[]:
    /// seller, cid, price $BUD, active). Market sayfası için gerçek veri.
    pub async fn market_offers(&self) -> Result<serde_json::Value> {
        self.rpc_value("bud_marketGetOffers", serde_json::json!([]))
            .await
    }

    /// `bud_hubGetApps` — hub uygulamaları. recentApps / hub sayfası için.
    pub async fn hub_apps(&self) -> Result<serde_json::Value> {
        self.rpc_value("bud_hubGetApps", serde_json::json!([]))
            .await
    }

    /// `bud_getValidatorSet` — {validatorAddress, validatorSetHash}.
    pub async fn validator_set(&self) -> Result<serde_json::Value> {
        self.rpc_value("bud_getValidatorSet", serde_json::json!([]))
            .await
    }

    /// `bud_getStatus` zaten var; `bud_getConsensusDomains` — domain listesi.
    pub async fn consensus_domains(&self) -> Result<serde_json::Value> {
        self.rpc_value("bud_getConsensusDomains", serde_json::json!([]))
            .await
    }

    /// Generic JSON-RPC — `result` alanını ham Value olarak döndürür (pass-through).
    pub async fn rpc_value(
        &self,
        method: &str,
        params: serde_json::Value,
    ) -> Result<serde_json::Value> {
        self.rpc::<serde_json::Value>(method, params).await
    }
}

// ── Budlum RPC tel tipleri (çekirdek tx_to_json/block_to_json ile birebir) ──

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TxWire {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub amount: String,    // hex
    pub fee: String,       // hex
    pub nonce: String,     // hex
    pub timestamp: String, // hex
    #[serde(rename = "type")]
    pub tx_type: String, // Transfer | Stake | BridgeLock | ... (Debug fmt)
    pub chain_id: String,
    #[serde(default)]
    pub signature: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BlockWire {
    pub number: String,      // hex
    pub hash: String,        // 0x...
    pub parent_hash: String, // 0x...
    pub timestamp: String,   // hex
    pub transactions: Vec<TxWire>,
    #[serde(default)]
    pub producer: Option<String>,
    #[serde(default)]
    pub state_root: Option<String>,
    #[serde(default)]
    pub tx_root: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusWire {
    pub height: String, // hex
    #[serde(default)]
    pub chain_id: String,
    #[serde(default)]
    pub mempool: String,
    #[serde(default)]
    pub base_fee: String,
    #[serde(default)]
    pub validator_set_hash: String,
}

// ── çevirim: Budlum tel → explorer tipleri ───────────────────────────────────

/// `TxWire` → `TransactionRow` (frontend sözleşmesi). instruction = gerçek
/// Budlum tx tipi (Transfer/bridgeLock/...), küçük harf. contract = transfer
/// dışı (governance/bridge/special). value/fee = hex→decimal (u64).
pub fn tx_wire_to_row(t: &TxWire) -> TransactionRow {
    let instr = t.tx_type.to_lowercase();
    TransactionRow {
        signature: t.hash.clone(),
        time: hex_timestamp_to_iso(&t.timestamp),
        instruction: instr.clone(),
        by: t.from.clone(),
        value: parse_hex_u64(&t.amount).unwrap_or(0).to_string(),
        fee: parse_hex_u64(&t.fee).unwrap_or(0).to_string(),
        contract: !instr.eq_ignore_ascii_case("transfer"),
        variant: TokenVariant::Sage,
    }
}

/// "0x1a2" → 418.
pub fn parse_hex_u64(s: &str) -> Option<u64> {
    let s = s.strip_prefix("0x").unwrap_or(s);
    if s.is_empty() {
        return Some(0);
    }
    u64::from_str_radix(s, 16).ok()
}

/// Budlum timestamp (hex) → ISO 8601 UTC. Çekirdek ms veya sn verebilir;
/// 1e12 üstü ms, 1e9 üstü sn kabul edilir (canlı node'ta teyit edilmeli).
pub fn hex_timestamp_to_iso(hex: &str) -> String {
    let v = parse_hex_u64(hex).unwrap_or(0);
    let ms = if v >= 1_000_000_000_000 {
        v as i64
    } else if v >= 1_000_000_000 {
        v as i64 * 1000
    } else {
        0
    };
    iso_utc_from_ms(ms)
}

fn iso_utc_from_ms(epoch_ms: i64) -> String {
    let secs = epoch_ms.div_euclid(1000);
    let millis = epoch_ms.rem_euclid(1000);
    let (y, mo, d, h, mi, s) = civil_from_secs(secs);
    format!("{y:04}-{mo:02}-{d:02}T{h:02}:{mi:02}:{s:02}.{millis:03}Z")
}

/// epoch saniye → (Y,M,D,h,m,s) UTC (Howard Hinnant civil_from_days).
fn civil_from_secs(secs: i64) -> (i32, u32, u32, u32, u32, u32) {
    let days = secs.div_euclid(86_400);
    let rem = secs.rem_euclid(86_400);
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let m = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    let year = if m <= 2 { y + 1 } else { y } as i32;
    (
        year,
        m,
        d,
        (rem / 3600) as u32,
        ((rem % 3600) / 60) as u32,
        (rem % 60) as u32,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_hex_handles_0x_and_zero() {
        assert_eq!(parse_hex_u64("0x0"), Some(0));
        assert_eq!(parse_hex_u64("0x1a2"), Some(418));
        assert_eq!(parse_hex_u64(""), Some(0));
        assert_eq!(parse_hex_u64("0x"), Some(0));
        assert_eq!(parse_hex_u64("zz"), None);
    }

    #[test]
    fn tx_wire_translates_to_row() {
        // Budlum RPC tx_to_json şekli (cekirdek).
        let json = serde_json::json!({
            "hash": "0xabc1",
            "from": "0243a86yu4Fq9tR2vLm8sK1pWdhtA6opA",
            "to": "04533a8ru7Kp2mN9cX4vB6qJs1htA64ep",
            "amount": "0xe8d4a51000", // 1_000_000_000_000
            "fee": "0x2e",           // 46
            "nonce": "0x7",
            "timestamp": "0x18e1f5c9e00",
            "type": "Transfer",
            "chainId": "0x539",
            "signature": "0xdeadbeef"
        });
        let tx: TxWire = serde_json::from_value(json).unwrap();
        let row = tx_wire_to_row(&tx);
        assert_eq!(row.by, "0243a86yu4Fq9tR2vLm8sK1pWdhtA6opA");
        assert_eq!(row.value, "1000000000000");
        assert_eq!(row.fee, "46");
        assert_eq!(row.instruction, "transfer");
        assert!(!row.contract); // Transfer değil => contract=false
        assert!(row.time.ends_with('Z'));
    }

    #[test]
    fn tx_wire_non_transfer_is_contract() {
        let tx = TxWire {
            hash: "0x1".into(),
            from: "a".into(),
            to: "b".into(),
            amount: "0x0".into(),
            fee: "0x0".into(),
            nonce: "0x0".into(),
            timestamp: "0x0".into(),
            tx_type: "BridgeLock".into(),
            chain_id: "0x539".into(),
            signature: None,
        };
        let row = tx_wire_to_row(&tx);
        assert!(row.contract);
        assert_eq!(row.instruction, "bridgelock");
    }

    #[test]
    fn block_wire_deserializes_budlum_shape() {
        let json = serde_json::json!({
            "number": "0x10", "hash": "0xhh", "parentHash": "0xpp",
            "timestamp": "0x5f5e100", "transactions": [],
            "producer": "0243a86yu4Fq9tR2vLm8sK1pWdhtA6opA",
            "stateRoot": null, "txRoot": "0xtt"
        });
        let b: BlockWire = serde_json::from_value(json).unwrap();
        assert_eq!(parse_hex_u64(&b.number), Some(16));
        assert_eq!(
            b.producer.as_deref(),
            Some("0243a86yu4Fq9tR2vLm8sK1pWdhtA6opA")
        );
        assert!(b.state_root.is_none());
    }
}
