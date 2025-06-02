// src/components/routes/Forms/AdminPortal/Brand/Brand.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Brand.css';

const Brand = () => {
    const [brands, setBrands] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [selectedBrandId, setSelectedBrandId] = useState(null);
    const [businessCenters, setBusinessCenters] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    // Initialize all form fields with empty strings or 0 for numbers
    const [formData, setFormData] = useState({
        brand_name: '',
        brand_phone: '',
        brand_email: '',
        brand_password: '',
        brand_tax_id: '',
        brand_reg_no: '',
        brand_person: '',
        centers: 0,
        companies: 0,
        associates: 0,
        receptionist: 0,
        brand_other_detail: ''
    });

    useEffect(() => {
        fetchBrands();
        // Check if user is admin from JWT token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(tokenData.role === 'admin');
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, []);

    const fetchBrands = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin');
                return;
            }

            // Parse the token to check admin status
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const isAdmin = tokenPayload.isAdmin || tokenPayload.role === 'admin';

            // Admin users can access all brands
            // Non-admin users need a brand_id
            if (!isAdmin && !tokenPayload.brand_id) {
                setError('Access denied. Not authorized to view brands.');
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/brand`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBrands(response.data);
            setIsLoading(false);
            setError(''); // Clear any previous errors
        } catch (error) {
            console.error('Error fetching brands:', error);
            setError(error.response?.data?.message || 'Error fetching brands');
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
                setError('Not authenticated');
                return;
            }

            const url = editingBrand
                ? `${process.env.REACT_APP_API_URL}/brand/${editingBrand.id}`
                : `${process.env.REACT_APP_API_URL}/brand`;

            const method = editingBrand ? 'put' : 'post';

            const response = await axios[method](url, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess(
                editingBrand
                ? 'Brand updated successfully!'
                : `${response.data.message}. Check email for login details.`
            );
            
            fetchBrands();
            resetForm();
            
            // Auto-clear messages after 3 seconds
            setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);

        } catch (error) {
            console.error('Error submitting business:', error);
            setError(error.response?.data?.message || 'An error occurred');
            
            // Auto-clear error message after 3 seconds
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    };

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        setFormData({
            brand_name: brand.brand_name,
            brand_phone: brand.brand_phone,
            brand_email: brand.brand_email,
            brand_password: brand.brand_password,
            brand_tax_id: brand.brand_tax_id,
            brand_reg_no: brand.brand_reg_no,
            brand_person: brand.brand_person,
            centers: brand.centers,
            companies: brand.companies,
            associates: brand.associates,
            receptionist: brand.receptionist,
            brand_other_detail: brand.brand_other_detail
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this brand?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin');
                return;
            }

            await axios.delete(`${process.env.REACT_APP_API_URL}/brand/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Brand deleted successfully');
            fetchBrands();
        } catch (error) {
            console.error('Error deleting brand:', error);
            setError('Error deleting brand');
        }
    };

    const handleCardClick = async (brandId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated');
                return;
            }

            // Get business centers for the selected brand
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/brand/${brandId}/business-centers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSelectedBrandId(brandId);
            setBusinessCenters(response.data);
            
            // Navigate to business centers view
            navigate(`/business`, { 
                state: { 
                    brandId,
                    businessCenters: response.data,
                    fromBrand: true
                }
            });
        } catch (error) {
            console.error('Error fetching business centers:', error);
            setError(error.response?.data?.message || 'Error fetching business centers');
            
            // Auto-clear error after 3 seconds
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    };

    const resetForm = () => {
        setFormData({
            brand_name: '',
            brand_phone: '',
            brand_email: '',
            brand_password: '',
            brand_tax_id: '',
            brand_reg_no: '',
            brand_person: '',
            centers: 0,
            companies: 0,
            associates: 0,
            receptionist: 0,
            brand_other_detail: ''
        });
        setEditingBrand(null);
        setShowForm(false);
        setShowPassword(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="brand-container">
            <h2>License Management</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {isAdmin && (
                <button 
                    className="add-brand-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Add New Business Center Group'}
                </button>
            )}

            {(showForm && isAdmin) && (
                <form onSubmit={handleSubmit} className="brand-form">
                    <h3>{editingBrand ? 'Edit Brand' : 'Add New Business Center Group'}</h3>
                    
                    {/* Brand Name Row */}
                    <div className="form-rowww">
                        <div className="form-groupppp">
                            <label htmlFor="brand_name">Business Center Group Name:</label>
                            <div className="input-container">
                                <input
                                    type="text"
                                    id="brand_name"
                                    name="brand_name"
                                    value={formData.brand_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-groupppp">
                            <label htmlFor="brand_person">Contact Person:</label>
                            <div className="input-container">
                                <input
                                    type="text"
                                    id="brand_person"
                                    name="brand_person"
                                    value={formData.brand_person}
                                    onChange={handleInputChange}
                                    placeholder="Enter Contact Person Name"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Email and Phone Row */}
                    <div className="form-rowww">
                        <div className="form-groupppp">
                            <label htmlFor="brand_email">Email:</label>
                            <div className="input-container">
                                <input
                                    type="email"
                                    id="brand_email"
                                    name="brand_email"
                                    value={formData.brand_email}
                                    onChange={handleInputChange}
                                    placeholder="Enter Email"
                                />
                            </div>
                        </div>

                        <div className="form-groupppp">
                                <div className="password-label-group">
                                    <label htmlFor="business_password">App Password:</label>
                                    <div className="info-icon-container">
                                        <i className="fas fa-info-circle info-icon"></i>
                                        <div className="info-tooltip">
                                            <p>✅ Steps to Generate or View a Google App Password</p>
                                            <p><strong>App passwords are unique 16-character codes used to sign in to your Google Account from apps that don't support 2-Step Verification.</strong></p>
                                            <br/>
                                            <p><strong>1. Ensure 2-Step Verification is Enabled</strong></p>
                                            <p>Go to: <a href="https://myaccount.google.com/security" target="_blank">https://myaccount.google.com/security</a></p>
                                            <p>Under "Signing in to Google", make sure 2-Step Verification is turned on.</p>
                                            <br/>
                                            <p><strong>2. Generate a New App Password</strong></p>
                                            <p>Go to: <a href="https://myaccount.google.com/apppasswords" target="_blank">https://myaccount.google.com/apppasswords</a></p>
                                            <p>Sign in again if prompted.</p>
                                            <br/>
                                            <p>Under "Select app", choose: Mail</p>
                                            <p>Under "Select device", choose: Other (Custom name) and name it (e.g., "My App" or "Business Center")</p>    
                                            <p>Click Generate.</p>
                                            <p>Google will show you a 16-character app password like: snwb pexk avoq lnyl</p>
                                            <br/>
                                            <p>⚠️ Copy this password immediately. You won't be able to view it again later.</p>
                                            <p>❌ If you already generated one but didn't save it:</p>
                                            <p>You cannot retrieve an old app password from Google. You will have to generate a new one using the steps above.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="input-container">
                                    <div className="password-input-container">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="brand_password"
                                            name="brand_password"
                                            value={formData.brand_password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                    </div>

                    {/* Tax ID and Registration Number Row */}
                    <div className="form-rowww">
                        <div className="form-groupppp">
                            <label htmlFor="brand_tax_id">Tax ID:</label>
                            <div className="input-container">
                                <input
                                    type="text"
                                    id="brand_tax_id"
                                    name="brand_tax_id"
                                    value={formData.brand_tax_id}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="form-groupppp">
                            <label htmlFor="brand_reg_no">Registration No:</label>
                            <div className="input-container">
                                <input
                                    type="text"
                                    id="brand_reg_no"
                                    name="brand_reg_no"
                                    value={formData.brand_reg_no}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Companies, Associates, and Receptionists Row */}
                    <div className="form-rowww">
                        <div className="form-groupppp">
                            <label htmlFor="centers">Centers:</label>
                            <div className="input-container">
                                <input
                                    type="number"
                                    id="centers"
                                    name="centers"
                                    value={formData.centers}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="form-groupppp">
                            <label htmlFor="companies">Companies:</label>
                            <div className="input-container">
                                <input
                                    type="number"
                                    id="companies"
                                    name="companies"
                                    value={formData.companies}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="form-groupppp">
                            <label htmlFor="associates">Associates:</label>
                            <div className="input-container">
                                <input
                                    type="number"
                                    id="associates"
                                    name="associates"
                                    value={formData.associates}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="form-groupppp">
                            <label htmlFor="receptionist">Receptionists:</label>
                            <div className="input-container">
                                <input
                                    type="number"
                                    id="receptionist"
                                    name="receptionist"
                                    value={formData.receptionist}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Other Details Row */}
                    <div className="form-rowww">
                        <div className="form-groupppp full-width">
                            <label htmlFor="brand_other_detail">Other Details:</label>
                            <div className="input-container">
                                <textarea
                                    id="brand_other_detail"
                                    name="brand_other_detail"
                                    value={formData.brand_other_detail}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="forrm-actions">
                        <button type="submit">
                            {editingBrand ? 'Update Brand' : 'Create Brand'}
                        </button>
                        <button type="button" onClick={resetForm}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="brands-list">
                <h3 className="brand-list-title">Group List</h3>
                <div className="brand-cards-container">
                {brands.map(brand => (
                    <div 
                        key={brand.id} 
                        className="brand-card"
                        onClick={() => handleCardClick(brand.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="brand-info">
                            <div className="brand-row brand-name-row">
                                <h3>{brand.brand_name}</h3>
                            </div>
                            
                            <div className="brand-row contact-row">
                                <p><strong>Email:</strong> {brand.brand_email}</p>
                                <p><strong>Phone:</strong> {brand.brand_phone}</p>
                                <p><strong>Contact Person:</strong> {brand.brand_person}</p>
                            </div>
                            
                            <div className="brand-row id-row">
                                <p><strong>Tax ID:</strong> {brand.brand_tax_id}</p>
                                <p><strong>Registration No:</strong> {brand.brand_reg_no}</p>
                            </div>
                            
                            <div className="brand-row people-row">
                                <p><strong>Centers:</strong> {brand.centers}</p>
                                <p><strong>Companies:</strong> {brand.companies}</p>
                                <p><strong>Associates:</strong> {brand.associates}</p>
                                <p><strong>Receptionists:</strong> {brand.receptionist}</p>
                            </div>

                        </div>
                        
                        <div className="brand-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleEdit(brand)}>Edit</button>
                            <button onClick={() => handleDelete(brand.id)}>Delete</button>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

export default Brand;