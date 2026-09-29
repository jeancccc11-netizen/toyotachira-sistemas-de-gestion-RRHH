/**
 * Validaciones centralizadas del frontend.
 * Cada validador devuelve un string con el error, o null si es válido.
 */

export const required = (v, label = 'Este campo') => {
  if (v === undefined || v === null || String(v).trim() === '') return `${label} es obligatorio`;
  return null;
};

export const cedulaVE = (v) => {
  if (!v) return 'Cédula es obligatoria';
  const limpio = String(v).replace(/[.\-\s]/g, '');
  if (!/^[VvEeJgG]\d{4,9}$/.test(limpio)) return 'Cédula inválida. Formato: V-12345678';
  return null;
};

/** Cuenta bancaria venezolana: 20 dígitos (los 4 primeros = código de banco) */
export const cuentaBancaria = (v) => {
  if (!v) return null; // opcional
  const limpio = String(v).replace(/[\s\-]/g, '');
  if (!/^\d{20}$/.test(limpio)) return 'La cuenta debe tener exactamente 20 dígitos';
  return null;
};

export const telefono = (v) => {
  if (!v) return null;
  const limpio = String(v).replace(/[\s\-().]/g, '');
  if (!/^\+?\d{7,15}$/.test(limpio)) return 'Teléfono inválido (7 a 15 dígitos)';
  return null;
};

export const email = (v) => {
  if (!v) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim())) return 'Correo inválido';
  return null;
};

export const montoPositivo = (v, label = 'El monto') => {
  if (v === undefined || v === null || String(v).trim() === '') return `${label} es obligatorio`;
  const n = parseFloat(v);
  if (Number.isNaN(n)) return `${label} debe ser un número`;
  if (n < 0) return `${label} no puede ser negativo`;
  return null;
};

export const enteroPositivo = (v, label = 'Este campo') => {
  if (v === undefined || v === null || String(v).trim() === '') return `${label} es obligatorio`;
  const n = parseInt(v, 10);
  if (Number.isNaN(n) || n <= 0 || String(n) !== String(v).trim()) return `${label} debe ser un entero positivo`;
  return null;
};

export const fechaISO = (v, label = 'La fecha') => {
  if (!v) return `${label} es obligatoria`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return `${label} inválida`;
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return `${label} inválida`;
  return null;
};

/** fechaFin debe ser posterior a fechaInicio (ambas YYYY-MM-DD) */
export const rangoFechas = (inicio, fin, labelInicio = 'La fecha de inicio', labelFin = 'La fecha fin') => {
  const e1 = fechaISO(inicio, labelInicio);
  if (e1) return e1;
  const e2 = fechaISO(fin, labelFin);
  if (e2) return e2;
  if (new Date(fin) <= new Date(inicio)) return `${labelFin} debe ser posterior a ${labelInicio.toLowerCase()}`;
  return null;
};

export const password = (v, min = 6) => {
  if (!v) return 'La contraseña es obligatoria';
  if (String(v).length < min) return `La contraseña debe tener al menos ${min} caracteres`;
  return null;
};

/** Devuelve 0 si el monto es razonable, o error si excede un tope sanitario */
export const montoRazonable = (v, tope = 1_000_000_000) => {
  const n = parseFloat(v);
  if (!Number.isNaN(n) && n > tope) return 'El monto excede el máximo permitido';
  return null;
};
