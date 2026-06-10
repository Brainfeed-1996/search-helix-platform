use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
 pub id: String,
 pub title: String,
 pub body: String,
 pub url: Option<String>,
 pub tags: Vec<String>,
 pub lang: Option<String>,
 pub freshness: f64,
 pub created_at: DateTime<Utc>,
 pub updated_at: DateTime<Utc>,
 pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryRequest {
 pub q: String,
 pub limit: Option<usize>,
 pub offset: Option<usize>,
 pub fields: Option<Vec<String>>,
 pub filters: Option<serde_json::Value>,
 pub sort: Option<String>,
 pub facets: Option<bool>,
 pub spellcheck: Option<bool>,
 pub session_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
 pub id: String,
 pub score: f64,
 pub title: String,
 pub url: Option<String>,
 pub snippet: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStats {
 pub doc_count: u64,
 pub term_count: u64,
 pub size_bytes: u64,
 pub last_indexed: Option<DateTime<Utc>>,
 pub avg_latency_ms: f64,
 pub p95_latency_ms: f64,
 pub p99_latency_ms: f64,
}
