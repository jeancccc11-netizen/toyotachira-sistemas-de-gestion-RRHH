const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado', detail: err.detail });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia no válida', detail: err.detail });
  }

  if (err.code === '23514') {
    return res.status(400).json({ error: 'Violación de restricción', detail: err.detail });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
