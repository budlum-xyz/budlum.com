//! budlum-explorer-api — budlum.xyz explorer/wallet websitenin Rust backend'i.
//!
//! Mimari: HTTP handler'lar (`routes`) → `ExplorerRepository` trait'i → veri
//! kaynağı. Şimdi `SeededRepository` (Figma tohum veri); gerçek indexer + DB
//! hazır olunca yeni bir impl aynı trait'e uyar, `app()` içinde değiştirilir —
//! API/tipler sabit. (Kullanıcı kararı: seeded şimdi, indexer'a hazırlık.)

pub mod error;
pub mod graph;
pub mod node;
pub mod node_repo;
pub mod repo;
pub mod routes;
pub mod seed;
pub mod state;
pub mod types;

pub use node_repo::NodeRepository;
pub use repo::{ExplorerRepository, SeededRepository};
pub use state::AppState;

use std::sync::Arc;

use axum::Router;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

/// Veri kaynağını çevre değişkeniyle seçer:
/// - `DATA_SOURCE=node` + `BUDLUM_RPC_URL=http://node:8545` → `NodeRepository`
///   (Budlum node JSON-RPC; zincir durumu node'dan, agregasyonlar seeded fallback).
/// - aksi (varsayılan) → `SeededRepository` (Figma tohum veri).
///
/// Budlum ağı için: node modu gerçek zincir verisi (bakiye, işlem geçmişi, BNS)
/// sunar; tam indexer + DB kurulana kadar grafikler/market seeded kalır.
pub fn app() -> Router {
    let repo: Arc<dyn ExplorerRepository> =
        match std::env::var("DATA_SOURCE").unwrap_or_default().as_str() {
            "node" => {
                let url = std::env::var("BUDLUM_RPC_URL")
                    .unwrap_or_else(|_| "http://127.0.0.1:8545".into());
                tracing::info!(rpc_url = %url, "data source: node (Budlum RPC)");
                Arc::new(NodeRepository::new(url))
            }
            _ => {
                tracing::info!("data source: seeded");
                Arc::new(SeededRepository::new())
            }
        };
    let state = AppState::new(repo);
    routes::router(state)
        .layer(TraceLayer::new_for_http())
        // Dev: herhangi köken (Next.js :3000 → API :8080). Prod'da Köken
        // kısıtlanmalı (CorsLayer::new().allow_origin(...)).
        .layer(CorsLayer::permissive())
}
