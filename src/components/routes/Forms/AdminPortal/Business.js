// src/components/routes/Forms/AdminPortal/Business.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Business.css';

const Business = () => {
    const [businesses, setBusinesses] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        business_name: '',
        business_phone: '',
        business_whatsapp: '',
        business_email: '',
        business_password: '',
        business_address: '',
        business_country: '',
        business_tax_id: '',
        business_reg_no: '',
        other_detail: ''
    });

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin');
                return;
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/business`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBusinesses(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching businesses:', error);
            setError('Error fetching businesses');
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin');
                return;
            }

            const url = editingBusiness
                ? `${process.env.REACT_APP_API_URL}/business/${editingBusiness.id}`
                : `${process.env.REACT_APP_API_URL}/business`;

            const method = editingBusiness ? 'put' : 'post';

            const response = await axios[method](url, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setSuccess(response.data.message);
            fetchBusinesses();
            resetForm();
        } catch (error) {
            console.error('Error saving business:', error);
            setError(error.response?.data?.message || 'Error saving business');
        }
    };

    const handleEdit = (business) => {
        setEditingBusiness(business);
        setFormData({
            business_name: business.business_name,
            business_phone: business.business_phone,
            business_whatsapp: business.business_whatsapp,
            business_email: business.business_email,
            business_password: business.business_password,
            business_address: business.business_address,
            business_country: business.business_country,
            business_tax_id: business.business_tax_id,
            business_reg_no: business.business_reg_no,
            other_detail: business.other_detail
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this business?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin');
                return;
            }

            await axios.delete(`${process.env.REACT_APP_API_URL}/business/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Business deleted successfully');
            fetchBusinesses();
        } catch (error) {
            console.error('Error deleting business:', error);
            setError('Error deleting business');
        }
    };

    const resetForm = () => {
        setFormData({
            business_name: '',
            business_phone: '',
            business_whatsapp: '',
            business_email: '',
            business_password: '',
            business_address: '',
            business_country: '',
            business_tax_id: '',
            business_reg_no: '',
            other_detail: ''
        });
        setEditingBusiness(null);
        setShowForm(false);
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="business-container">
            <h2>Business Management</h2>
            
            <button 
                className="add-business-btn"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Cancel' : 'Add New Business'}
            </button>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="business-form">
                    <h3>{editingBusiness ? 'Edit Business' : 'Add New Business'}</h3>
                    
                    <div className="form-groupppp">
                        <input
                            type="text"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleInputChange}
                            placeholder="Business Name *"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-groupppp">
                            <input
                                type="tel"
                                name="business_phone"
                                value={formData.business_phone}
                                onChange={handleInputChange}
                                placeholder="Phone Number"
                            />
                        </div>
                        <div className="form-groupppp">
                            <input
                                type="tel"
                                name="business_whatsapp"
                                value={formData.business_whatsapp}
                                onChange={handleInputChange}
                                placeholder="WhatsApp Number"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-groupppp">
                            <input
                                type="email"
                                name="business_email"
                                value={formData.business_email}
                                onChange={handleInputChange}
                                placeholder="Business Email"
                            />
                        </div>
                        <div className="form-groupppp">
                            <div className="password-input-container">
                                <div className="info-icon">
                                    <i className="fas fa-info-circle"></i>
                                    <div className="info-tooltip">
                                        <strong>Steps to Generate or View a Google App Password</strong>
                                        <p>App passwords are unique 16-character codes used to sign in to your Google Account from apps that don't support 2-Step Verification.</p>
                                        
                                        <ul>
                                            <li>
                                                <strong>1. Ensure 2-Step Verification is Enabled</strong><br/>
                                                Go to: <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">Google Security Settings</a>
                                            </li>
                                            <li>
                                                <strong>2. Generate a New App Password</strong><br/>
                                                Go to: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">App Passwords</a>
                                            </li>
                                            <li>Select "Mail" under "Select app"</li>
                                            <li>Choose "Other (Custom name)" and name it "Business Center"</li>
                                            <li>Copy the generated 16-character password immediately</li>
                                        </ul>
                                        <p>⚠️ You won't be able to view the password again later.</p><br/>
                                        <p>❌ If you already generated one but didn’t save it:</p>
                                        <p>You cannot retrieve an old app password from Google. You will have to generate a new one using the steps above.</p>
                                    </div>
                                </div>
                                <input
                                    type="password"
                                    name="business_password"
                                    value={formData.business_password}
                                    onChange={handleInputChange}
                                    placeholder="Business Password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-groupppp">
                        <textarea
                            name="business_address"
                            value={formData.business_address}
                            onChange={handleInputChange}
                            placeholder="Business Address"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-groupppp">
                            <input
                                type="text"
                                name="business_country"
                                value={formData.business_country}
                                onChange={handleInputChange}
                                placeholder="Country"
                            />
                        </div>
                        <div className="form-groupppp">
                            <input
                                type="text"
                                name="business_tax_id"
                                value={formData.business_tax_id}
                                onChange={handleInputChange}
                                placeholder="Tax ID"
                            />
                        </div>
                    </div>

                    <div className="form-groupppp">
                        <input
                            type="text"
                            name="business_reg_no"
                            value={formData.business_reg_no}
                            onChange={handleInputChange}
                            placeholder="Registration Number"
                        />
                    </div>

                    <div className="form-groupppp">
                        <textarea
                            name="other_detail"
                            value={formData.other_detail}
                            onChange={handleInputChange}
                            placeholder="Other Details"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit">
                            {editingBusiness ? 'Update Business' : 'Create Business'}
                        </button>
                        <button type="button" onClick={resetForm}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="businesses-list">
                {businesses.map(business => (
                    <div key={business.id} className="business-card">
                        <div className="business-info">
                            <h3>{business.business_name}</h3>
                            <p><strong>ID:</strong> {business.unique_id}</p>
                            <p><strong>Phone:</strong> {business.business_phone}</p>
                            <p><strong>Email:</strong> {business.business_email}</p>
                            <p><strong>Country:</strong> {business.business_country}</p>
                        </div>
                        <div className="business-actions">
                            <button onClick={() => handleEdit(business)}>Edit</button>
                            <button onClick={() => handleDelete(business.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Business;