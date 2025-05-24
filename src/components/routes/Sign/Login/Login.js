// src/components/routes/Sign/Login/Login.js

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getDeviceId } from "../../../../utils/device";
import "./Login.css";

const Login = () => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Check if user is locked out
    const checkLockoutStatus = async (email) => {
        if (!email) return;
        
        const lockedUntil = localStorage.getItem(`lockout_${email}`);
        if (lockedUntil) {
            const remainingTime = Math.ceil((parseInt(lockedUntil) - Date.now()) / 1000);
            if (remainingTime > 0) {
                setIsLocked(true);
                setLockoutTimer(remainingTime);
                startLockoutTimer(remainingTime, email);
            } else {
                localStorage.removeItem(`lockout_${email}`);
            }
        }
    };

    const startLockoutTimer = (duration, email) => {
        setLockoutTimer(duration);
        
        const timer = setInterval(() => {
            setLockoutTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsLocked(false);
                    localStorage.removeItem(`lockout_${email}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return timer;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Check lockout status when email changes
        if (name === 'email') {
            checkLockoutStatus(value);
        }
        
        // Clear error when user starts typing
        setError(null);
    };

    // Function to validate form inputs
    const validateForm = () => {
        const { email, password } = formData;
        if (!email || !password ) {
            setError('Please fill in all the required fields');
            return false;
        }
        if (password.length < 8) {
            setError('Please enter a password with a minimum length of 8 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!validateForm()) return;

        if (isLocked) {
            setError(`Account locked. Try again in ${lockoutTimer} seconds`);
            return;
        }

        setLoading(true);
        
        try {
            // Clear any existing tokens and sessions first
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            
            const apiUrl = process.env.REACT_APP_API_URL;
            const deviceId = getDeviceId();
            
            const response = await axios.post(`${apiUrl}/login`, formData, {
                headers: {
                    'x-device-id': deviceId,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data?.success && response.data?.data?.token) {
                const { token } = response.data.data;
                const tokenData = jwtDecode(token);

                // Verify this is an admin token
                if (!tokenData.isAdmin) {
                    throw new Error('Not authorized as admin');
                }

                // Store admin data
                const adminData = {
                    id: tokenData.id,
                    username: tokenData.username,
                    email: tokenData.email,
                    isAdmin: true,
                    deviceId,
                    sessionId: tokenData.sessionId
                };

                // Store token and admin data
                localStorage.setItem('token', token);
                localStorage.setItem('admin', JSON.stringify(adminData));

                // Reload the page instead of using navigate
                window.location.reload();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error("Login error:", error);
            
            // Handle lockout
            if (error.response?.status === 429) {
                const { remainingTime } = error.response.data;
                setIsLocked(true);
                
                // Store lockout expiry time
                const lockoutExpiry = Date.now() + (remainingTime * 1000);
                localStorage.setItem(`lockout_${formData.email}`, lockoutExpiry.toString());
                
                // Start countdown timer
                startLockoutTimer(remainingTime, formData.email);
                setError(`Too many failed attempts. Try again in ${remainingTime} seconds`);
            } else if (error.response?.status === 401) {
                setError('Invalid email or password');
            } else if (error.message === 'Not authorized as admin') {
                setError('This account does not have admin privileges');
            } else {
                setError(error.response?.data?.message || "Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Initialize lockout check on component mount
    useEffect(() => {
        const email = formData.email;
        if (email) {
            checkLockoutStatus(email);
        }

        // Check for existing session
        const token = localStorage.getItem('token');
        const admin = localStorage.getItem('admin');
        
        if (token && admin) {
            try {
                const tokenData = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                
                // If token is still valid, redirect to admin dashboard
                if (tokenData.exp > currentTime) {
                    navigate('/admin', { replace: true });
                } else {
                    // Clear expired session
                    localStorage.removeItem('token');
                    localStorage.removeItem('admin');
                }
            } catch (error) {
                // Clear invalid session
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
            }
        }
    }, [navigate]);

    return (
        <div className="login-page">
            <h2 className="login-headi">Login</h2>
            <div className="login-container">
                <div className="login-left">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    {isLocked && (
                        <div className="lockout-message">
                            Account locked. Try again in {lockoutTimer} seconds
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <label>Email</label>
                        <input 
                            type="email"    
                            name="email" 
                            placeholder="Enter email"
                            value={formData.email} 
                            onChange={handleInputChange} 
                            disabled={isLocked || loading}
                            className={isLocked ? 'input-locked' : ''}
                            required 
                        />
                        
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Enter password"
                            value={formData.password} 
                            onChange={handleInputChange} 
                            disabled={isLocked || loading}
                            className={isLocked ? 'input-locked' : ''}
                            required 
                        />
                        
                        <button 
                            type="submit" 
                            disabled={isLocked || loading}
                            className={loading ? 'loading' : ''}
                        >
                            {loading ? 'Login...' : 'Login'}
                        </button>
                        <div className="forgot-password-link">
                            <Link to="/forgot-password">Forgot Password</Link>
                        </div>
                    </form>
                </div>

                <div className="login-right">
                    <img
                        src="/uploads/sign.webp"
                        className="sign-icon"
                        alt="sign icon"
                        aria-label="sign"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
