import { useEffect, useState } from 'react';

const cache = new Map(); // url -> objectURL

// Misma base que usa el resto de la app (VITE_API_URL): en desarrollo '/api'
// (proxy de Vite) y en producción el rewrite de Vercel al backend de Render.
const API_BASE = trimSlashes(import.meta.env.VITE_API_URL || '/api');

function trimSlashes(url) {
  let u = url;
  while (u.endsWith('/')) u = u.slice(0, -1);
  return u;
}

/**
 * Resuelve el src de la imagen: si es una ruta relativa de uploads la apunta
 * al origen de la API cuando VITE_API_URL es una URL absoluta.
 */
export const resolveImgSrc = (src) => {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('//') || src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (src.startsWith('/uploads/')) {
    if (API_BASE.startsWith('http')) {
      try {
        const origin = API_BASE.endsWith('/api')
          ? API_BASE.slice(0, API_BASE.length - '/api'.length)
          : API_BASE;
        return new URL(src, origin + '/').href;
      } catch {
        return src;
      }
    }
    return src; // el proxy de Vite / rewrite de Vercel maneja /uploads
  }
  return src;
};

/**
 * <img> que pide la imagen al backend con el token Bearer (las rutas /uploads
 * requieren autenticación). Caché en memoria por sesión.
 */
export default function AuthImg({ src, alt = '', className = '', fallback = null }) {
  const resolved = resolveImgSrc(src);
  const [blobUrl, setBlobUrl] = useState(cache.get(resolved) || null);

  useEffect(() => {
    let alive = true;
    if (!resolved) return undefined;

    if (cache.has(resolved)) {
      setBlobUrl(cache.get(resolved));
      return undefined;
    }

    const token = localStorage.getItem('token');
    fetch(resolved, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        if (!(res.headers.get('content-type') || '').startsWith('image/')) {
          throw new Error('no-image');
        }
        return res.blob();
      })
      .then((blob) => {
        if (!alive) return;
        const url = URL.createObjectURL(blob);
        cache.set(resolved, url);
        setBlobUrl(url);
      })
      .catch(() => {
        if (alive) setBlobUrl(null);
      });

    return () => {
      alive = false;
    };
  }, [resolved]);

  if (!resolved || !blobUrl) return fallback;
  return <img src={blobUrl} alt={alt} className={className} />;
}
