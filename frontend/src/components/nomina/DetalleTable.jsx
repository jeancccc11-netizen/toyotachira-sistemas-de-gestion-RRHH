import { Pencil, Download } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import downloadFile from '../../utils/download';

const fmt = (v) => parseFloat(v || 0).toFixed(2);

export default function DetalleTable({ detalles, periodoId, onEdit, refreshKey }) {
  const handlePdf = (d) => {
    downloadFile(`/api/nomina/${periodoId}/recibo/${d.id}/pdf`, `recibo-${d.id}.pdf`);
  };

  if (!detalles.length) return <EmptyState message="No hay detalles. Agrega empleados a este período." />;

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-left">
        <tr>
          <th className="px-4 py-3">Empleado</th>
          <th className="px-4 py-3">Depto.</th>
          <th className="px-4 py-3">Sueldo</th>
          <th className="px-4 py-3">Asignaciones</th>
          <th className="px-4 py-3">Deducciones</th>
          <th className="px-4 py-3">Neto</th>
          <th className="px-4 py-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {detalles.map((d) => (
          <tr key={d.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{d.nombre_completo}</td>
            <td className="px-4 py-3 text-gray-500">{d.departamento}</td>
            <td className="px-4 py-3">{fmt(d.sueldo_base)}</td>
            <td className="px-4 py-3 text-green-600">{fmt(d.total_asignaciones)}</td>
            <td className="px-4 py-3 text-red-600">{fmt(d.total_deducciones)}</td>
            <td className="px-4 py-3 font-semibold">{fmt(d.neto_a_pagar)}</td>
            <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
              <button onClick={() => onEdit(d)}
                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Pencil size={14} /></button>
              <button onClick={() => handlePdf(d)}
                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Download size={14} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
