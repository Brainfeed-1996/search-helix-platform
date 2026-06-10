use search_helix::*;
use axum::{routing::get, Router};
use std::sync::Arc;
#[tokio::main]
async fn main() -> anyhow::Result<()> {
 tracing_subscriber::fmt().with_env_filter("info").init();
 let cfg = AppConfig::load()?;
 let app = Router::new().route("/health", get(|| async { "ok" }));
 let addr = format!("{}:{}", cfg.server.host, cfg.server.port);
 let listener = tokio::net::TcpListener::bind(&addr).await?;
 println!("Listening on {addr}");
 axum::serve(listener, app).await?;
 Ok(())
}
