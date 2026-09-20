/**
 * Genera un archivo Excel de prueba para importar nómina.
 * Uso: node scripts/generate-nomina-excel.js
 * Salida: scripts/nomina_prueba.xlsx
 */
const XLSX = require('xlsx');
const path = require('path');

// Empleados reales de la base de datos
const empleados = [
  { cedula: 'V-20.123.456', nombre: 'CARLOS ALBERTO RODRÍGUEZ MENDOZA', sueldo: 2800 },
  { cedula: 'V-25.987.654', nombre: 'MARÍA ELENA GUTIÉRREZ LÓPEZ', sueldo: 2400 },
  { cedula: 'V-22.456.789', nombre: 'ANDRÉS FELIPE MARTÍNEZ RUIZ', sueldo: 2200 },
  { cedula: 'V-28.345.678', nombre: 'LAURA VALENTINA HERNÁNDEZ PEÑA', sueldo: 2600 },
  { cedula: 'V-30.111.222', nombre: 'JEAN CARLOS DELGADO TORRES', sueldo: 3200 },
  { cedula: 'V-31.555.666', nombre: 'DANIEL ALEJANDRO RÍOS MUÑOZ', sueldo: 2100 },
  { cedula: 'V-29.777.888', nombre: 'CARMEN LUCÍA RAMÍREZ SOTO', sueldo: 2500 },
  { cedula: 'V-32.999.000', nombre: 'LUIS ENRIQUE COLMENARES BOLAÑOS', sueldo: 2300 },
  { cedula: 'V-26.121.321', nombre: 'GABRIELA SOFÍA MORA MENDOZA', sueldo: 2700 },
  { cedula: 'V-33.444.555', nombre: 'PEDRO LUIS ACOSTA BRITO', sueldo: 2000 },
  { cedula: 'V-34.666.777', nombre: 'NATHALIE JOSEPHINE BLANCO RIVAS', sueldo: 2900 },
];

const rows = empleados.map((emp) => ({
  cedula: emp.cedula,
  sueldo_base: emp.sueldo,
  comision_mensual: +(emp.sueldo * 0.15).toFixed(2),
  bonificacion: +(Math.random() * 200 + 50).toFixed(2),
  asignacion_vacaciones: 0,
  asignacion_bonos: +(Math.random() * 300).toFixed(2),
  asignacion_extra: +(Math.random() * 150).toFixed(2),
  deduccion_seguro_social: +(emp.sueldo * 0.04).toFixed(2),
  deduccion_paro: +(emp.sueldo * 0.005).toFixed(2),
  deduccion_inces: +(emp.sueldo * 0.005).toFixed(2),
  deduccion_islr: +(emp.sueldo * 0.03).toFixed(2),
  deduccion_urosalud: 45.00,
  deduccion_anticipos: +(Math.random() * 200).toFixed(2),
  deduccion_otros: 0,
}));

console.log('=== Datos a exportar ===');
console.table(rows.map(r => ({
  cedula: r.cedula,
  sueldo: r.sueldo_base,
  bonos: r.asignacion_bonos + r.asignacion_extra,
  deducciones: r.deduccion_seguro_social + r.deduccion_paro + r.deduccion_inces + r.deduccion_islr + r.deduccion_urosalud,
})));

// Crear workbook
const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Nómina');

const outPath = path.join(__dirname, 'nomina_prueba.xlsx');
XLSX.writeFile(wb, outPath);
console.log(`\n✅ Archivo generado: ${outPath}`);
console.log(`   ${rows.length} empleados con datos de nómina`);
