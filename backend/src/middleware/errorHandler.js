
export default (err, req, res, next) => {
  const status = err.status || 500;
  console.error(err);
  res.status(status).json({ error: { code: err.code || 'INTERNAL', message: err.message || 'Erreur interne' } });
};
