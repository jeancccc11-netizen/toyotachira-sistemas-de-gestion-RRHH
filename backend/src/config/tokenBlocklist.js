/**
 * Blocklist en memoria de tokens revocados (logout).
 * Suficiente para una sola instancia del backend; si se escala horizontalmente,
 * mover a Redis o a una tabla de BD.
 */
const revoked = new Map(); // jti -> exp (segundos unix)

const revoke = (jti, exp) => {
  revoked.set(jti, exp);
};

const isRevoked = (jti) => revoked.has(jti);

// Cada 10 min purga los entries ya expirados
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of revoked) {
    if (exp <= now) revoked.delete(jti);
  }
}, 10 * 60 * 1000).unref();

module.exports = { revoke, isRevoked };
