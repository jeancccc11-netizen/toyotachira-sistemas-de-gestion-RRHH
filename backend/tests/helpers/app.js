const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { apiLimiter, loginLimiter } = require('../../src/middleware/rateLimiters');
const routes = require('../../src/routes');
const errorHandler = require('../../src/middleware/errorHandler');
const uploadsAuth = require('../../src/middleware/uploadsAuth');

// En tests usamos el secreto de test (mismo fallback que helpers/db.js)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
const env = { uploadDir: './uploads', jwtSecret: process.env.JWT_SECRET };

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossoriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);
app.use('/uploads', uploadsAuth(env));
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
