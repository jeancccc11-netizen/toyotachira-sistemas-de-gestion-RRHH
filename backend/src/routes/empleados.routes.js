const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl = require('../controllers/empleados.controller');
const { authMiddleware } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = Router();
router.use(authMiddleware);

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const photoStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + unique + path.extname(file.originalname));
  },
});
const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    cb(null, /jpg|jpeg|png/.test(file.mimetype));
  },
});

const createValidation = {
  nro: { type: 'number', required: true },
  cedula: { type: 'string', required: true, max: 20 },
  nombre_completo: { type: 'string', required: true, max: 150 },
  departamento_id: { type: 'number', required: true },
  fecha_ingreso: { type: 'date', required: true },
  salario_base: { type: 'number', required: true, min: 0 },
};

const fotoUrlFor = (filename) => `/uploads/${encodeURIComponent(filename)}`;

// Obtiene la URL pública de la foto (maneja registros viejos que guardaban ruta absoluta del disco)
const publicFotoUrl = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//.test(raw) || raw.startsWith('/uploads/')) return raw;
  const filename = String(raw).split('\\').join('/').split('/').pop();
  return fotoUrlFor(filename);
};

router.get('/stats', ctrl.stats);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validateBody(createValidation), ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

router.post('/:id/foto', photoUpload.single('foto'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const { query } = require('../config/database');
    // Guardamos la URL pública (/uploads/<archivo>) para que el navegador pueda cargarla
    const result = await query(
      'UPDATE empleados SET foto_url = $1 WHERE id = $2 RETURNING id, foto_url',
      [fotoUrlFor(req.file.filename), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ...result.rows[0], foto_url: publicFotoUrl(result.rows[0].foto_url) });
  } catch (err) { next(err); }
});

// Normaliza foto_url (soporta registros viejos con ruta absoluta del disco)
router.get('/:id/foto/url', async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    const result = await query('SELECT foto_url FROM empleados WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ id: Number(req.params.id), foto_url: publicFotoUrl(result.rows[0].foto_url) });
  } catch (err) { next(err); }
});

module.exports = router;
