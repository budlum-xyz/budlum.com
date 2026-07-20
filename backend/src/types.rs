//! Explorer data contract — birebir port of `src/features/explorer/types/index.ts`
//! (+ fixtures.ts satır tipleri). Parasal değerler decimal STRING (JS number
//! precision kaybı yasak — spec §12). Tüm struct'lar `camelCase` serialize eder
//! böylece frontend TypeScript tipleriyle birebir uyumlu.

use serde::{Deserialize, Serialize};

/// "2M", "100.3K" gibi formatlanmış VEYA ham decimal string.
pub type DecimalString = String;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum TokenVariant {
    Sage,
    Ink,
    Purple,
    Tan,
    Rose,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetAmount {
    pub amount: DecimalString,
    pub symbol: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variant: Option<TokenVariant>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransferPreview {
    pub id: String,
    pub amount: DecimalString,
    pub symbol: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variant: Option<TokenVariant>,
    pub counterparty: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub counterparty_asset: Option<AssetAmount>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub enum AppCategory {
    Defi,
    Gamefi,
    Socialfi,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AppIcon {
    Lum,
    Fiction,
    Bud,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppUsage {
    pub id: String,
    pub name: String,
    pub category: AppCategory,
    pub icon: AppIcon,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Coordinate {
    pub x: f64,
    pub y: f64,
}

/// Cüzdan özet kartı — `/api/wallet/:address/summary`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletSummary {
    pub address: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub coordinate: Option<Coordinate>,
    pub primary_balance: AssetAmount,
    pub token_count: u32,
    pub token_total: AssetAmount,
    pub nft_count: u32,
    pub recent_transfers: Vec<TransferPreview>,
    pub recent_apps: Vec<AppUsage>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GraphNodeKind {
    Wallet,
    Token,
    Holder,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GraphVisualVariant {
    Stone,
    Star,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphNode {
    pub id: String,
    pub kind: GraphNodeKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub share_pct: Option<f64>,
    pub x: f64,
    pub y: f64,
    pub size: f64,
    pub visual_variant: GraphVisualVariant,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stone_index: Option<u32>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GraphRelation {
    Transfer,
    Distribution,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphEdge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub relation: GraphRelation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WalletGraph {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionRow {
    pub signature: String,
    pub time: String, // UTC ISO 8601
    pub instruction: String,
    pub by: String,
    pub value: DecimalString,
    pub fee: DecimalString,
    pub contract: bool,
    pub variant: TokenVariant,
}

/// İşlem sayfalama — `/api/transactions`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionPage {
    pub items: Vec<TransactionRow>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
    pub block: String,
    pub total_pages: u32,
    pub page: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum SearchResult {
    Wallet {
        address: String,
    },
    Token {
        #[serde(rename = "tokenId")]
        token_id: String,
    },
}

// ── fixtures.ts satır tipleri (market / accounts / holdings) ────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenMeta {
    pub id: String,
    pub symbol: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnAccount {
    pub id: String,
    pub name: String,
    pub address: String,
    pub coordinate: Coordinate,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar_url: Option<String>,
    pub summary: WalletSummary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenHoldingRow {
    pub id: String,
    pub amount: String,
    pub symbol: String,
    pub fiat: String,
    pub variant: TokenVariant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NftHoldingRow {
    pub id: String,
    pub name: String,
    pub caption: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketRow {
    pub id: String,
    pub token: String,
    pub verified: bool,
    pub symbol: String,
    pub price: String,
    pub market_cap: String,
    pub holders: String,
    pub last_week: String,
    pub last_year: String,
    pub address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendingRow {
    pub rank: u32,
    pub name: String,
    pub category: AppCategory,
    pub icon: AppIcon,
}
