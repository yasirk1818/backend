import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import KeywordManager from '../components/KeywordManager';

const socket = io('http://localhost:5000'); // Aapka Backend URL

const DashboardPage = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [status, setStatus] = useState('Disconnected');
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // User info from localStorage
        const user = JSON.parse(localStorage.getItem('userInfo'));
        if (user) {
            setUserInfo(user);
        }

        socket.on('qr_code', (url) => {
            setQrCodeUrl(url);
            setStatus('Please scan the QR code');
        });

        socket.on('status', (newStatus) => {
            setStatus(newStatus);
            if (newStatus === 'WhatsApp Connected') {
                setQrCodeUrl(''); // QR code hide karein
            }
        });

        socket.on('error', (errorMessage) => {
            setStatus(`Error: ${errorMessage}`);
        });

        return () => {
            socket.off('qr_code');
            socket.off('status');
            socket.off('error');
        };
    }, []);

    const handleConnect = () => {
        if (userInfo && userInfo._id) {
            setStatus('Initializing...');
            socket.emit('initialize-whatsapp', { userId: userInfo._id });
        }
    };

    return (
        <div>
            <h1>User Dashboard</h1>
            <h2>WhatsApp Connection</h2>
            <p>Status: {status}</p>
            
            {status === 'Disconnected' && (
                <button onClick={handleConnect}>Connect to WhatsApp</button>
            )}

            {qrCodeUrl && (
                <div>
                    <p>Scan this QR code with your WhatsApp app.</p>
                    <img src={qrCodeUrl} alt="WhatsApp QR Code" />
                </div>
            )}

            <hr />

            {status === 'WhatsApp Connected' && (
                <KeywordManager />
            )}
        </div>
    );
};

export default DashboardPage;
