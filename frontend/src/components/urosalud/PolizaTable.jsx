import { Users, Pencil, Trash2 } from 'lucide-react';

export default function PolizaTable({ items, canWrite, canDelete, onCargas, onEdit, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-left">
        <tr><th className="px-4 py-3">Empleado</th><th>Póliza</th><th>Plan</th><th>Prima</th><th>Cargas</th><th></th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{p.nombre_completo}</td>
            <td className="text-gray-500">{p.numero_poliza || '—'}</td>
            <td>{p.plan_contratado}</td>
            <td>{parseFloat(p.monto_prima).toFixed(2)} {p.moneda}</td>
            <td className="text-center">{p.total_cargas}</td>
            <td className="text-right flex gap-2 justify-end">
              <button onClick={() => onCargas(p)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Users size={14} /></button>
              {canWrite && <button onClick={() => onEdit(p)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Pencil size={14} /></button>}
              {canDelete && <button onClick={() => onDelete(p.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><Trash2 size={14} /></button>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
