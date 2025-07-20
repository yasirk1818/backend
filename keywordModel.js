const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keyword: { type: String, required: true },
  reply: { type: String, required: true },
});

// User per keyword unique honi chahiye
keywordSchema.index({ userId: 1, keyword: 1 }, { unique: true });

module.exports = mongoose.model('Keyword', keywordSchema);
