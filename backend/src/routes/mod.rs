//! HTTP route handler'ları — `queries/index.ts` imzalarına birebir karşılık.
//! Hepsi `AppState`'ten `ExplorerRepository` alır; veri kaynağından bağımsız.

pub mod account;
pub mod market;
pub mod root;
pub mod search;
pub mod token;
pub mod transactions;
pub mod wallet;

use axum::Router;

use crate::state::AppState;

/// Tüm explorer API route'larını `/api` önekiyle kur.
pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/health", axum::routing::get(root::health))
        .route(
            "/api/wallet/{address}/summary",
            axum::routing::get(wallet::summary),
        )
        .route(
            "/api/wallet/{address}/relations",
            axum::routing::get(wallet::relations),
        )
        .route(
            "/api/token/{id}/distribution",
            axum::routing::get(token::distribution),
        )
        .route("/api/token/{id}", axum::routing::get(token::meta))
        .route("/api/transactions", axum::routing::get(transactions::list))
        .route("/api/search", axum::routing::get(search::search))
        .route("/api/market", axum::routing::get(market::market))
        .route(
            "/api/market/categories",
            axum::routing::get(market::categories),
        )
        .route("/api/trending", axum::routing::get(market::trending))
        .route("/api/accounts", axum::routing::get(account::list))
        .route("/api/accounts/{id}", axum::routing::get(account::detail))
        .route(
            "/api/accounts/{id}/holdings/tokens",
            axum::routing::get(account::token_holdings),
        )
        .route(
            "/api/accounts/{id}/holdings/nfts",
            axum::routing::get(account::nft_holdings),
        )
        .with_state(state)
}
