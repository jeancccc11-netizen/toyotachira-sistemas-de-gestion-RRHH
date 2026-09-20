import { Link } from 'react-router-dom';
import { Pencil, Folder, FileText, Download } from 'lucide-react';
import Badge from '../ui/Badge';
import downloadFile from '../../utils/download';

const esDate = (d) => d ? new Date(d).toLocaleDateString('es-VE') : '—';

export default function ProfileCard({ emp, docs, onTabChange }) {
  const fotoUrl = emp.foto_url || emp.foto_perfil || null;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <div className="w-28 h-28 mx-auto rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
          {fotoUrl ? <img src={fotoUrl} alt={emp.nombre_completo} className="w-full h-full object-cover" />
            : <span className="text-4xl text-gray-400">{emp.nombre_completo?.charAt(0)}</span>}
        </div>
        <h1 className="text-lg font-bold">{emp.nombre_completo}</h1>
        <p className="text-sm text-gray-500">{emp.cedula}</p>
        <div className="mt-2"><Badge value={emp.estado_operativo || 'Activo'} /></div>
        <div className="flex gap-2 mt-4 justify-center">
          <Link to={`/empleados/${emp.id}/edit`}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200">
            <Pencil size={14} /> Editar</Link>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-sm mb-3">Info Rápida</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Depto', emp.departamento], ['Cargo', emp.cargo],
            ['Salario', emp.salario_base ? `${parseFloat(emp.salario_base).toFixed(2)} Bs` : '—'],
            ['Ingreso', esDate(emp.fecha_ingreso)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium">{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <button onClick={() => onTabChange('docs')}
          className="flex items-center gap-2 w-full text-left text-sm hover:text-primary-600">
          <Folder size={16} className="text-amber-500" />
          <span>Expediente ({docs.length} docs)</span>
        </button>
        {docs.slice(0, 3).map((d) => (
          <div key={d.id} className="flex items-center gap-2 ml-6 mt-1 text-xs text-gray-500">
            <FileText size={12} /><span className="truncate">{d.nombre_archivo}</span>
            <button onClick={() => downloadFile(`/api/documentos/${d.id}/download`, d.nombre_archivo)}
              className="ml-auto text-primary-600"><Download size={12} /></button>
          </div>
        ))}
        {docs.length > 3 && (
          <button onClick={() => onTabChange('docs')}
            className="ml-6 mt-1 text-xs text-primary-600 hover:underline">Ver todos</button>
        )}
      </div>
    </div>
  );
}
