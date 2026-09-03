require('dotenv').config({ override: true });
process.env.NODE_ENV = 'test';
process.env.PORT = '0';

// Override env for test database connection
if (!process.env.DB_HOST) {
  console.warn('[TEST] No DB connection configured. Set DB_HOST, DB_USER, DB_PASSWORD in .env');
}
