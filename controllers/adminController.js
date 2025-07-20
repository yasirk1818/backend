const User = require('../models/userModel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Toggle block status of a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.isBlocked = !user.isBlocked;
        const updatedUser = await user.save();
        res.json({ message: `User ${user.username} has been ${user.isBlocked ? 'blocked' : 'unblocked'}`, user: updatedUser });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete an admin user' });
        }
        await user.deleteOne();
        // Also delete associated keywords, sessions etc. (logic to be added)
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { getUsers, toggleBlockUser, deleteUser };
