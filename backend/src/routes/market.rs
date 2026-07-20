//! `/api/market*`, `/api/trending` — market listesi ve öne çıkanlar.

use axum::extract::State;
use axum::Json;

use crate::error::Result;
use crate::state::AppState;
use crate::types::{MarketRow, TrendingRow};

/// `GET /api/market` → token market satırları.
pub async fn market(State(state): State<AppState>) -> Result<Json<Vec<MarketRow>>> {
    Ok(Json(state.repo.market().await?))
}

/// `GET /api/market/categories` → market kategori listesi.
pub async fn categories(State(state): State<AppState>) -> Result<Json<Vec<String>>> {
    Ok(Json(state.repo.market_categories().await?))
}

/// `GET /api/trending` → öne çıkan uygulamalar (top ranks).
pub async fn trending(State(state): State<AppState>) -> Result<Json<Vec<TrendingRow>>> {
    Ok(Json(state.repo.trending().await?))
}
