const XLSX = require('xlsx');
const { query } = require('../config/database');

/**
 * POST /api/nomina/:nominaId/import
 * Accepts an Excel file, parses rows, and upserts into detalles_nomina.
 * Expected columns: cedula, sueldo_base, comision_mensual, bonificacion,
 * asignacion_vacaciones, asignacion_bonos, asignacion_extra,
 * deduccion_seguro_social, deduccion_paro, deduccion_inces,
 * deduccion_islr, deduccion_urosalud, deduccion_anticipos, deduccion_otros
 */
const nominaImportController = {
  importExcel: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Archivo Excel requerido' });
      }
      const nominaId = parseInt(req.params.nominaId);
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!rows.length) {
        return res.status(400).json({ error: 'El archivo está vacío' });
      }

      const results = { importados: 0, errores: [] };

      for (const row of rows) {
        const cedula = String(row.cedula || row.Cedula || row.CÉDULA || '').trim();
        if (!cedula) { results.errores.push('Fila sin cédula'); continue; }

        const empResult = await query(
          'SELECT id FROM empleados WHERE cedula = $1', [cedula]
        );
        if (!empResult.rows.length) {
          results.errores.push(`Cédula ${cedula} no encontrada`);
          continue;
        }

        const empleadoId = empResult.rows[0].id;
        const num = (col) => parseFloat(row[col] || 0) || 0;

        await query(
          `INSERT INTO detalles_nomina
            (nomina_id, empleado_id, sueldo_base, comision_mensual, bonificacion,
             asignacion_vacaciones, asignacion_bonos, asignacion_extra,
             deduccion_seguro_social, deduccion_paro, deduccion_inces,
             deduccion_islr, deduccion_urosalud, deduccion_anticipos, deduccion_otros)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           ON CONFLICT (nomina_id, empleado_id) DO UPDATE SET
             sueldo_base = $3, comision_mensual = $4, bonificacion = $5,
             asignacion_vacaciones = $6, asignacion_bonos = $7, asignacion_extra = $8,
             deduccion_seguro_social = $9, deduccion_paro = $10, deduccion_inces = $11,
             deduccion_islr = $12, deduccion_urosalud = $13,
             deduccion_anticipos = $14, deduccion_otros = $15, updated_at = NOW()
           RETURNING id`,
          [nominaId, empleadoId, num('sueldo_base'), num('comision_mensual'),
           num('bonificacion'), num('asignacion_vacaciones'),
           num('asignacion_bonos'), num('asignacion_extra'),
           num('deduccion_seguro_social'), num('deduccion_paro'),
           num('deduccion_inces'), num('deduccion_islr'),
           num('deduccion_urosalud'), num('deduccion_anticipos'),
           num('deduccion_otros')]
        );
        results.importados++;
      }

      res.json({
        message: `Importación completada: ${results.importados} registros`,
        errores: results.errores,
      });
    } catch (err) { next(err); }
  },
};

module.exports = nominaImportController;
