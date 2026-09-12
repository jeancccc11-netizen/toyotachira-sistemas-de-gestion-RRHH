import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import api from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';
import Badge from '../ui/Badge';

export default function HistorialList({ empleadoId }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = empleadoId
      ? `/vacaciones/historial/empleado/${empleadoId}`
      : '/vacaciones/historial/todas';
    api.get(url).then((r) => { setHistorial(r.data); setLoading(false); });
  }, [empleadoId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <History size={16} className="text-gray-500" />
        <h3 className="font-semibold text-sm">
          Historial ({historial.length})
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3">Empleado</th>
            <th>Depto.</th>
            <th>Salida</th>
            <th>Regreso</th>
            <th>Días</th>
            <th>Período</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {historial.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">
                {s.nombre_completo}
              </td>
              <td className="text-gray-500">{s.departamento}</td>
              <td>{formatDate(s.fecha_salida)}</td>
              <td>{formatDate(s.fecha_regreso)}</td>
              <td className="text-center">{s.dias_solicitados}</td>
              <td className="text-gray-500">
                {s.anio_periodo || '—'}
              </td>
              <td><Badge value={s.estado} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {historial.length === 0 && (
        <p className="text-gray-500 text-sm p-4">No hay registros</p>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString('es-VE') : '—';
}
