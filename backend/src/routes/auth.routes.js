const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiters');

const router = Router();

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/register', authMiddleware, roleMiddleware('admin'), authController.register);
router.get('/profile', authMiddleware, authController.profile);
router.get('/users', authMiddleware, roleMiddleware('admin'), authController.listUsers);

module.exports = router;
