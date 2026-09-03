/**
 * SEED - Datos de prueba para SI-GHR
 * Ejecutar: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { query, shutdown } = require('../src/config/database');

async function seed() {
  console.log('[SEED] Conectando a Supabase...');
  await query('SELECT NOW()');
  console.log('[SEED] ✅ Conectado\n');

  // ========================================
  // 1. EMPLEADOS
  // ========================================
  console.log('[SEED] Insertando empleados...');
  const empleados = [
    { nro: 1, cedula: 'V-20.123.456', nombre: 'CARLOS ALBERTO RODRÍGUEZ MENDOZA', dept: 1, cargo: 'Gerente General', ing: '2015-03-10', salario: 4500 },
    { nro: 2, cedula: 'V-25.987.654', nombre: 'MARÍA ELENA GUTIÉRREZ LÓPEZ', dept: 2, cargo: 'Contadora Principal', ing: '2017-06-15', salario: 3800 },
    { nro: 3, cedula: 'V-22.456.789', nombre: 'ANDRÉS FELIPE MARTÍNEZ RUIZ', dept: 3, cargo: 'Coordinator de RRHH', ing: '2018-01-20', salario: 3500 },
    { nro: 4, cedula: 'V-28.345.678', nombre: 'LAURA VALENTINA HERNÁNDEZ PEÑA', dept: 4, cargo: 'Ejecutiva de Ventas', ing: '2019-09-01', salario: 3000 },
    { nro: 5, cedula: 'V-30.111.222', nombre: 'JEAN CARLOS DELGADO TORRES', dept: 5, cargo: 'Supervisor de Operaciones', ing: '2020-02-14', salario: 3200 },
    { nro: 6, cedula: 'V-27.333.444', nombre: 'YULIMAR COROMOTO PÉREZ GARCÍA', dept: 6, cargo: 'Jefe de Logística', ing: '2016-11-05', salario: 3600 },
    { nro: 7, cedula: 'V-31.555.666', nombre: 'DANIEL ALEJANDRO RÍOS MUÑOZ', dept: 7, cargo: 'Analista de Sistemas', ing: '2021-04-10', salario: 3400 },
    { nro: 8, cedula: 'V-29.777.888', nombre: 'CARMEN LUCÍA RAMÍREZ SOTO', dept: 8, cargo: 'Técnico de Mantenimiento', ing: '2019-07-22', salario: 2800 },
    { nro: 9, cedula: 'V-32.999.000', nombre: 'LUIS ENRIQUE COLMENARES BOLAÑOS', dept: 9, cargo: 'Jefe de Seguridad', ing: '2018-05-30', salario: 2900 },
    { nro: 10, cedula: 'V-26.121.321', nombre: 'GABRIELA SOFÍA MORA MENDOZA', dept: 10, cargo: 'Encargada de Almacén', ing: '2020-08-18', salario: 2700 },
    { nro: 11, cedula: 'V-33.444.555', nombre: 'PEDRO LUIS ACOSTA BRITO', dept: 5, cargo: 'Operador Principal', ing: '2022-01-05', salario: 2200 },
    { nro: 12, cedula: 'V-34.666.777', nombre: 'NATHALIE JOSEPHINE BLANCO RIVAS', dept: 4, cargo: 'Asistente de Ventas', ing: '2023-03-12', salario: 2000 },
  ];

  for (const e of empleados) {
    await query(
      `INSERT INTO empleados (nro, cedula, nombre_completo, departamento_id, posicion_cargo, fecha_ingreso, salario_base, estado_operativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Activo')
       ON CONFLICT (nro) DO NOTHING`,
      [e.nro, e.cedula, e.nombre, e.dept, e.cargo, e.ing, e.salario]
    );
  }
  console.log(`   → ${empleados.length} empleados insertados`);

  // ========================================
  // 2. PERÍODOS VACACIONALES (2026)
  // ========================================
  console.log('[SEED] Calculando períodos vacacionales 2026...');
  const emps = await query('SELECT id, fecha_ingreso FROM empleados ORDER BY nro');

  for (const emp of emps.rows) {
    const anioIngreso = new Date(emp.fecha_ingreso).getFullYear();
    const antiguedad = 2026 - anioIngreso;
    const dias = Math.min(15 + Math.max(0, antiguedad), 30);
    const disfrute = Math.floor(Math.random() * Math.min(dias, 10));
    const salarioDiario = (Math.random() * 80 + 40).toFixed(2);

    await query(
      `INSERT INTO periodos_vacacionales (empleado_id, anio_periodo, dias_acumulados, dias_disfrute, salario_diario)
       VALUES ($1, 2026, $2, $3, $4)
       ON CONFLICT (empleado_id, anio_periodo) DO NOTHING`,
      [emp.id, dias, disfrute, salarioDiario]
    );
  }
  console.log('   → Períodos vacacionales 2026 creados');

  // ========================================
  // 3. SOLICITUDES DE VACACIONES
  // ========================================
  console.log('[SEED] Creando solicitudes de vacaciones...');
  const vacSolicitudes = [
    { emp: 4, salida: '2026-09-01', regreso: '2026-09-15', estado: 'Solicitada' },
    { emp: 5, salida: '2026-09-10', regreso: '2026-09-20', estado: 'Solicitada' },
    { emp: 7, salida: '2026-08-01', regreso: '2026-08-10', estado: 'Aprobada', aprobador: 'admin' },
    { emp: 11, salida: '2026-10-01', regreso: '2026-10-12', estado: 'Solicitada' },
    { emp: 12, salida: '2026-07-01', regreso: '2026-07-15', estado: 'Disfrutada', aprobador: 'admin' },
  ];

  for (const s of vacSolicitudes) {
    const dias = Math.ceil((new Date(s.regreso) - new Date(s.salida)) / 86400000);
    await query(
      `INSERT INTO solicitudes_vacaciones (empleado_id, fecha_salida, fecha_regreso, dias_solicitados, estado, aprobado_por)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT DO NOTHING`,
      [s.emp, s.salida, s.regreso, dias, s.estado, s.aprobador || null]
    );
  }
  console.log(`   → ${vacSolicitudes.length} solicitudes creadas`);

  // ========================================
  // 4. POLIZAS UROSALUD
  // ========================================
  console.log('[SEED] Creando pólizas Urosalud...');
  const polizas = [
    { emp: 1, nro: 'URO-2026-001', plan: 'Plan Platinum 2', prima: 180, asesor: 'Rosa Méndez' },
    { emp: 2, nro: 'URO-2026-002', plan: 'Plan Plus', prima: 150, asesor: 'Rosa Méndez' },
    { emp: 3, nro: 'URO-2026-003', plan: 'Plan Platinum 2', prima: 180, asesor: 'Carlos Vivas' },
    { emp: 4, nro: 'URO-2026-004', plan: 'Plan Básico', prima: 100, asesor: 'Carlos Vivas' },
    { emp: 5, nro: 'URO-2026-005', plan: 'Plan Plus', prima: 150, asesor: 'Rosa Méndez' },
    { emp: 6, nro: 'URO-2026-006', plan: 'Plan Platinum 2', prima: 180, asesor: 'Carlos Vivas' },
    { emp: 7, nro: 'URO-2026-007', plan: 'Plan Plus', prima: 150, asesor: 'Rosa Méndez' },
  ];

  for (const p of polizas) {
    await query(
      `INSERT INTO polizas_urosalud (empleado_id, numero_poliza, fecha_afiliacion, plan_contratado, monto_prima, asesor, estado)
       VALUES ($1,$2,'2026-01-15',$3,$4,$5,'Activa')
       ON CONFLICT (numero_poliza) DO NOTHING`,
      [p.emp, p.nro, p.plan, p.prima, p.asesor]
    );
  }
  console.log(`   → ${polizas.length} pólizas creadas`);

  // ========================================
  // 5. CARGAS FAMILIARES
  // ========================================
  console.log('[SEED] Creando cargas familiares...');
  const cargas = [
    { pol: 1, nombre: 'ANA MARÍA RODRÍGUEZ', parent: 'Cónyuge', sexo: 'F' },
    { pol: 1, nombre: 'CARLOS ANDRÉS RODRÍGUEZ JR', parent: 'Hijo/a', sexo: 'M' },
    { pol: 1, nombre: 'MARIA FERNANDA RODRÍGUEZ', parent: 'Hijo/a', sexo: 'F' },
    { pol: 2, nombre: 'LUIS GUTIÉRREZ', parent: 'Cónyuge', sexo: 'M' },
    { pol: 3, nombre: 'VALERIA MARTÍNEZ', parent: 'Cónyuge', sexo: 'F' },
    { pol: 5, nombre: 'SOFÍA DELGADO', parent: 'Hijo/a', sexo: 'F' },
    { pol: 6, nombre: 'ROCÍO PÉREZ', parent: 'Cónyuge', sexo: 'F' },
  ];

  for (const c of cargas) {
    await query(
      `INSERT INTO cargas_familiares (poliza_id, nombre_completo, parentesco, sexo, estado)
       VALUES ($1,$2,$3,$4,'Activo')
       ON CONFLICT DO NOTHING`,
      [c.pol, c.nombre, c.parent, c.sexo]
    );
  }
  console.log(`   → ${cargas.length} cargas familiares creadas`);

  // ========================================
  // 6. EXÁMENES MÉDICOS / REPOSOS
  // ========================================
  console.log('[SEED] Creando exámenes médicos y reposos...');
  await query(
    `INSERT INTO examenes_medicos_reposos (empleado_id, tipo_registro, fecha_registro, fecha_inicio, fecha_fin, diagnostico, medico_responsable)
     VALUES
       (8, 'Examen Ocular', '2026-02-10', NULL, NULL, 'Examen de agudeza visual anual - resultado normal', 'Dr. Ramírez'),
       (11, 'Reposo Médico', '2026-07-15', '2026-07-15', '2026-07-25', 'Gastroenteritis aguda', 'Dra. López'),
       (12, 'Laboratorio', '2026-06-20', NULL, NULL, 'Exámenes de rutina - hemograma completo', 'Lab. Central'),
       (6, 'Reposo Médico', '2026-08-01', '2026-08-01', '2026-08-08', 'Cirugía menor ambulatoria', 'Dr. Fernández'),
       (1, 'Control Periódico', '2026-03-15', NULL, NULL, 'Control anual ejecutivo - sin novedad', 'Clínica Santa María')
     ON CONFLICT DO NOTHING`
  );
  console.log('   → 5 registros médicos creados');

  // ========================================
  // 7. PERÍODOS DE NÓMINA
  // ========================================
  console.log('[SEED] Creando períodos de nómina...');
  const periodos = [
    { q: 1, mes: 8, anio: 2026, ini: '2026-08-01', fin: '2026-08-15', est: 'Pagada' },
    { q: 2, mes: 8, anio: 2026, ini: '2026-08-16', fin: '2026-08-31', est: 'Procesada' },
    { q: 1, mes: 9, anio: 2026, ini: '2026-09-01', fin: '2026-09-15', est: 'Borrador' },
  ];

  for (const p of periodos) {
    await query(
      `INSERT INTO periodos_nomina (quincena, mes, anio, fecha_inicio, fecha_fin, estatus)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (quincena, mes, anio) DO NOTHING`,
      [p.q, p.mes, p.anio, p.ini, p.fin, p.est]
    );
  }
  console.log('   → 3 períodos de nómina creados');

  // ========================================
  // 8. DETALLES DE NÓMINA (1ra quincena agosto)
  // ========================================
  console.log('[SEED] Creando detalles de nómina (1ra Q agosto 2026)...');
  const periodoNomina = await query(
    "SELECT id FROM periodos_nomina WHERE quincena=1 AND mes=8 AND anio=2026"
  );

  if (periodoNomina.rows.length > 0) {
    const nominaId = periodoNomina.rows[0].id;
    const todosEmps = await query('SELECT id, salario_base FROM empleados ORDER BY nro');

    for (const emp of todosEmps.rows) {
      const sueldo = parseFloat(emp.salario_base);
      const comision = +(sueldo * 0.05).toFixed(2);
      const bono = +(Math.random() * 200 + 50).toFixed(2);
      const vacAsig = +(Math.random() * 300).toFixed(2);
      const ss = +(sueldo * 0.04).toFixed(2);   // Seguro Social 4%
      const paro = +(sueldo * 0.01).toFixed(2);  // PARO 1%
      const inces = +(sueldo * 0.005).toFixed(2); // INCES 0.5%
      const islr = +(sueldo > 2500 ? sueldo * 0.06 : 0).toFixed(2);
      const uro = 150; // Urosalud

      await query(
        `INSERT INTO detalles_nomina
          (nomina_id, empleado_id, sueldo_base, comision_mensual, bonificacion,
           asignacion_vacaciones, deduccion_seguro_social, deduccion_paro,
           deduccion_inces, deduccion_islr, deduccion_urosalud)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (nomina_id, empleado_id) DO NOTHING`,
        [nominaId, emp.id, sueldo, comision, bono, vacAsig, ss, paro, inces, islr, uro]
      );
    }
    console.log(`   → ${todosEmps.rows.length} detalles de nómina insertados`);
  }

  // ========================================
  // RESUMEN
  // ========================================
  const counts = await Promise.all([
    query('SELECT COUNT(*) AS n FROM empleados'),
    query('SELECT COUNT(*) AS n FROM periodos_vacacionales'),
    query('SELECT COUNT(*) AS n FROM solicitudes_vacaciones'),
    query('SELECT COUNT(*) AS n FROM polizas_urosalud'),
    query('SELECT COUNT(*) AS n FROM cargas_familiares'),
    query('SELECT COUNT(*) AS n FROM examenes_medicos_reposos'),
    query('SELECT COUNT(*) AS n FROM periodos_nomina'),
    query('SELECT COUNT(*) AS n FROM detalles_nomina'),
  ]);

  console.log('\n========================================');
  console.log('  ✅ SEED COMPLETADO');
  console.log('========================================');
  console.log(`  Empleados:          ${counts[0].rows[0].n}`);
  console.log(`  Períodos vacac.:    ${counts[1].rows[0].n}`);
  console.log(`  Solicitudes vacac.: ${counts[2].rows[0].n}`);
  console.log(`  Pólizas Urosalud:   ${counts[3].rows[0].n}`);
  console.log(`  Cargas familiares:  ${counts[4].rows[0].n}`);
  console.log(`  Exámenes médicos:   ${counts[5].rows[0].n}`);
  console.log(`  Períodos nómina:    ${counts[6].rows[0].n}`);
  console.log(`  Detalles nómina:    ${counts[7].rows[0].n}`);
  console.log('========================================');

  await shutdown();
}

seed().catch(err => {
  console.error('[SEED] ❌ Error:', err.message);
  process.exit(1);
});
