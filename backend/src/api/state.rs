use std::sync::Arc;
use axum::async_trait;
use tracing::instrument;

pub struct AppState {
    pub index: Arc<dyn search_helix::indexing::IndexTrait + Send + Sync>,
    pub searcher: Arc<search_helix::query::Searcher>,
    pub analytics: Arc<search_helix::diagnostics::AnalyticsStore>,
}

#[async_trait]
pub trait IndexTrait: Send + Sync {
    async fn upsert(&self, doc: search_helix::models::Document) -> anyhow::Result<()>;
    async fn delete(&self, id: &str) -> anyhow::Result<()>;
    async fn commit(&self) -> anyhow::Result<()>;
    async fn flush(&self) -> anyhow::Result<()>;
    async fn stats(&self) -> anyhow::Result<search_helix::models::IndexStats>;
}
