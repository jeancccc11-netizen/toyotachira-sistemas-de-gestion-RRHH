import { Download, FileText } from 'lucide-react';
import Badge from '../ui/Badge';
import downloadFile from '../../utils/download';

const esDate = (d) => d ? new Date(d).toLocaleDateString('es-VE') : '—';

const descargar = async (id) => {
  try {
    await downloadFile(`/api/vacaciones/solicitudes/${id}/pdf`, `vacaciones-${id}.pdf`);
  } catch (err) {
    alert('Error al descargar: ' + err.message);
  }
};

// Abre el PDF en una pestaña nueva con el token en la URL (para ver/imprimir)
const verPdf = (id) => {
  const token = localStorage.getItem('token');
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
  window.open(`${base}/vacaciones/solicitudes/${id}/pdf?token=${encodeURIComponent(token)}`, '_blank');
};

export default function HistorialTable({ items }) {
  return (
    <table className="w-full text-sm min-w-[640px] whitespace-nowrap rwd">
      <thead className="bg-gray-50 text-left">
        <tr><th className="px-4 py-3">Empleado</th><th>Salida</th><th>Regreso</th>
          <th>Días</th><th>Estado</th><th className="text-right">Planilla PDF</th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{s.nombre_completo}</td>
            <td data-label="Salida">{esDate(s.fecha_salida)}</td><td data-label="Regreso">{esDate(s.fecha_regreso)}</td>
            <td data-label="Días" className="text-center">{s.dias_solicitados}</td>
            <td data-label="Estado"><Badge value={s.estado} /></td>
            <td data-label="Planilla PDF" className="text-right">
              <div className="flex justify-end gap-1">
                <button onClick={() => verPdf(s.id)} title="Ver / Imprimir planilla"
                  className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100">
                  <FileText size={14} />
                </button>
                <button onClick={() => descargar(s.id)} title="Descargar PDF"
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                  <Download size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
