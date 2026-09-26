// Misma base que usa el resto de la app (VITE_API_URL):
//  - desarrollo: '/api' -> proxy de Vite -> backend local (localhost:3001)
//  - producción (Vercel): rewrite de vercel.json -> backend de Render
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export default async function downloadFile(url, filename) {
  const token = localStorage.getItem('token');
  const fullUrl = url.startsWith('http')
    ? url
    : `${API_BASE}${url.replace(/^\/api/, '')}`;
  try {
    const res = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al descargar' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const blob = await res.blob();
    if (blob.size === 0) throw new Error('Archivo vacío');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch (err) {
    console.error('Download error:', err);
    throw err;
  }
}
