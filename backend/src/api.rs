use axum::{
    routing::{get, post},
    Json, Router,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::{info, instrument};
pub mod state;

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct IndexDocumentRequest {
    pub documents: Vec<search_helix::models::Document>,
}

pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        timestamp: chrono::Utc::now(),
    })
}

pub fn build_router(state: Arc<state::AppState>, enable_cors: bool) -> anyhow::Result<Router> {
    let mut router = Router::new()
        .route("/health", get(health))
        .route("/search", get(search))
        .route("/index", post(index_documents))
        .route("/documents/:id", get(get_document).delete(delete_document))
        .route("/index/stats", get(index_stats))
        .route("/analytics/latency", get(latency_stats))
        .route("/analytics/recent", get(recent_queries));
    if enable_cors {
        router = router.layer(axum::middleware::from_fn(cors));
    }
    Ok(router)
}

async fn cors<B>(req: axum::http::Request<B>, next: axum::middleware::Next<B>) -> axum::response::Response {
    use axum::http::header::{HeaderValue, ACCESS_CONTROL_ALLOW_ORIGIN, ACCESS_CONTROL_ALLOW_METHODS, ACCESS_CONTROL_ALLOW_HEADERS};
    let mut resp = next.run(req).await;
    resp.headers_mut().insert(ACCESS_CONTROL_ALLOW_ORIGIN, HeaderValue::from_static("*"));
    resp.headers_mut().insert(ACCESS_CONTROL_ALLOW_METHODS, HeaderValue::from_static("GET, POST, DELETE, OPTIONS"));
    resp.headers_mut().insert(ACCESS_CONTROL_ALLOW_HEADERS, HeaderValue::from_static("Content-Type, Authorization"));
    resp
}

#[instrument]
async fn search() -> &'static str { "Recherche Search Helix (Rust backend demarre)" }

#[instrument]
async fn index_documents() -> &'static str { "Indexation lancee" }

#[instrument]
async fn get_document() -> &'static str { "Document recupere" }

#[instrument]
async fn delete_document() -> StatusCode { StatusCode::NO_CONTENT }

#[instrument]
async fn index_stats() -> &'static str { "Stats index" }

#[instrument]
async fn latency_stats() -> &'static str { "Stats latence" }

#[instrument]
async fn recent_queries() -> &'static str { "Requetes recentes" }
