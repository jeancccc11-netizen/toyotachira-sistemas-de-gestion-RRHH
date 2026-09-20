import { Check, X } from 'lucide-react';

const esDate = (d) => d ? new Date(d).toLocaleDateString('es-VE') : '—';

export default function PendientesTable({ items, canWrite, onAprobar, onRechazar }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-left">
        <tr><th className="px-4 py-3">Empleado</th><th>Cédula</th><th>Salida</th>
          <th>Regreso</th><th>Días</th><th className="text-right">Acciones</th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{s.nombre_completo}</td>
            <td className="text-gray-500">{s.cedula}</td>
            <td>{esDate(s.fecha_salida)}</td><td>{esDate(s.fecha_regreso)}</td>
            <td className="text-center">{s.dias_solicitados}</td>
            <td className="text-right flex gap-2 justify-end">
              {canWrite && (<>
                <button onClick={() => onAprobar(s.id)}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                  <Check size={16} /></button>
                <button onClick={() => onRechazar(s.id)}
                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                  <X size={16} /></button>
              </>)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
