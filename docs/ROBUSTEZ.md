# Robustez de SI-GHR — qué se implementó y cómo operarlo

## 1. Seguridad

| Medida | Archivo | Detalle |
|---|---|---|
| `/uploads` protegido | `backend/src/middleware/uploadsAuth.js` | Los documentos (cédulas, exámenes, fotos) exigen token Bearer (header o `?token=` para `<img>`). El frontend descarga fotos con `AuthImg` (blob + cache). Path traversal bloqueado. |
| `JWT_SECRET` obligatorio en producción | `backend/src/config/env.js` | Si `NODE_ENV=production` y falta el secreto, el backend **no arranca**. |
| Rate limit en login | `backend/src/middleware/rateLimiters.js` | 10 intentos / 15 min por IP. Además 300 req/min para toda la API. |
| CORS con lista blanca | `backend/src/index.js` + `CORS_ORIGINS` | Sin lista, en dev queda abierto; en producción definir `CORS_ORIGINS`. |
| Headers de seguridad | `helmet` | HSTS, X-Frame-Options, nosniff, etc. |
| Logout con revocación | `tokenBlocklist.js` + `POST /api/auth/logout` | El token queda invalidado en el servidor hasta su expiración; el frontend lo llama al salir. |

## 2. Confiabilidad

- **Healthcheck real**: `GET /api/health` verifica la BD (`SELECT 1`) y devuelve 503 si está caída. El Dockerfile usa ese endpoint.
- **Pool PG con SSL automático**: `dbSsl.js` activa SSL contra hosts remotos (Supabase/Render) y lo omite en local.
- **Multer con filtros estrictos**: extensiones + MIME validados; errores 413/400 claros desde `errorHandler`.
- **Backups**:
  - Docker: servicio `db-backup` (pg_dump diario 02:00 UTC, retención 14 días, volumen `pgbackups`).
  - Windows: `database/backup-windows.ps1` — programar con el Programador de tareas (instrucciones en el encabezado del script).
  - Linux/Mac: `database/backup.sh` (compatible con cron).
- **pm2**: `backend/ecosystem.config.js` — reinicio automático en producción Windows:
  ```bash
  cd backend && npm run pm2:start
  ```

## 3. Migraciones versionadas

```bash
node database/migrate.js          # aplica pendientes (en orden alfabético)
node database/migrate.js status   # solo lista
```
- Cada `.sql` de `database/migrations/` se aplica **una sola vez**; el estado queda en la tabla `_migrations`.
- `001_baseline.sql` marca el esquema actual (creado con `sighr_schema.sql`): regístralo con
  `INSERT INTO _migrations (name) VALUES ('001_baseline.sql');` la primera vez.
- Cambios nuevos: crear `002_*.sql`, `003_*.sql`…

## 4. CI (GitHub Actions)

`.github/workflows/ci.yml` corre en cada push/PR a `main`:
- **backend**: `npm ci` + `jest` (usa secrets `DB_*` si están definidos; los tests que mockean la BD corren siempre).
- **frontend**: `npm ci` + `vitest` + `vite build`.

## 5. Variables de entorno

Ver `backend/.env.example` — incluye `JWT_SECRET`, `CORS_ORIGINS` y datos de BD documentados.

## Verificación (2026-09-26)

- Tests backend: **84/84** ✔ (incluye logout/revocación y protección de /uploads)
- Tests frontend: **23/23** ✔ · `vite build` ✔
- Smoke test en vivo: health con `db:up`, `/uploads` → 401 sin token, headers helmet presentes, logout revoca (perfil → 401) ✔
