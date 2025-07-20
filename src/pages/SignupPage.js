import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import KeywordManager from '../components/KeywordManager';
import API from '../services/api';

const socket = io('http://localhost:5001'); // Backend URL

const DashboardPage = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [status, setStatus] = useState('loading...');
    const [message, setMessage] = useState('');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const updateStatus = useCallback(async () => {
        try {
            const { data } = await API.get('/user/status');
            setStatus(data.status);
            if(data.status !== 'connected') {
              setMessage('Your WhatsApp is disconnected.');
            } else {
              setMessage('WhatsApp is connected and running.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Could not fetch status.');
        }
    }, []);

    useEffect(() => {
        updateStatus();

        socket.on('connect', () => console.log('Socket connected!'));
        socket.on('qr_code', (url) => {
            setQrCodeUrl(url);
            setMessage('Scan this QR code with your WhatsApp app.');
        });
        socket.on('wa_status', (newStatus) => {
            setStatus(newStatus);
            if (newStatus === 'connected') {
                setQrCodeUrl('');
                setMessage('WhatsApp connected successfully!');
            }
            if (newStatus === 'disconnected') {
                setMessage('WhatsApp has been disconnected.');
            }
        });
        socket.on('wa_error', (err) => setMessage(`Error: ${err}`));

        return () => {
            socket.off('connect');
            socket.off('qr_code');
            socket.off('wa_status');
            socket.off('wa_error');
        };
    }, [updateStatus]);

    const handleConnect = () => {
        if (userInfo && userInfo._id) {
            setMessage('Initializing...');
            socket.emit('initialize-whatsapp', { userId: userInfo._id, token: userInfo.token });
        }
    };

    const handleDisconnect = () => {
        if (userInfo && userInfo._id) {
            setMessage('Disconnecting...');
            socket.emit('disconnect-whatsapp', { userId: userInfo._id });
        }
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <h3>Hi, {userInfo?.username}!</h3>

            <div className="card" style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2>WhatsApp Connection</h2>
                <p><strong>Status: </strong> <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{status}</span></p>
                {message && <div className={`alert ${status==='connected' ? 'alert-success' : 'alert-info'}`}>{message}</div>}

                {status !== 'connected' && <button onClick={handleConnect} className="btn">Connect</button>}
                {status === 'connected' && <button onClick={handleDisconnect} className="btn btn-danger">Disconnect</button>}
                
                {qrCodeUrl && (
                    <div style={{ marginTop: '1rem' }}>
                        <img src={qrCodeUrl} alt="WhatsApp QR Code" />
                    </div>
                )}
            </div>

            <hr style={{ margin: '2rem 0' }}/>
            
            {status === 'connected' ? <KeywordManager /> : <p>Please connect WhatsApp to manage keywords.</p>}
        </div>
    );
};

export default DashboardPage;
