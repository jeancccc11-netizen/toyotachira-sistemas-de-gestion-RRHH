import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import api from '../../api/client';

export default function PhotoTab({ empleado, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('foto', file);
    await api.post(`/empleados/${empleado.id}/foto`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setUploading(false);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          {empleado.foto_url ? (
            <img src={empleado.foto_url} alt="Foto"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
              <Camera size={32} className="text-gray-400" />
            </div>
          )}
          <button onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow hover:bg-primary-700 disabled:opacity-50">
            <Camera size={14} />
          </button>
          <input ref={inputRef} type="file" accept="image/*"
            onChange={handleUpload} className="hidden" />
        </div>
        <div>
          <h3 className="font-semibold">{empleado.nombre_completo}</h3>
          <p className="text-sm text-gray-500">C.I. {empleado.cedula}</p>
          <p className="text-sm text-gray-500">
            {empleado.posicion_cargo}
          </p>
          {uploading && (
            <p className="text-xs text-primary-600 mt-2">Subiendo...</p>
          )}
        </div>
      </div>
    </div>
  );
}
