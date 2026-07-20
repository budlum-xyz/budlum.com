//! `/api/token/:id/*` — token dağılım grafiği ve metadata.

use axum::extract::{Path, State};
use axum::Json;

use crate::error::{AppError, Result};
use crate::state::AppState;
use crate::types::{TokenMeta, WalletGraph};

/// `GET /api/token/:id/distribution` → `getTokenDistribution(tokenId)`.
pub async fn distribution(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<WalletGraph>> {
    Ok(Json(state.repo.token_distribution(&id).await?))
}

/// `GET /api/token/:id` → token metadata.
pub async fn meta(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<TokenMeta>> {
    match state.repo.token(&id).await? {
        Some(t) => Ok(Json(t)),
        None => Err(AppError::NotFound(format!("token {id}"))),
    }
}
