const { query } = require('../config/database');

const DocumentoFolders = {
  getFoldersByEmpleado: (empleadoId) =>
    query(
      `SELECT COALESCE(carpeta, 'Sin Carpeta') AS carpeta, COUNT(*) AS total
       FROM documentos_empleado
       WHERE empleado_id = $1
       GROUP BY carpeta ORDER BY carpeta`,
      [empleadoId]
    ),

  getDocsByFolder: (empleadoId, carpeta) =>
    query(
      `SELECT * FROM documentos_empleado
       WHERE empleado_id = $1 AND COALESCE(carpeta, 'Sin Carpeta') = $2
       ORDER BY fecha_registro DESC`,
      [empleadoId, carpeta]
    ),

  updateFolder: (docId, carpeta) =>
    query(
      `UPDATE documentos_empleado SET carpeta = $1
       WHERE id = $2 RETURNING *`,
      [carpeta, docId]
    ),
};

module.exports = DocumentoFolders;
