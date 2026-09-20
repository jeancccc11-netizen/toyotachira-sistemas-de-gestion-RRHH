import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import ErrorAlert from '../ui/ErrorAlert';

const expectedCols = [
  'cedula', 'sueldo_base', 'comision_mensual', 'bonificacion',
  'asignacion_vacaciones', 'asignacion_bonos', 'asignacion_extra',
  'deduccion_seguro_social', 'deduccion_paro', 'deduccion_inces',
  'deduccion_islr', 'deduccion_urosalud', 'deduccion_anticipos',
  'deduccion_otros',
];

export default function ImportarForm({ nominaId, onDone }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const res = await api.post(`/nomina/${nominaId}/import`, fd);
      setResult(res.data);
      if (onDone) onDone();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al importar');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Upload size={16} /> Importar desde Excel
      </h3>
      <ErrorAlert message={error} />
      <form onSubmit={handleImport} className="flex gap-3 items-end">
        <div className="flex-1">
          <input type="file" accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm w-full" required />
        </div>
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm
          hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Importando...' : 'Importar'}
        </button>
      </form>
      {result && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">
          <p className="font-medium text-green-700">{result.message}</p>
          {result.errores?.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> Errores:
              </p>
              {result.errores.map((e, i) => (
                <p key={i} className="text-red-500 text-xs ml-5">• {e}</p>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
        <p className="font-medium mb-1">Columnas esperadas:</p>
        <p>{expectedCols.join(', ')}</p>
      </div>
    </div>
  );
}
