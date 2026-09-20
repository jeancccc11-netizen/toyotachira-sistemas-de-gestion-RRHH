const esDate = (d) => d ? new Date(d).toLocaleDateString('es-VE') : '—';

export default function PerfilTab({ emp }) {
  const fields = [
    ['Nombre Completo', emp.nombre_completo], ['Cédula', emp.cedula],
    ['Fecha Nacimiento', esDate(emp.fecha_nacimiento)], ['Género', emp.genero],
    ['Estado Civil', emp.estado_civil], ['Teléfono', emp.telefono],
    ['Email', emp.email], ['Dirección', emp.direccion],
    ['Cargo', emp.cargo], ['Departamento', emp.departamento],
    ['Fecha Ingreso', esDate(emp.fecha_ingreso)],
    ['Tipo Contrato', emp.tipo_contrato],
    ['Salario', emp.salario_base ? `${parseFloat(emp.salario_base).toFixed(2)} Bs` : '—'],
    ['Banco', emp.banco], ['Cta. Bancaria', emp.cuenta_bancaria],
    ['Estado', emp.estado_operativo],
  ];
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold text-lg mb-4">Ficha del Empleado</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {fields.map(([label, val]) => (
          <div key={label} className="border-b pb-2">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-medium">{val || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
