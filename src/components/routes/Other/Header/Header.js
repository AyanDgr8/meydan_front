// src/components/routes/Other/Header/Header.js

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../../utils/api';
// import FileUpload from './Upload/FileUpload';
import DownloadData from './Download/DownloadData';
import { handleLogoutApi } from '../../../../utils/api';
import "./Header.css";

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [queueSearchQuery, setQueueSearchQuery] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate(); 

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await api.get('/current-user', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            
            console.log('User data from API:', response.data);
            setUsername(response.data.username || '');
            setUserRole(response.data.role || '');
            console.log('Set user role to:', response.data.role);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setUsername('');
        }
    }, [localStorage.getItem('token')]);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            alert("Please enter a search term."); 
            return;
        }

        try {
            const searchTerm = encodeURIComponent(searchQuery.trim());
            navigate(`/customers/search?query=${searchTerm}`);
            setSearchQuery('');
        } catch (error) {
            console.error('Error in search:', error);
        }
    };

    const handleQueueSearch = () => {
        if (!queueSearchQuery.trim()) {
            alert("Please enter a team name to search."); 
            return;
        }

        try {
            const searchTerm = encodeURIComponent(queueSearchQuery.trim());
            navigate(`/customers/search?team=${searchTerm}`);
            setQueueSearchQuery('');
        } catch (error) {
            console.error('Error in queue search:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleQueueKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleQueueSearch();
        }
    };

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;
        try {
            await handleLogoutApi();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const isLoggedIn = !!localStorage.getItem("token");

    const handleReminderClick = () => {
        navigate('/customers/reminders');
    };

    return (
        <div className="header-container">
            {isLoggedIn ? (
                <Link to="/admin" className="logo-link">
                        <img 
                            src="/uploads/logo.webp"
                            className="logo"
                            alt="Company Logo"
                        aria-label="Logo"
                        />
                    </Link>
            ) : (
                <img 
                    src="/uploads/logo.webp"
                    className="logo"
                    alt="Company Logo"
                    aria-label="Logo"
                />
            )}
            <div className="header-right">
                {isLoggedIn ? (
                    <>
                    <div className="header-search queue-search">
                        <input
                            type="text"
                            className="form-control form-cont"
                            aria-label="Team search input"
                            placeholder="Search records"
                            value={queueSearchQuery}
                            onChange={(e) => setQueueSearchQuery(e.target.value)}
                            onKeyDown={handleQueueKeyDown}
                        />
                        <img 
                            src="/uploads/search.svg"
                            className="srch-icon"
                            alt="search-icon"
                            onClick={handleQueueSearch}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    {/* <div className="header-search">
                        <input
                            type="text"
                            className="form-control form-cont"
                            aria-label="Search input"
                            placeholder="Search Records"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <img 
                            src="/uploads/search.svg"
                            className="srch-icon"
                            alt="search-icon"
                            onClick={handleSearch}
                            style={{ cursor: 'pointer' }}
                        />
                    </div> */}

                        {/* Upload button */}
                        {/* <div className="file-upload-section">
                            <FileUpload />
                        </div> */}

                        {/* Download button */}
                    <div className="download-section">
                        <DownloadData />
                    </div>

                        {/* <div className="notification-section">
                            <img 
                                src="/uploads/bell.svg"
                                className="notification-icon"
                                alt="notification icon"
                                aria-label="Notification"
                                onClick={handleReminderClick}
                                style={{ cursor: 'pointer' }}
                            />   
                        </div> */}
                    <div className="profile-section">
                        <div className="profile-dropdown">
                            <img 
                                src="/uploads/MultyLogo.png"
                                className="pro-icon"
                                alt="profile icon"
                                aria-label="Profile"
                            />
                            <div className="dropdown-content">
                                {userRole === 'admin' && (
                                    <Link to="/brand">Brand Management</Link>
                                )}
                                <Link to="/business">Business Center Management</Link>
                                <Link to="/receptionist">Receptionist Management</Link>
                                <Link to="/admin">Companies and Users</Link>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-footer">
                                    <span onClick={handleLogout} className="logout-btn">Logout</span>
                                    {!isLoading && username && (
                                        <span className="username">{username}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <Link to="/login">
                    <img 
                        src="/uploads/profile.svg"
                        className="pro-icon"
                        alt="profile icon"
                        aria-label="Profile"
                    />
                </Link>
            )}
        </div>
        </div>    
    );
};

export default Header;
