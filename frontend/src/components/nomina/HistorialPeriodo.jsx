import { useState, useEffect } from 'react';
import { History, Download } from 'lucide-react';
import api from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';
import downloadFile from '../../utils/download';

const fmt = (v) => parseFloat(v || 0).toFixed(2);

export default function HistorialPeriodo({ onSelect }) {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/nomina/historial/todos')
      .then((r) => { setPeriodos(r.data); setLoading(false); });
  }, []);

  const mes = (m) => [
    '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ][m] || m;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <History size={16} className="text-gray-500" />
        <h3 className="font-semibold text-sm">
          Historial de Nómina ({periodos.length})
        </h3>
      </div>
      <table className="w-full text-sm min-w-[640px] whitespace-nowrap rwd">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3">Período</th>
            <th>Empleados</th>
            <th>Total Neto</th>
            <th>Estatus</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {periodos.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect && onSelect(p)}>
              <td className="px-4 py-3 font-medium">
                {p.quincena}° Q — {mes(p.mes)} {p.anio}
              </td>
              <td data-label="Empleados">{p.total_empleados || 0}</td>
              <td data-label="Total Neto" className="font-semibold">
                {fmt(p.total_neto)} Bs
              </td>
              <td data-label="Estatus">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  p.estatus === 'Pagada' ? 'bg-green-100 text-green-700'
                  : p.estatus === 'Aprobada' ? 'bg-green-100 text-green-700'
                  : p.estatus === 'Procesada' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>{p.estatus}</span>
              </td>
              <td data-label="Excel" className="text-right">
                <div className="flex justify-end">
                <button onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(`/api/nomina/${p.id}/export/excel`, `nomina-${p.id}.xlsx`);
                }} className="p-1.5 bg-green-100 text-green-600 rounded-lg
                  hover:bg-green-200">
                  <Download size={14} />
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
