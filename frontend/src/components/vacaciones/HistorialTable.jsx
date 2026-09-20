import { Download } from 'lucide-react';
import Badge from '../ui/Badge';
import downloadFile from '../../utils/download';

const esDate = (d) => d ? new Date(d).toLocaleDateString('es-VE') : '—';

export default function HistorialTable({ items }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-left">
        <tr><th className="px-4 py-3">Empleado</th><th>Salida</th><th>Regreso</th>
          <th>Días</th><th>Estado</th><th className="text-right">PDF</th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{s.nombre_completo}</td>
            <td>{esDate(s.fecha_salida)}</td><td>{esDate(s.fecha_regreso)}</td>
            <td className="text-center">{s.dias_solicitados}</td>
            <td><Badge value={s.estado} /></td>
            <td className="text-right">
              <button onClick={() => downloadFile(`/api/vacaciones/solicitudes/${s.id}/pdf`, `vacaciones-${s.id}.pdf`)}
                className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                <Download size={14} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
