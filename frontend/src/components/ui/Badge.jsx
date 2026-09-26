const colors = {
  Activo: 'bg-green-100 text-green-700',
  Vacaciones: 'bg-yellow-100 text-yellow-700',
  Reposo: 'bg-red-100 text-red-700',
  Egreso: 'bg-gray-100 text-gray-700',
  Pagada: 'bg-green-100 text-green-700',
  Aprobada: 'bg-green-100 text-green-700',
  Borrador: 'bg-gray-100 text-gray-600',
  Activa: 'bg-green-100 text-green-700',
};

export default function Badge({ value }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  );
}
