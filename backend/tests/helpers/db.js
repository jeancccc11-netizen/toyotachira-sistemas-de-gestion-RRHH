const { query } = require('../../src/config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

const generateToken = (user = { id: 1, username: 'admin', rol: 'admin' }) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};

const seedTestData = async () => {
  const hash = await bcrypt.hash('admin123', 10);
  await query(
    `INSERT INTO usuarios (username, password_hash, rol)
     VALUES ('test_admin', $1, 'admin')
     ON CONFLICT (username) DO NOTHING`,
    [hash]
  );
};

const cleanupTestUser = async () => {
  await query("DELETE FROM usuarios WHERE username = 'test_admin'");
};

const getAuthHeader = () => ({
  Authorization: `Bearer ${generateToken()}`,
});

let cachedEmpId = null;
const getTestEmpleadoId = () => cachedEmpId;
const setTestEmpleadoId = (id) => { cachedEmpId = id; };

module.exports = { generateToken, seedTestData, cleanupTestUser, getAuthHeader, getTestEmpleadoId, setTestEmpleadoId };
