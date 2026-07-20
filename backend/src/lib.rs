//! budlum-explorer-api — budlum.xyz explorer/wallet websitenin Rust backend'i.
//!
//! Mimari: HTTP handler'lar (`routes`) → `ExplorerRepository` trait'i → veri
//! kaynağı. Şimdi `SeededRepository` (Figma tohum veri); gerçek indexer + DB
//! hazır olunca yeni bir impl aynı trait'e uyar, `app()` içinde değiştirilir —
//! API/tipler sabit. (Kullanıcı kararı: seeded şimdi, indexer'a hazırlık.)

pub mod error;
pub mod graph;
pub mod repo;
pub mod routes;
pub mod seed;
pub mod state;
pub mod types;

pub use repo::{ExplorerRepository, SeededRepository};
pub use state::AppState;

use std::sync::Arc;

use axum::Router;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

/// Üretim router'ı — tohum veri ile. CORS + tracing katmanlı.
pub fn app() -> Router {
    let repo: Arc<dyn ExplorerRepository> = Arc::new(SeededRepository::new());
    let state = AppState::new(repo);
    routes::router(state)
        .layer(TraceLayer::new_for_http())
        // Dev: herhangi köken (Next.js :3000 → API :8080). Prod'da Köken
        // kısıtlanmalı (CorsLayer::new().allow_origin(...)).
        .layer(CorsLayer::permissive())
}
