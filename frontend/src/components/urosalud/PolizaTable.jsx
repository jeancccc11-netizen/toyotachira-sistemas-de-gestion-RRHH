import { Users, Pencil, Trash2 } from 'lucide-react';

export default function PolizaTable({ items, canWrite, canDelete, onCargas, onEdit, onDelete }) {
  return (
    <table className="w-full text-sm min-w-[680px] whitespace-nowrap rwd">
      <thead className="bg-gray-50 text-left">
        <tr><th className="px-4 py-3">Empleado</th><th>Póliza</th><th>Plan</th><th>Prima</th><th>Cargas</th><th></th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{p.nombre_completo}</td>
            <td data-label="Póliza" className="text-gray-500">{p.numero_poliza || '—'}</td>
            <td data-label="Plan">{p.plan_contratado}</td>
            <td data-label="Prima">{parseFloat(p.monto_prima).toFixed(2)} {p.moneda}</td>
            <td data-label="Cargas" className="text-center">{p.total_cargas}</td>
            <td data-label="Acciones" className="text-right">
              <div className="flex gap-2 justify-end">
                <button onClick={() => onCargas(p)} className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Users size={14} /></button>
                {canWrite && <button onClick={() => onEdit(p)} className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Pencil size={14} /></button>}
                {canDelete && <button onClick={() => onDelete(p.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><Trash2 size={14} /></button>}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
