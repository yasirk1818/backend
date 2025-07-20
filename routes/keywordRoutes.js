const express = require('express');
const router = express.Router();
const { getKeywords, createKeyword, deleteKeyword } = require('../controllers/keywordController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getKeywords).post(protect, createKeyword);
router.route('/:id').delete(protect, deleteKeyword);

module.exports = router;
