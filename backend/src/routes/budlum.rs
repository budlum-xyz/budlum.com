//! Budlum-native pass-through endpoint'leri — Budlum node RPC'sinin gerçek
//! veri modelini olduğu gibi expose eder (Figma tiplerine zorla çevrilmez).
//!
//! Frontend (Budlum-ağı uyumlu) bu endpoint'lerden gerçek zincir verisini
//! alır: cüzdan bağlamı (Pollen dataAssets dahil), veri-pazarı teklifleri,
//! hub uygulamaları, validator seti, konsensus domain'leri.

use axum::extract::{Path, State};
use axum::Json;
use serde_json::Value;

use crate::error::Result;
use crate::state::AppState;

/// `GET /api/wallet/:address/context` — `bud_atlasGetWalletContext`.
/// Bakiye, nonce, Pollen dataAssets / accessGrants / saleAuthorizations.
pub async fn wallet_context(
    State(state): State<AppState>,
    Path(address): Path<String>,
) -> Result<Json<Value>> {
    Ok(Json(state.repo.atlas_wallet_context(&address).await?))
}

/// `GET /api/market/offers` — `bud_marketGetOffers` (Pollen DataOffer[]).
pub async fn market_offers(State(state): State<AppState>) -> Result<Json<Value>> {
    Ok(Json(state.repo.market_offers().await?))
}

/// `GET /api/hub/apps` — `bud_hubGetApps`.
pub async fn hub_apps(State(state): State<AppState>) -> Result<Json<Value>> {
    Ok(Json(state.repo.hub_apps().await?))
}

/// `GET /api/validators` — `bud_getValidatorSet`.
pub async fn validators(State(state): State<AppState>) -> Result<Json<Value>> {
    Ok(Json(state.repo.validator_set().await?))
}

/// `GET /api/consensus-domains` — `bud_getConsensusDomains`.
pub async fn consensus_domains(State(state): State<AppState>) -> Result<Json<Value>> {
    Ok(Json(state.repo.consensus_domains().await?))
}
