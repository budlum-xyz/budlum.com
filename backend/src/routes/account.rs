//! `/api/accounts*` — kullanıcının kendi hesapları + varlıklar.

use axum::extract::{Path, State};
use axum::Json;

use crate::error::{AppError, Result};
use crate::state::AppState;
use crate::types::{NftHoldingRow, OwnAccount, TokenHoldingRow};

/// `GET /api/accounts` → kullanıcının tüm hesapları.
pub async fn list(State(state): State<AppState>) -> Result<Json<Vec<OwnAccount>>> {
    Ok(Json(state.repo.own_accounts().await?))
}

/// `GET /api/accounts/:id` → tek hesap.
pub async fn detail(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<OwnAccount>> {
    match state.repo.own_account(&id).await? {
        Some(a) => Ok(Json(a)),
        None => Err(AppError::NotFound(format!("account {id}"))),
    }
}

/// `GET /api/accounts/:id/holdings/tokens` → token varlıkları.
pub async fn token_holdings(State(state): State<AppState>) -> Result<Json<Vec<TokenHoldingRow>>> {
    Ok(Json(state.repo.token_holdings().await?))
}

/// `GET /api/accounts/:id/holdings/nfts` → NFT varlıkları.
pub async fn nft_holdings(State(state): State<AppState>) -> Result<Json<Vec<NftHoldingRow>>> {
    Ok(Json(state.repo.nfts().await?))
}
