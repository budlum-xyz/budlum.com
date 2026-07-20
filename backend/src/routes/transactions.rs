//! `/api/transactions` — işlem listesi (sayfalı).

use axum::extract::{Query, State};
use axum::Json;
use serde::Deserialize;

use crate::error::Result;
use crate::repo::TxFilter;
use crate::state::AppState;
use crate::types::TransactionPage;

#[derive(Debug, Deserialize, Default)]
pub struct TxQuery {
    pub address: Option<String>,
    pub counterparty: Option<String>,
    pub page: Option<u32>,
}

impl From<TxQuery> for TxFilter {
    fn from(q: TxQuery) -> Self {
        TxFilter {
            address: q.address,
            counterparty: q.counterparty,
            page: q.page,
        }
    }
}

/// `GET /api/transactions?address=&counterparty=&page=` → `getTransactions(...)`.
pub async fn list(
    State(state): State<AppState>,
    Query(q): Query<TxQuery>,
) -> Result<Json<TransactionPage>> {
    Ok(Json(state.repo.transactions(q.into()).await?))
}
