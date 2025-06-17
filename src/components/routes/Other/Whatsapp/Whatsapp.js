// src/components/routes/Other/Whatsapp/Whatsapp.js

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Whatsapp.css";

const WhatsAppScanner = () => {
    const [instanceId, setInstanceId] = useState(() => {
        let storedId = localStorage.getItem('instanceId');
        if (!storedId) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.username) {
                        storedId = decoded.username.toLowerCase().replace(/\s+/g, '_');
                        localStorage.setItem('instanceId', storedId);
                    }
                } catch (error) {
                    console.error('Failed to decode token:', error);
                }
            }
        }
        return storedId || '';
    });
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('disconnected');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [lastQrUpdate, setLastQrUpdate] = useState(0);
    const [lastInitAttempt, setLastInitAttempt] = useState(0);
    const QR_REFRESH_THRESHOLD = 10000; // 10 seconds

    useEffect(() => {
        const storedInstanceId = localStorage.getItem('instanceId');
        if (storedInstanceId) {
            setInstanceId(storedInstanceId);
        } else {
            setError('Instance ID not found. Please log in again.');
            setStatus('error');
        }
    }, []);

    const initializeWhatsApp = async () => {
        try {
            setError('');
            setLoading(true);
            setLastInitAttempt(Date.now());
            const token = localStorage.getItem('token');
            console.log('JWT Token:', token);
            const deviceId = localStorage.getItem('deviceId') || getDeviceIdFromToken(token);
            const currentInstanceId = localStorage.getItem('instanceId');
            if (!currentInstanceId) {
                setError('No WhatsApp instance ID found. Please log in again.');
                setStatus('disconnected');
                setQrCode('');
                return;
            }
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setStatus('disconnected');
                setQrCode('');
                return;
            }
            const apiUrl = `${process.env.REACT_APP_API_URL}`;
            console.log('Initializing WhatsApp with API URL:', apiUrl);
            const initResponse = await axios.get(`${apiUrl}/whatsapp/init/${currentInstanceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-device-id': deviceId
                }
            });
            
            if (initResponse.data.success) {
                if (initResponse.data.qrCode) {
                    setQrCode(initResponse.data.qrCode);
                    setLastQrUpdate(Date.now());
                    setStatus('waiting_for_scan');
                } else if (initResponse.data.connected || initResponse.data.status === 'connected') {
                    setStatus('connected');
                    setQrCode('');
                } else {
                    setStatus(initResponse.data.status || 'disconnected');
                }
            } else {
                setError(initResponse.data.message || 'Failed to initialize WhatsApp');
            }
        } catch (err) {
            setError('Failed to initialize WhatsApp connection');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkConnectionStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('JWT Token:', token);
            const deviceId = localStorage.getItem('deviceId') || getDeviceIdFromToken(token);
            let currentInstanceId = localStorage.getItem('instanceId');
            if (!currentInstanceId && token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.username) {
                        currentInstanceId = decoded.username.toLowerCase().replace(/\s+/g, '_');
                        localStorage.setItem('instanceId', currentInstanceId);
                        setInstanceId(currentInstanceId);
                    }
                } catch (error) {
                    console.error('Failed to decode token:', error);
                }
            }
            if (!currentInstanceId) {
                setError('No WhatsApp instance ID found. Please initialize a new instance.');
                setStatus('disconnected');
                setQrCode('');
                return;
            }
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setStatus('disconnected');
                setQrCode('');
                return;
            }
            console.log('Token being used:', token);
            try {
                const decoded = jwtDecode(token);
                console.log('Decoded token content:', decoded);
            } catch (decodeError) {
                console.error('Token decode error:', decodeError);
            }
            const apiUrl = `${process.env.REACT_APP_API_URL}/whatsapp/status/${currentInstanceId}`;
            console.log(apiUrl);
            const response = await axios.get(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-device-id': deviceId
                }
            });
            const { status: newStatus, qrCode: newQrCode, lastUpdate } = response.data;
            setStatus(newStatus);
            const qrCodeAge = lastUpdate ? (Date.now() - new Date(lastUpdate).getTime()) / 1000 : 0;
            const qrCodeRefreshThreshold = 25; // seconds

            if (newQrCode && qrCodeAge < qrCodeRefreshThreshold) {
                setQrCode(newQrCode);
                if (newStatus === 'disconnected') {
                    setStatus('waiting_for_scan');
                }
            } else {
                setQrCode('');
                // Do NOT auto-reinit. User must press "Reset Connection" to request a fresh QR.
            }
        } catch (err) {
            console.error('Error:', err);
            setError(`Failed to check connection status: ${err.message}`);
            setStatus('disconnected');
            setQrCode('');
        }
    }, []);

    const handleReset = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('JWT Token:', token);
            const deviceId = localStorage.getItem('deviceId') || getDeviceIdFromToken(token);
            if (!token) {
                setError('No authentication token found. Please log in again.');
                return;
            }
            const apiUrl = `${process.env.REACT_APP_API_URL}/whatsapp/reset/${instanceId}`;
            await axios.post(apiUrl, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-device-id': deviceId
                }
            });
            setStatus('disconnected');
            setQrCode('');
            setError('Connection reset successfully.');
            // Now explicitly init to fetch a new QR because auto-reinit is disabled
            initializeWhatsApp();
            checkConnectionStatus();
        } catch (err) {
            console.error('Error resetting connection:', err);
            setError(`Failed to reset connection: ${err.message}`);
        }
    };

    useEffect(() => {
        initializeWhatsApp();
        const statusInterval = setInterval(checkConnectionStatus, 5000); // 5 seconds
        return () => clearInterval(statusInterval);
    }, [checkConnectionStatus]);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    function getDeviceIdFromToken(token) {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            return decoded.deviceId || '';
        } catch (e) {
            console.error('Failed to decode token for device ID:', e);
            return '';
        }
    }

    if (isMinimized) {
        return (
            <div className="whatsapp-minimized" onClick={toggleMinimize}>
                <i className="fab fa-whatsapp"></i>
            </div>
        );
    }

    return (
        <div className="whatsapp-scanner-container">
            <div className="whatsapp-scanner-card">
                <div className="whatsapp-header">
                    <h2>WhatsApp Connection</h2>
                    <button className="minimize-button" onClick={toggleMinimize}>
                        <i className="fas fa-minus"></i>
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                
                {status === 'disconnected' && (
                    <div className="status-message disconnected">
                        <i className="fas fa-times-circle"></i>
                        WhatsApp is disconnected
                    </div>
                )}
                
                {qrCode && (
                    <div className="qr-container">
                        <img src={qrCode} alt="WhatsApp QR Code" className="qr-image" />
                        <p className="qr-instruction">Scan this QR code with WhatsApp on your phone</p>
                    </div>
                )}
                
                {status === 'connected' && (
                    <div className="status-message connected">
                        <i className="fas fa-check-circle"></i>
                        WhatsApp is connected
                    </div>
                )}

                {status === 'reconnecting' && (
                    <div className="status-message reconnecting">
                        <i className="fas fa-sync fa-spin"></i>
                        Connecting to WhatsApp...
                    </div>
                )}
                
                {status !== 'connected' && status !== 'reconnecting' && (
                    <button 
                        className="refresh-button"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Connection"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default WhatsAppScanner;