export default function InfoTab({ empleado }) {
  const fields = [
    ['N° Empleado', empleado.nro], ['Cédula', empleado.cedula],
    ['Departamento', empleado.departamento], ['Cargo', empleado.posicion_cargo],
    ['Fecha Ingreso', empleado.fecha_ingreso?.split('T')[0]],
    ['Salario Base', `${parseFloat(empleado.salario_base).toFixed(2)} Bs`],
    ['Estado', empleado.estado_operativo], ['Email', empleado.email || '—'],
    ['Teléfono', empleado.telefono || '—'],
  ];
  return (
    <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-4 text-sm">
      {fields.map(([label, val]) => (
        <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="font-medium">{val}</p></div>
      ))}
    </div>
  );
}
