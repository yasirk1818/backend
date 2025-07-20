const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { Server } = require("socket.io");
const User = require('../models/userModel');
const Keyword = require('../models/keywordModel');

let io;
const clients = {}; // userId -> client instance

const initializeWhatsAppService = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // Aapka React App URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected to socket:', socket.id);
        
        socket.on('initialize-whatsapp', async ({ userId }) => {
            console.log(`Initialization request for user: ${userId}`);
            const user = await User.findById(userId);
            if (!user) {
                socket.emit('error', 'User not found.');
                return;
            }

            const clientId = `client-${userId}`;
            const client = new Client({
                authStrategy: new LocalAuth({ clientId }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            });

            clients[userId] = client;

            client.on('qr', (qr) => {
                console.log(`QR Code for ${userId}`);
                qrcode.toDataURL(qr, (err, url) => {
                    socket.emit('qr_code', url);
                    User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'pending_qr' }).exec();
                });
            });

            client.on('ready', () => {
                console.log(`WhatsApp client is ready for ${userId}!`);
                socket.emit('status', 'WhatsApp Connected');
                User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'connected', 'whatsAppSession.clientId': clientId }).exec();
            });

            client.on('disconnected', (reason) => {
                console.log(`Client for ${userId} was logged out`, reason);
                socket.emit('status', 'Disconnected. Please reconnect.');
                User.findByIdAndUpdate(userId, { 'whatsAppSession.status': 'disconnected' }).exec();
                delete clients[userId];
                client.destroy();
            });

            client.on('message', async (message) => {
                const userKeywords = await Keyword.find({ userId: userId });
                const receivedMsg = message.body.trim().toLowerCase();
                
                for (const item of userKeywords) {
                    if (receivedMsg === item.keyword.toLowerCase()) {
                        client.sendMessage(message.from, item.reply);
                        console.log(`Replied to ${message.from} for user ${userId}`);
                        break;
                    }
                }
            });

            client.initialize();
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected from socket');
        });
    });
};

const getClient = (userId) => {
    return clients[userId];
};

module.exports = { initializeWhatsAppService, getClient };
