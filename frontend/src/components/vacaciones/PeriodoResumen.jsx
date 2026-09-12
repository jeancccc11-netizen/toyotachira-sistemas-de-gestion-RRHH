import { useState, useEffect } from 'react';
import api from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function PeriodoResumen({ empleadoId }) {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empleadoId) return;
    api.get(`/vacaciones/periodos/${empleadoId}`)
      .then((r) => { setPeriodos(r.data); setLoading(false); });
  }, [empleadoId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold text-sm mb-3">
        Estados Vacacionales
      </h3>
      <table className="w-full text-xs">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="py-1">Año</th>
            <th>Acumulados</th>
            <th>Disfrutados</th>
            <th>Pendientes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {periodos.map((p) => (
            <tr key={p.id}>
              <td className="py-1 font-medium">{p.anio_periodo}</td>
              <td>{p.dias_acumulados}</td>
              <td>{p.dias_disfrute}</td>
              <td className="font-semibold text-green-600">
                {p.dias_pendientes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {periodos.length === 0 && (
        <p className="text-gray-500 text-xs">Sin períodos registrados</p>
      )}
    </div>
  );
}
