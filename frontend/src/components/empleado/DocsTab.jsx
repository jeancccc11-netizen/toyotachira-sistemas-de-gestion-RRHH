import { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import api from '../../api/client';

const tipos = ['Cédula', 'RIF', 'Título', 'Contrato', 'Hoja de Vida', 'Certificado Médico', 'Otros'];

export default function DocsTab({ docs, empleadoId, onRefresh }) {
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState('Cédula');

  const handleUpload = async (e) => {
    e.preventDefault(); if (!file) return;
    const fd = new FormData();
    fd.append('archivo', file); fd.append('empleado_id', empleadoId); fd.append('tipo_documento', tipo);
    await api.post('/documentos/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setShowUpload(false); setFile(null); onRefresh();
  };

  const handleDelete = async (id) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/documentos/${id}`); onRefresh(); };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Documentos ({docs.length})</h3>
        <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-1 text-sm text-primary-600 hover:underline"><Upload size={14} /> Subir</button>
      </div>
      {showUpload && (
        <form onSubmit={handleUpload} className="flex gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" required />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded-lg px-2 py-1 text-sm">{tipos.map((t) => <option key={t}>{t}</option>)}</select>
          <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">Subir</button>
        </form>
      )}
      {docs.length === 0 ? <p className="text-gray-500 text-sm">No hay documentos</p> : docs.map((d) => (
        <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div><p className="text-sm font-medium">{d.nombre_archivo}</p><p className="text-xs text-gray-500">{d.tipo_documento}</p></div>
          <button onClick={() => handleDelete(d.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}
