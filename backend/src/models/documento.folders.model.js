const { query } = require('../config/database');

const DocumentoFolders = {
  getFoldersByEmpleado: async (empleadoId) => {
    try {
      const result = await query(
        `SELECT COALESCE(carpeta, 'Sin Carpeta') AS carpeta, COUNT(*) AS total
         FROM documentos_empleado
         WHERE empleado_id = $1
         GROUP BY carpeta ORDER BY carpeta`,
        [empleadoId]
      );
      return result;
    } catch (err) {
      // If carpeta column doesn't exist, return empty
      if (err.message?.includes('column "carpeta" does not exist')) {
        return { rows: [] };
      }
      throw err;
    }
  },

  getDocsByFolder: async (empleadoId, carpeta) => {
    try {
      return await query(
        `SELECT * FROM documentos_empleado
         WHERE empleado_id = $1 AND COALESCE(carpeta, 'Sin Carpeta') = $2
         ORDER BY fecha_registro DESC`,
        [empleadoId, carpeta]
      );
    } catch (err) {
      if (err.message?.includes('column "carpeta" does not exist')) {
        return await query(
          `SELECT * FROM documentos_empleado WHERE empleado_id = $1 ORDER BY fecha_registro DESC`,
          [empleadoId]
        );
      }
      throw err;
    }
  },

  updateFolder: async (docId, carpeta) => {
    try {
      return await query(
        `UPDATE documentos_empleado SET carpeta = $1
         WHERE id = $2 RETURNING *`,
        [carpeta, docId]
      );
    } catch (err) {
      if (err.message?.includes('column "carpeta" does not exist')) {
        return { rows: [] };
      }
      throw err;
    }
  },
};

module.exports = DocumentoFolders;
