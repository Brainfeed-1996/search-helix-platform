use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use tracing::{info, warn, instrument};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryTrace {
    pub query_id: String,
    pub query: String,
    pub processing_ms: u128,
    pub result_count: usize,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatencyStats {
    pub avg: f64,
    pub p50: f64,
    pub p95: f64,
    pub p99: f64,
}

impl LatencyStats {
    pub fn new(mut samples: Vec<f64>) -> Self {
        if samples.is_empty() {
            return Self { avg: 0.0, p50: 0.0, p95: 0.0, p99: 0.0 };
        }
        samples.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let avg = samples.iter().sum::<f64>() / samples.len() as f64;
        let p50 = percentile(&samples, 50.0);
        let p95 = percentile(&samples, 95.0);
        let p99 = percentile(&samples, 99.0);
        Self { avg, p50, p95, p99 }
    }
}

fn percentile(sorted: &[f64], p: f64) -> f64 {
    let idx = ((p / 100.0) * (sorted.len() as f64 - 1.0)).round() as usize;
    sorted.get(idx).copied().unwrap_or(0.0)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchAnalytics {
    pub avg_latency: f64,
    pub queries_per_min: f64,
    pub cache_hit_ratio: f64,
    pub unique_queries: usize,
}
