import { useEffect, useState } from 'react';

const cache = new Map(); // url -> objectURL

/**
 * <img> que pide la imagen al backend con el token Bearer (las rutas /uploads
 * ahora requieren autenticación). Caché en memoria por sesión.
 */
export default function AuthImg({ src, alt = '', className = '', fallback = null }) {
  const [blobUrl, setBlobUrl] = useState(cache.get(src) || null);

  useEffect(() => {
    let alive = true;
    if (!src) return undefined;

    if (cache.has(src)) {
      setBlobUrl(cache.get(src));
      return undefined;
    }

    const token = localStorage.getItem('token');
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((blob) => {
        if (!alive) return;
        const url = URL.createObjectURL(blob);
        cache.set(src, url);
        setBlobUrl(url);
      })
      .catch(() => {
        if (alive) setBlobUrl(null);
      });

    return () => {
      alive = false;
    };
  }, [src]);

  if (!src || !blobUrl) return fallback;
  return <img src={blobUrl} alt={alt} className={className} />;
}
