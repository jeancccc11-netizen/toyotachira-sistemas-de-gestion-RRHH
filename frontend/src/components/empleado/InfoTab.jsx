export default function InfoTab({ empleado }) {
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-VE') : '—';
  const fmt = (v) => parseFloat(v || 0).toFixed(2);

  const fields = [
    ['N° Empleado', empleado.nro],
    ['Cédula', empleado.cedula],
    ['Departamento', empleado.departamento],
    ['Cargo', empleado.posicion_cargo],
    ['Fecha Ingreso', fmtDate(empleado.fecha_ingreso)],
    ['Salario Base', `${fmt(empleado.salario_base)} Bs`],
    ['Tipo Tasa', empleado.tipo_tasa || '—'],
    ['Estado', empleado.estado_operativo],
    ['Email', empleado.email || '—'],
    ['Teléfono', empleado.telefono || '—'],
    ['Dirección', empleado.direccion || '—'],
    ['Registro', fmtDate(empleado.created_at)],
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      {fields.map(([label, val]) => (
        <div key={label}>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-medium">{val}</p>
        </div>
      ))}
    </div>
  );
}
