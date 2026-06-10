use std::collections::HashMap;
use tracing::{info, instrument};

pub fn bm25_score(term_freq: u32, doc_len: u32, avg_doc_len: f32, corpus_doc_count: u32, doc_freq: u32) -> f32 {
    if doc_freq == 0 || avg_doc_len < 1.0 {
        return 0.0;
    }
    let tf = term_freq as f32;
    let dl = doc_len as f32;
    let k1 = 1.2f32;
    let b = 0.75f32;

    let idf = ((corpus_doc_count - doc_freq + 0.5) as f32 / (doc_freq + 0.5) as f32).ln_1p();
    let tf_norm = (tf * (k1 + 1.0)) / (tf + k1 * (1.0 - b + b * (dl / avg_doc_len)));
    idf * tf_norm
}

#[derive(Debug, Clone)]
pub struct RankedDocument {
    pub id: String,
    pub score: f32,
    pub bm25_score: f32,
    pub freshness_score: f32,
    pub title: String,
    pub url: Option<String>,
    pub snippet: String,
}

#[derive(Default)]
pub struct RankingEngine {
    avg_doc_len: f32,
    corpus_doc_count: u32,
    field_lengths: HashMap<String, u64>,
}

impl RankingEngine {
    pub fn update_index_stats(&mut self, doc_count: u32, avg_len: f32) {
        self.corpus_doc_count = doc_count;
        self.avg_doc_len = avg_len;
    }

    pub fn rank(&self, candidates: &mut [&DocumentHit], freshness_boost: bool) {
        if candidates.is_empty() {
            return;
        }
        for doc in candidates.iter_mut() {
            let mut score = doc.bm25_score.max(0.0001);
            if freshness_boost {
                let age_days = doc.age_days as f32;
                let freshness = 1.0 / (1.0 + age_days / 30.0);
                score *= 0.7 + 0.3 * freshness;
            }
            doc.score = score;
        }
        candidates.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    }
}

#[derive(Debug, Clone)]
pub struct DocumentHit {
    pub id: String,
    pub bm25_score: f32,
    pub freshness_score: f32,
    pub age_days: u32,
    pub title: String,
    pub url: Option<String>,
    pub snippet: String,
}

pub mod boosting {
    pub fn title_boost(term_count: usize) -> f32 {
        (term_count as f32).ln_1p() * 1.5
    }

    pub fn body_boost(length: usize, matches: usize) -> f32 {
        if length == 0 {
            return 0.0;
        }
        (matches as f32 / length as f32) * 1.0
    }

    pub fn tag_boost(tag_matches: usize) -> f32 {
        (tag_matches as f32) * 2.0
    }

    pub fn freshness_linear(updated_at: chrono::DateTime<chrono::Utc>) -> f32 {
        let now = chrono::Utc::now();
        let days = (now - updated_at).num_abs().max(0) as f32 / 86400.0;
        1.0 / (1.0 + days * 0.05)
    }
}
