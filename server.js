require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { initializeWhatsAppService } = require('./services/whatsappService');

// App Initialization
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Frontend URL
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully...'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Initialize WhatsApp Service and Socket.IO
initializeWhatsAppService(server);

// API Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/keywords', require('./routes/keywordRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Backend server is active on port ${PORT}`));
