use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
 #[error("config: {0}")]
 Config(String),
 #[error("not found: {id}")]
 NotFound { id: String },
 #[error("internal: {0}")]
 Internal(String),
}

pub type Result<T> = std::result::Result<T, Error>;
