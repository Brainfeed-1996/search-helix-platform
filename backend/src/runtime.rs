use std::future::Future;
use tokio::runtime::Runtime;

pub fn create() -> Runtime {
    Runtime::new().expect("FATAL: impossible de créer le runtime Tokio")
}
