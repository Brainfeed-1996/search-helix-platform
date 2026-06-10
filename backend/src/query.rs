use std::collections::HashMap;
use regex::Regex;
use tracing::instrument;

#[derive(Debug, Clone)]
pub struct QueryTokens {
    pub tokens: Vec<String>,
    pub synonyms: HashMap<String, Vec<String>>,
    pub expansions: Vec<String>,
}

pub struct QueryAnalyzer {
    stopwords: Vec<String>,
    synonym_map: HashMap<String, Vec<String>>,
}

impl QueryAnalyzer {
    pub fn new(stopwords: Vec<String>, synonym_map: HashMap<String, Vec<String>>) -> Self {
        Self { stopwords, synonym_map }
    }

    #[instrument(skip(self))]
    pub fn analyze(&self, query: &str) -> QueryTokens {
        let mut tokens = Vec::new();
        let mut expansions = Vec::new();
        let mut synonyms = HashMap::new();

        for term in query.to_lowercase().split_whitespace() {
            let token = term.trim_matches(|c: char| !c.is_alphanumeric());
            if token.is_empty() || self.stopwords.contains(&token.to_string()) {
                continue;
            }

            tokens.push(token.to_string());

            if let Some(syns) = self.synonym_map.get(token) {
                synonyms.insert(token.to_string(), syns.clone());
                expansions.extend(syns.clone());
            }
        }

        expansions.extend(tokens.clone());
        tracing::debug!(tokens=?tokens, expansions=?expansions, "QueryAnalyzer::analyze");
        QueryTokens { tokens, synonyms, expansions }
    }
}

impl Default for QueryAnalyzer {
    fn default() -> Self {
        let stopwords = vec![
            "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux",
            "et", "ou", "mais", "donc", "or", "ni", "car",
            "the", "a", "an", "is", "are", "was", "were", "in", "on", "at"
        ].iter().map(|s| s.to_string()).collect();

        let mut synonym_map = HashMap::new();
        synonym_map.insert("voiture".into(), vec!["automobile".into(), "vehicule".into()]);
        synonym_map.insert("car".into(), vec!["automobile".into()]);
        synonym_map.insert("pc".into(), vec!["ordinateur".into()]);

        Self { stopwords, synonym_map }
    }
}
