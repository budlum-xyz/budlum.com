//! `/api/wallet/:address/*` — cüzdan özeti ve ilişki grafiği.

use axum::extract::{Path, State};
use axum::Json;

use crate::error::{AppError, Result};
use crate::state::AppState;
use crate::types::{WalletGraph, WalletSummary};

/// `GET /api/wallet/:address/summary` → `getWalletSummary(address)`.
///
/// Bilinmeyen adres için anonim cüzdan döner (frontend ile aynı kural);
/// yalnızca çok kısa adresler (<8) için 404.
pub async fn summary(
    State(state): State<AppState>,
    Path(address): Path<String>,
) -> Result<Json<WalletSummary>> {
    match state.repo.wallet_summary(&address).await? {
        Some(s) => Ok(Json(s)),
        None => Err(AppError::NotFound(format!("wallet {address}"))),
    }
}

/// `GET /api/wallet/:address/relations` → `getWalletRelations(address)`.
pub async fn relations(
    State(state): State<AppState>,
    Path(address): Path<String>,
) -> Result<Json<WalletGraph>> {
    Ok(Json(state.repo.wallet_relations(&address).await?))
}
