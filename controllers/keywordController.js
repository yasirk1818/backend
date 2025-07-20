const Keyword = require('../models/keywordModel');

// @desc    Get user's keywords
// @route   GET /api/keywords
// @access  Private
const getKeywords = async (req, res) => {
    const keywords = await Keyword.find({ userId: req.user._id });
    res.json(keywords);
};

// @desc    Create a new keyword
// @route   POST /api/keywords
// @access  Private
const createKeyword = async (req, res) => {
    const { keyword, reply } = req.body;
    if (!keyword || !reply) {
        return res.status(400).json({ message: 'Keyword and reply are required' });
    }
    
    const newKeyword = new Keyword({
        userId: req.user._id,
        keyword,
        reply
    });

    try {
        const createdKeyword = await newKeyword.save();
        res.status(201).json(createdKeyword);
    } catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({ message: 'This keyword already exists.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a keyword
// @route   DELETE /api/keywords/:id
// @access  Private
const deleteKeyword = async (req, res) => {
    const keyword = await Keyword.findById(req.params.id);

    if (keyword && keyword.userId.toString() === req.user._id.toString()) {
        await keyword.deleteOne();
        res.json({ message: 'Keyword removed' });
    } else {
        res.status(404).json({ message: 'Keyword not found or not authorized' });
    }
};

module.exports = { getKeywords, createKeyword, deleteKeyword };
