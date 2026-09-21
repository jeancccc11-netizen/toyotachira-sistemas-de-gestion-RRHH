import { useState, useEffect } from 'react';
import { Upload, Trash2, FolderOpen } from 'lucide-react';
import api, { directApi } from '../../api/client';

const tipos = ['Cédula', 'RIF', 'Título', 'Contrato', 'Hoja de Vida', 'Certificado Médico', 'Otros'];
const carpetas = ['Personal', 'Contrato', 'Médico', 'Académico', 'Financiero'];

export default function DocsTab({ docs, empleadoId, onRefresh }) {
  const [showUp, setShowUp] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selFolder, setSelFolder] = useState(null);
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState('Cédula');
  const [carpeta, setCarpeta] = useState('Personal');

  useEffect(() => {
    api.get(`/documentos/folders/${empleadoId}`).then((r) => setFolders(r.data));
  }, [empleadoId, docs]);

  const upload = async (e) => {
    e.preventDefault(); if (!file) return;
    const fd = new FormData();
    fd.append('archivo', file); fd.append('empleado_id', empleadoId);
    fd.append('tipo_documento', tipo); fd.append('carpeta', carpeta);
    await (directApi || api).post('/documentos/upload', fd);
    setShowUp(false); setFile(null); onRefresh();
  };
  const del = async (id) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/documentos/${id}`); onRefresh(); };
  const filtered = selFolder ? docs.filter((d) => (d.carpeta || 'Sin Carpeta') === selFolder) : docs;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Documentos ({docs.length})</h3>
        <button onClick={() => setShowUp(!showUp)} className="flex items-center gap-1 text-sm text-primary-600 hover:underline"><Upload size={14} /> Subir</button>
      </div>
      {folders.length > 0 && <div className="flex gap-2 mb-3 flex-wrap">
        <button onClick={() => setSelFolder(null)} className={`px-3 py-1 rounded-full text-xs ${!selFolder ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>Todos ({docs.length})</button>
        {folders.map((f) => <button key={f.carpeta} onClick={() => setSelFolder(f.carpeta)} className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${selFolder === f.carpeta ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}><FolderOpen size={12} /> {f.carpeta} ({f.total})</button>)}
      </div>}
      {showUp && <form onSubmit={upload} className="flex gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" required />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded px-2 py-1 text-sm">{tipos.map((t) => <option key={t}>{t}</option>)}</select>
        <select value={carpeta} onChange={(e) => setCarpeta(e.target.value)} className="border rounded px-2 py-1 text-sm">{carpetas.map((f) => <option key={f}>{f}</option>)}</select>
        <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded text-sm">Subir</button>
      </form>}
      {filtered.length === 0 ? <p className="text-gray-500 text-sm">No hay documentos</p> : filtered.map((d) => (
        <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div><p className="text-sm font-medium">{d.nombre_archivo}</p><p className="text-xs text-gray-500">{d.tipo_documento}{d.carpeta ? ` · ${d.carpeta}` : ''}</p></div>
          <button onClick={() => del(d.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}
