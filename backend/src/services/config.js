
export const config = {
  port: Number(process.env.PORT || 8080),
  host: process.env.HOST || '0.0.0.0',
  indexDir: process.env.INDEX_DIR || './backend/data/index',
  defaultBatchSize: 500,
  refreshIntervalMs: 30000,
};
