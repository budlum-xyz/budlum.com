//! Sağlık kontrolü.

use axum::Json;
use serde_json::{json, Value};

use crate::error::Result;

pub async fn health() -> Result<Json<Value>> {
    Ok(Json(json!({
        "status": "ok",
        "service": "budlum-explorer-api",
        "dataSource": "seeded",
        "ready": true,
    })))
}
