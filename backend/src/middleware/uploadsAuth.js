const path = require('path');
const fs = require('fs');

/**
 * Sirve los archivos de /uploads SOLO a peticiones autenticadas.
 * Acepta el token por header Authorization o por query (?token=...) porque
 * <img src> no puede enviar headers.
 */
module.exports = function uploadsAuth(env) {
  const baseDir = path.resolve(env.uploadDir);

  return (req, res, next) => {
    const header = req.headers.authorization;
    const token = (header && header.startsWith('Bearer ')
      ? header.slice(7)
      : req.query.token) || '';

    let payload;
    try {
      payload = require('jsonwebtoken').verify(token, env.jwtSecret);
    } catch {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    // Resuelve y acota la ruta dentro del directorio de uploads
    const filePath = path.resolve(path.join(baseDir, req.path));
    if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
      return res.status(403).json({ error: 'Ruta no permitida' });
    }

    fs.stat(filePath, (err, st) => {
      if (err || !st.isFile()) return res.status(404).json({ error: 'Archivo no encontrado' });
      res.sendFile(filePath);
    });
  };
};
