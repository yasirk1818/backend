require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // HTTP server ke liye
const { initializeWhatsAppService } = require('./services/whatsappService');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

// WhatsApp Service ko initialize karein
initializeWhatsAppService(server);


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/keywords', require('./routes/keywordRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// User-specific routes
const { router: userRouter, userController } = require('./routes/userRoutes');
app.use('/api/user', userRouter);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
