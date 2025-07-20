const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false },
  whatsAppSession: {
      clientId: { type: String, default: null },
      status: { type: String, enum: ['disconnected', 'connected', 'pending_qr'], default: 'disconnected' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
