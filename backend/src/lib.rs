pub mod config;
pub mod error;
pub mod models;
pub mod indexing;
pub mod ranking;
pub mod query;
pub mod freshness;
pub mod diagnostics;
pub mod api;

pub use config::AppConfig;
pub use error::{Error, Result};
pub use models::{Document, QueryRequest, SearchResult, IndexStats};
