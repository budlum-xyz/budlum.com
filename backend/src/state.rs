//! Uygulama durumu — axum State ile handler'lara taşınır.
//! Veri kaynağını `Arc<dyn ExplorerRepository>` olarak tutar; indexer impl
//! geldiğinde main.rs'de değiştirilir, handler'lar dokunulmaz.

use std::sync::Arc;

use crate::repo::ExplorerRepository;

#[derive(Clone)]
pub struct AppState {
    pub repo: Arc<dyn ExplorerRepository>,
}

impl AppState {
    pub fn new(repo: Arc<dyn ExplorerRepository>) -> Self {
        Self { repo }
    }
}
