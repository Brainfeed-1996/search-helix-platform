use std::time::Duration;
use tracing::{info, warn};

pub struct Indexer {
    publisher: std::sync::Arc<tokio::sync::Notify>,
    docs_indexed: std::sync::atomic::AtomicU64,
    last_index_ts: std::sync::Mutex<Option<std::time::Instant>>,
}

impl Indexer {
    pub fn new(publisher: std::sync::Arc<tokio::sync::Notify>) -> Self {
        Self {
            publisher,
            docs_indexed: std::sync::atomic::AtomicU64::new(0),
            last_index_ts: std::sync::Mutex::new(None),
        }
    }

    pub fn increment(&self, n: u64) {
        self.docs_indexed.fetch_add(n, std::sync::atomic::Ordering::Relaxed);
        *self.last_index_ts.lock().unwrap() = Some(std::time::Instant::now());
        self.publisher.notify_one();
    }

    pub fn count(&self) -> u64 {
        self.docs_indexed.load(std::sync::atomic::Ordering::Relaxed)
    }

    pub fn recent(&self) -> bool {
        self.last_index_ts
            .lock()
            .ok()
            .and_then(|t| *t)
            .map(|t| t.elapsed() < Duration::from_secs(1))
            .unwrap_or(false)
    }
}
