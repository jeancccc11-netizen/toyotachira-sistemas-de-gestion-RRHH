const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = Router();

router.post('/login', authController.login);
router.post('/register', authMiddleware, roleMiddleware('admin'), authController.register);
router.get('/profile', authMiddleware, authController.profile);
router.get('/users', authMiddleware, roleMiddleware('admin'), authController.listUsers);

module.exports = router;
