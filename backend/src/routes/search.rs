//! `/api/search` — evrensel arama sınıflandırması.

use axum::extract::{Query, State};
use axum::Json;
use serde::Deserialize;

use crate::error::Result;
use crate::state::AppState;
use crate::types::SearchResult;

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
}

/// `GET /api/search?q=` → `classifyQuery(q)`.
pub async fn search(
    State(state): State<AppState>,
    Query(q): Query<SearchQuery>,
) -> Result<Json<Option<SearchResult>>> {
    let q = q.q.unwrap_or_default();
    Ok(Json(state.repo.search(&q).await?))
}
