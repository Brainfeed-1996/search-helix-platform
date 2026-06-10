use serde::Deserialize;
#[derive(Debug, Clone, Deserialize)]
pub struct ServerConfig { pub host: String, pub port: u16 }
#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig { pub path: String }
#[derive(Debug, Clone, Deserialize)]
pub struct AppConfig { pub server: ServerConfig, pub database: DatabaseConfig, pub otel_enabled: bool }
impl AppConfig {
 pub fn load() -> anyhow::Result<Self> {
 Ok(Self {
 server: ServerConfig { host: std::env::var("SEARCH_HELIX_SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()), port: std::env::var("SEARCH_HELIX_SERVER_PORT").ok().and_then(|s| s.parse().ok()).unwrap_or(8080), },
 database: DatabaseConfig { path: std::env::var("SEARCH_HELIX_DATABASE_PATH").unwrap_or_else(|_| "./data/index".to_string()), },
 otel_enabled: std::env::var("SEARCH_HELIX_OTEL_ENABLED").ok().and_then(|s| s.parse().ok()).unwrap_or(false),
 })
 }
}
