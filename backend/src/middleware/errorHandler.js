const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Errores de subida (multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'El archivo excede el tamaño máximo permitido' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Archivo inválido: ${err.message}` });
  }
  // JSON malformado
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  // Origen bloqueado por la lista blanca de CORS
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: err.message });
  }

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
