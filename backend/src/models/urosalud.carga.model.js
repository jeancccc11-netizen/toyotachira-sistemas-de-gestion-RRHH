const { query } = require('../config/database');

const Carga = {
  findByPoliza: (polizaId) => query(
    'SELECT * FROM cargas_familiares WHERE poliza_id = $1 ORDER BY nombre_completo',
    [polizaId]
  ),

  create: (data) => query(
    `INSERT INTO cargas_familiares
      (poliza_id, nombre_completo, cedula_o_identificador, parentesco,
       fecha_nacimiento, edad, sexo, plan, estado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.poliza_id, data.nombre_completo, data.cedula_o_identificador,
     data.parentesco, data.fecha_nacimiento, data.edad,
     data.sexo, data.plan, data.estado || 'Activo']
  ),

  update: (id, data) => {
    const fields = []; const params = []; let i = 1;
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) { fields.push(`${k} = $${i++}`); params.push(v); }
    }
    params.push(id);
    return query(
      `UPDATE cargas_familiares SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${i} RETURNING *`, params
    );
  },

  remove: (id) => query('DELETE FROM cargas_familiares WHERE id = $1 RETURNING id', [id]),
};

module.exports = Carga;
