import { useState, useEffect } from 'react';
import { Upload, Trash2, FolderOpen, FolderPlus, Download, Eye, X } from 'lucide-react';
import api, { directApi } from '../../api/client';

const tipos = ['Cédula', 'RIF', 'Título', 'Contrato', 'Hoja de Vida', 'Certificado Médico', 'Otros'];
const carpetas = ['Personal', 'Contrato', 'Médico', 'Académico', 'Financiero'];

const IMAGE_RE = /\.(jpe?g|png|gif|webp|bmp)$/i;

const isImage = (d) => IMAGE_RE.test(d.nombre_archivo || '');

async function authFetch(url) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.blob();
}

export default function DocsTab({ docs, empleadoId, onRefresh }) {
  const [showUp, setShowUp] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selFolder, setSelFolder] = useState(null);
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState('Cédula');
  const [carpeta, setCarpeta] = useState('Personal');
  const [nuevaCarpeta, setNuevaCarpeta] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null); // { url, nombre }

  useEffect(() => {
    api.get(`/documentos/folders/${empleadoId}`).then((r) => setFolders(r.data));
  }, [empleadoId, docs]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      fd.append('empleado_id', empleadoId);
      fd.append('tipo_documento', tipo);
      fd.append('carpeta', carpeta);
      await (directApi || api).post('/documentos/upload', fd);
      setShowUp(false);
      setFile(null);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const crearCarpeta = () => {
    const nombre = nuevaCarpeta.trim();
    if (!nombre) return;
    setShowUp(true);
    setCarpeta(nombre);
    setNuevaCarpeta('');
    setSelFolder(nombre);
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar documento?')) return;
    try {
      await api.delete(`/documentos/${id}`);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const verDocumento = async (d) => {
    try {
      const blob = await authFetch(`/api/documentos/${d.id}/download`);
      const url = URL.createObjectURL(blob);
      if (isImage(d) || (d.nombre_archivo || '').toLowerCase().endsWith('.pdf')) {
        setPreview({ url, nombre: d.nombre_archivo, tipo: isImage(d) ? 'imagen' : 'pdf' });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = d.nombre_archivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err.message || 'Error al abrir el documento');
    }
  };

  const cerrarPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const filtered = selFolder ? docs.filter((d) => (d.carpeta || 'Sin Carpeta') === selFolder) : docs;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Documentos ({docs.length})</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowUp(!showUp)} className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
            <Upload size={14} /> Subir
          </button>
          <button onClick={crearCarpeta} disabled={!nuevaCarpeta.trim()}
            className="flex items-center gap-1 text-sm text-primary-600 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">
            <FolderPlus size={14} /> Nueva carpeta
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <FolderPlus size={14} className="text-gray-400" />
        <input
          type="text"
          value={nuevaCarpeta}
          maxLength={100}
          onChange={(e) => setNuevaCarpeta(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); crearCarpeta(); } }}
          placeholder="Nombre de la nueva carpeta..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        />
      </div>

      {folders.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <button onClick={() => setSelFolder(null)} className={`px-3 py-1 rounded-full text-xs ${!selFolder ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>Todos ({docs.length})</button>
          {folders.map((f) => (
            <button key={f.carpeta} onClick={() => setSelFolder(f.carpeta)} className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${selFolder === f.carpeta ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
              <FolderOpen size={12} /> {f.carpeta} ({f.total})
            </button>
          ))}
        </div>
      )}

      {showUp && (
        <form onSubmit={upload} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm w-full sm:col-span-2" required />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded px-2 py-2 text-sm w-full">{tipos.map((t) => <option key={t}>{t}</option>)}</select>
          <select value={carpeta} onChange={(e) => setCarpeta(e.target.value)} className="border rounded px-2 py-2 text-sm w-full">
            {carpetas.map((f) => <option key={f}>{f}</option>)}
            {!carpetas.includes(carpeta) && <option value={carpeta}>{carpeta}</option>}
          </select>
          {error && <p className="text-xs text-red-600 sm:col-span-2">{error}</p>}
          <button type="submit" disabled={uploading} className="sm:col-span-2 py-2 bg-primary-600 text-white rounded text-sm disabled:opacity-50">
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </form>
      )}

      {error && !showUp && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay documentos{selFolder ? ` en "${selFolder}"` : ''}</p>
      ) : filtered.map((d) => (
        <div key={d.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
          <div className="min-w-0">
            <p className="text-sm font-medium break-all">{d.nombre_archivo}</p>
            <p className="text-xs text-gray-500">{d.tipo_documento}{d.carpeta ? ` · ${d.carpeta}` : ''}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isImage(d) && (
              <button onClick={() => verDocumento(d)} title="Ver imagen" className="p-1 text-primary-600 hover:text-primary-700">
                <Eye size={14} />
              </button>
            )}
            <button onClick={() => verDocumento(d)} title="Descargar" className="p-1 text-gray-500 hover:text-gray-700">
              <Download size={14} />
            </button>
            <button onClick={() => del(d.id)} title="Eliminar" className="p-1 text-red-500 hover:text-red-700">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={cerrarPreview}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium truncate">{preview.nombre}</p>
              <button onClick={cerrarPreview} className="p-1 text-gray-500 hover:text-gray-700"><X size={18} /></button>
            </div>
            {preview.tipo === 'imagen' ? (
              <img src={preview.url} alt={preview.nombre} className="max-h-[75vh] w-auto mx-auto rounded" />
            ) : (
              <iframe src={preview.url} title={preview.nombre} className="w-full h-[75vh] rounded" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
