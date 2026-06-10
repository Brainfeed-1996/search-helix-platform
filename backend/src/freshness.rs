use std::time::{Duration, Instant};
use chrono::{DateTime, Utc};
use tracing::instrument;

pub struct FreshnessConfig {
    pub default_ttl_days: i64,
    pub refresh_interval: Duration,
    pub forgetting_limit: usize,
}

impl Default for FreshnessConfig {
    fn default() -> Self {
        Self {
            default_ttl_days: 30,
            refresh_interval: Duration::from_secs(60),
            forgetting_limit: 128,
        }
    }
}

#[derive(Debug, Clone)]
pub struct DocumentWithFreshness {
    pub id: String,
    pub ttl: Duration,
    pub created_at: DateTime<Utc>,
}

impl DocumentWithFreshness {
    pub fn is_expired(&self) -> bool {
        let now = Utc::now();
        let expiry = self.created_at + chrono::Duration::days(30);
        now > expiry
    }
}

pub struct FreshnessManager {
    config: FreshnessConfig,
    documents: std::sync::Mutex<HashMap<String, DocumentWithFreshness>>,
}

impl FreshnessManager {
    pub fn new() -> Self {
        Self {
            config: FreshnessConfig::default(),
            documents: std::sync::Mutex::new(HashMap::new()),
        }
    }

    pub async fn run(self: &std::sync::Arc<Self>) {
        loop {
            tokio::time::sleep(self.config.refresh_interval).await;
            let expired: Vec<String> = self
                .documents
                .lock()
                .unwrap()
                .values()
                .filter(|doc| doc.is_expired())
                .map(|doc| doc.id.clone())
                .collect();

            for id in expired {
                self.documents.lock().unwrap().remove(&id);
            }
        }
    }
}

#[derive(Debug)]
pub struct TtlManager;

impl TtlManager {
    pub fn compute_ttl(&self, updated_at: DateTime<Utc>, freshness: f32) -> Duration {
        let base_ttl = chrono::Duration::days(30);
        let boost = (1.0 - freshness) as i64;
        let final_days = 30 + boost;
        Duration::from_secs((final_days * 86400).max(0) as u64)
    }
}

pub mod scoring {
    pub fn freshness_score(updated_at: chrono::DateTime<chrono::Utc>, max_age_days: i32) -> f32 {
        let now = chrono::Utc::now();
        let age_days = (now - updated_at).num_abs().max(0) as f32 / 86_400.0;
        let age_days = age_days.min(max_age_days as f32);
        let freshness = 1.0 - (age_days / (max_age_days as f32 - 1.0).max(1.0));
        freshness.max(0.0)
    }
}
