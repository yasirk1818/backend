const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { Server } = require("socket.io");
const User = require('../models/userModel');
const Keyword = require('../models/keywordModel');

let io;
const clients = {}; // Active clients: { userId: client }

const initializeWhatsAppService = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // React App URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on('initialize-whatsapp', async ({ userId, token }) => {
            // Basic token verification can be added here if needed
            if (!userId) {
                return socket.emit('wa_error', 'User ID is missing.');
            }

            console.log(`WhatsApp initialization request for user: ${userId}`);
            
            if (clients[userId]) {
                 console.log(`Client for ${userId} already exists.`);
                 socket.emit('wa_status', 'Session is already active.');
                 return;
            }

            const client = new Client({
                authStrategy: new LocalAuth({ clientId: `session-${userId}` }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            });

            clients[userId] = client;

            client.on('qr', (qr) => {
                console.log(`QR generated for ${userId}`);
                qrcode.toDataURL(qr, (err, url) => {
                    socket.emit('qr_code', url);
                    User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'pending_qr' }).exec();
                    socket.emit('wa_status', 'QR code received. Please scan.');
                });
            });

            client.on('ready', async () => {
                console.log(`Client is ready for user: ${userId}`);
                await User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'connected' });
                socket.emit('wa_status', 'connected');
            });

            client.on('disconnected', async (reason) => {
                console.log(`Client for ${userId} was disconnected. Reason: ${reason}`);
                await User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'disconnected' });
                socket.emit('wa_status', 'disconnected');
                client.destroy();
                delete clients[userId];
            });
            
            client.on('auth_failure', async (msg) => {
                console.error(`Authentication failure for ${userId}:`, msg);
                await User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'disconnected' });
                socket.emit('wa_error', 'Authentication failed. Please try again.');
                delete clients[userId];
            });

            client.on('message', async (message) => {
                try {
                    const userKeywords = await Keyword.find({ userId: userId });
                    const receivedMsg = message.body.trim().toLowerCase();
                    
                    for (const item of userKeywords) {
                        if (receivedMsg === item.keyword) { // Exact match
                            await client.sendMessage(message.from, item.reply);
                            console.log(`Replied to ${message.from} for user ${userId} with keyword: "${item.keyword}"`);
                            break; // Stop after first match
                        }
                    }
                } catch(e){
                   console.error("Error processing message: ", e);
                }
            });

            client.initialize().catch(err => {
                console.error(`Failed to initialize client for ${userId}:`, err);
                socket.emit('wa_error', 'Failed to initialize WhatsApp. Please try again.');
                delete clients[userId];
            });
        });

        socket.on('disconnect-whatsapp', async ({ userId }) => {
            console.log(`Disconnect request for user: ${userId}`);
            if (clients[userId]) {
                await clients[userId].logout();
                console.log(`User ${userId} logged out.`);
            } else {
                // If client doesn't exist, just update DB
                await User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'disconnected' });
                socket.emit('wa_status', 'disconnected');
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};

module.exports = { initializeWhatsAppService };
