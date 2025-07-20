const express = require('express');
const router = express.Router();
const { getWhatsappStatus } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', protect, getWhatsappStatus);

module.exports = router;
