const express = require('express');
const router = express.Router();
const { getUsers, toggleBlockUser, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/block', protect, admin, toggleBlockUser);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;```

#### **13. `backend/controllers/userController.js`**
```javascript
const User = require('../models/userModel');

// @desc    Get user's WhatsApp status
// @route   GET /api/user/status
// @access  Private
const getWhatsappStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ status: user.whatsAppSession.status });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getWhatsappStatus };
