// src/components/routes/Forms/UseForm/UseForm.js

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./UseForm.css";
import EditIcon from '@mui/icons-material/Edit';  // Import edit icon
import { jwtDecode } from 'jwt-decode'; // Import as named export

const UseForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id, teamName, phone_no_primary } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasDeletePermission, setHasDeletePermission] = useState(false);
    const [error, setError] = useState(null); 
    const [customer, setCustomer] = useState(null);
    const [availableAgents, setAvailableAgents] = useState([]); 
    const [editingInfo, setEditingInfo] = useState(false);
    const alertShownRef = useRef(false);

    // Get team name from URL params or state
    const teamNameFromURL = location.pathname.split('/')[2];
    const queueNameFromState = location.state?.queueName;
    const teamNameFromStorage = localStorage.getItem('currentQueue');
    
    // Initialize form data with customer data from state if available
    const [formData, setFormData] = useState(() => {
        const initialState = {
            customer_name: '',
            phone_no_primary: '',
            phone_no_secondary: '',
            email_id: '',
            address: '',
            country: '',
            designation: '',
            disposition: '',
            C_unique_id: '',
            agent_name: '',
            comment: '',
            scheduled_at: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            whatsapp_num: '',
            date_of_birth: '',
            company_name: '',
            website: '',
            other_location: '',
            contact_type: '',
            source: '',
            QUEUE_NAME: '',
            gender: ''
        };

        // If we have customer data from state, use it to initialize
        const locationState = location.state;
        if (locationState?.customer) {
            return {
                ...initialState,
                ...locationState.customer,
                QUEUE_NAME: locationState.queueName || teamNameFromURL || queueNameFromState || teamNameFromStorage
            };
        }
        return initialState;
    });

    const [updatedData, setUpdatedData] = useState(formData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // Special handling for phone numbers
        if (name.includes('phone')) {
            // Allow + only at the start and numbers
            processedValue = value.replace(/[^0-9+]/g, '');
            if (processedValue.includes('+') && !processedValue.startsWith('+')) {
                processedValue = processedValue.replace('+', '');
            }
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
        setUpdatedData(prev => ({ ...prev, [name]: processedValue }));
    };

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                setLoading(true);
                let response;
                const apiUrl = process.env.REACT_APP_API_URL;

                if (phone_no_primary) {
                    response = await axios.get(`${apiUrl}/customers/phone/${phone_no_primary}`);
                } else if (id) {
                    response = await axios.get(`${apiUrl}/customers/${id}`);
                }

                if (response && response.data) {
                    setCustomer(response.data);
                    setFormData(prev => ({
                        ...prev,
                        ...response.data
                    }));
                }
            } catch (error) {
                console.error('Error fetching customer data:', error);
                setError('Failed to load customer data. The record may not exist.');
            } finally {
                setLoading(false);
            }
        };

        const locationState = location.state;
        if (locationState?.customer) {
            setCustomer(locationState.customer);
            setFormData(prev => ({
                ...prev,
                ...locationState.customer
            }));
            setLoading(false);
        } else if (phone_no_primary || id) {
            fetchCustomerData();
        } else {
            setLoading(false);
        }
    }, [id, phone_no_primary, location.state, teamNameFromURL, queueNameFromState, teamNameFromStorage]);

    const validateRequiredFields = () => {
        const requiredFields = ['customer_name', 'email_id', 'phone_no_primary'];
        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            return !value || (typeof value === 'string' && !value.trim());
        });
        
        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return false;
        }
        return true;
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            // Format as YYYY-MM-DDThh:mm
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    const formatPhoneForDisplay = (phone) => {
        if (!phone) return '';
        // If number starts with 00, replace with +
        if (phone.startsWith('00')) {
            return '+' + phone.substring(2);
        }
        return phone;
    };

    const formatPhoneForStorage = (phone) => {
        if (!phone) return '';
        // If number starts with +, replace with 00
        if (phone.startsWith('+')) {
            return '00' + phone.substring(1);
        }
        return phone;
    };

    const handleScheduledAtClick = (e) => {
        // Remove readonly temporarily to allow picker to show
        e.target.readOnly = false;
        e.target.showPicker();
        // Add an event listener to make it readonly again after selection
        e.target.addEventListener('blur', function onBlur() {
            e.target.readOnly = true;
            e.target.removeEventListener('blur', onBlur);
        });
    };

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL;

            // Get user data
            const userResponse = await axios.get(`${apiUrl}/current-user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setUser(userResponse.data);
            
            // Get permissions from API response
            const permissions = userResponse.data.permissions || [];
            console.log('Latest user permissions from API:', permissions);
            
            // Check for delete permission
            const hasDeletePerm = Array.isArray(permissions) && permissions.includes('delete_customer');
            console.log('Has delete permission:', hasDeletePerm);
            setHasDeletePermission(hasDeletePerm);

                // Then get the available agents based on user's role
                try {
                    const agentsResponse = await axios.get(`${apiUrl}/players/teams`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    setAvailableAgents(agentsResponse.data);
        } catch (error) {
                    console.error('Error fetching available agents:', error);
                    setError('Failed to fetch available agents');
                }

            } catch (error) {
                console.error('Error in fetchUser:', error);
            setError('Failed to fetch user data');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Get team name from various sources
        const teamName = formData.QUEUE_NAME || teamNameFromURL || queueNameFromState || teamNameFromStorage;
        if (!teamName) {
            setError('Team name not found. Please try refreshing the page.');
            setLoading(false);
            return;
        }

        // First validate required fields
        const requiredFields = {
            'customer_name': 'Customer Name',
            'phone_no_primary': 'Primary Phone Number',
            'email_id': 'Email ID',
            'address': 'Address'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([field, label]) => !formData[field])
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            alert(`Please fill in the following mandatory details:\n• ${missingFields.join('\n• ')}`);
            setLoading(false);
            return;
        }

        // Validate phone number length (excluding + if present)
        const phoneLength = formData.phone_no_primary.replace('+', '').length;
        if (phoneLength < 8) {
            alert('Primary phone number must be at least 8 digits');
            setLoading(false);
            return;
        }

        if (!customer) {
            setError('Customer data not loaded. Please try refreshing the page.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found');
                navigate('/login');
                return;
            }

            const apiUrl = process.env.REACT_APP_API_URL;
            
            // Get changed fields - only compare fields that exist in both objects
            const changedFields = {};
            const commonFields = Object.keys(formData).filter(field => customer.hasOwnProperty(field));
            
            commonFields.forEach(key => {
                if (formData[key] !== customer[key]) {
                    changedFields[key] = formData[key];
                }
            });

            // If no fields changed, return early without making API call
            if (Object.keys(changedFields).length === 0) {
                console.log('No changes detected, skipping update');
                if (teamName) {
                    navigate(`/dashboard/customers/search?team=${teamName}`);
                }
                setLoading(false);
                return;
            }

            // Prepare update data with team name
            const updateData = {
                ...changedFields,
                QUEUE_NAME: teamName
            };

            console.log('Update request data:', {
                url: `${apiUrl}/customers/${customer.id}`, // Use the customer's _id
                data: updateData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const response = await axios.put(
                `${apiUrl}/customers/${customer.id}`, // Use the customer's _id
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                setCustomer(response.data);
                setFormData(response.data);
                
                // Navigate to the team page
                if (teamName) {
                    navigate(`/dashboard/customers/search?team=${teamName}`);
                } else {
                    console.warn('No team name found for navigation');
                }
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('Update error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });

            if (error.response?.data?.details) {
                setError(error.response.data.details);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to update customer. Please try again.');
            }
            setLoading(false);
        }
    };

    if (loading) return <div>Loading customer data...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <div className="header-containerrr">
                <h2 className="list_form_headiii">EDIT RECORD</h2>
            </div>
            <div className="use-last-container">
                <div className="use-form-container">
                    <div className="customer-info-header">
                        <div className="customer-info-section">
                            <div className="customer-name">
                                {formData.customer_name || `${formData.first_name || ''} ${formData.middle_name || ''} ${formData.last_name || ''}`}
                            </div>
                            <div className="customer-phone">
                                {formatPhoneForDisplay(formData.phone_no_primary)}
                            </div>
                        </div>
                        <EditIcon 
                            className={`edit-icon ${editingInfo ? 'active' : ''}`}
                            onClick={() => {
                                setEditingInfo(!editingInfo);
                                if (!editingInfo) {
                                    setTimeout(() => document.querySelector('input[name="customer_name"]')?.focus(), 100);
                                }
                            }} 
                        />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-fields-grid">
                            {[
                                ...(editingInfo ? [
                                    { 
                                        label: "Name", name: "customer_name", required: true
                                    },
                                    { 
                                        label: "Phone", name: "phone_no_primary", required: true,
                                        type: "tel", maxLength: "15",
                                        pattern: "^\\+?[0-9]{8,14}$"
                                    }
                                ] : []),
                                { 
                                    label: "Alt Phone", name: "phone_no_secondary", 
                                    type: "tel", maxLength: "15",
                                    pattern: "^\\+?[0-9]{8,14}$"
                                },
                                { 
                                    label: "Email", name: "email_id", required: true 
                                },
                                { 
                                    label: "Address", name: "address"
                                },
                                { 
                                    label: "Country", name: "country"
                                },
                                { 
                                    label: "Designation", name: "designation"
                                },
                                { 
                                    label: "Company", name: "QUEUE_NAME", disabled: true
                                }
                            ].map(({ label, name, type = "text", disabled, maxLength, required, pattern }) => (
                                <div key={name} className="label-inputt">
                                    <label>{label}{required && <span className="required"> *</span>}:</label>
                                    <input
                                        type={type}
                                        name={name}
                                        value={formData[name] || ''}
                                        onChange={handleInputChange}
                                        disabled={disabled}
                                        maxLength={maxLength}
                                        pattern={pattern}
                                    />
                                </div>
                            ))}

                            {/* Agent Name Field */}
                            <div className="label-inputt">
                                <label>Agent Name:</label>
                                <input
                                    type="text"
                                    name="agent_name"
                                    value={formData.agent_name || ''}
                                    disabled
                                    className="agent-input"
                                />
                            </div>

                            {/* Disposition Dropdown */}
                            <div className="label-inputt">
                                <label>Disposition:</label>
                                <select 
                                    name="disposition" 
                                    value={formData.disposition || ''} 
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Disposition</option>
                                    <option value="call_back">Call Back</option>
                                    <option value="schedule_visit">Schedule Visit</option>
                                    <option value="office_visit">Office Visit</option>
                                    <option value="urgent_required">Urgent Required</option>
                                    <option value="interested">Interested</option>
                                    <option value="utility_call">Utility Call</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>

                            {/* Schedule Call */}
                            <div className="label-inputt">
                                <label>Schedule Call:</label>
                                <input
                                    type="datetime-local"
                                    name="scheduled_at"
                                    value={formData.scheduled_at || ''}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={handleScheduledAtClick}
                                    style={{ cursor: 'pointer' }}
                                    className="sche_input"
                                />
                            </div>
                        </div>

                        {/* Comment Section - Full Width */}
                        <div className="label-inputt comment">
                            <label>Comment:</label>
                            <div className="textarea-container">
                                <textarea
                                    name="comment"
                                    value={formData.comment || ''}
                                    onChange={handleInputChange}
                                    rows="6"
                                    placeholder="Enter any additional comment"
                                    className="comet"
                                />
                            </div>
                        </div>

                        <button className="sbt-use-btn" type="submit">Update</button>
                    </form>
                    {/* {hasDeletePermission && (  
                        <button 
                            onClick={handleDelete} 
                            className="add-field-btnnn"
                            aria-label="Delete customer"
                        >
                            Delete Record
                        </button>
                    )} */}
                </div>

                {/* <div>
                    <LastChanges 
                        customerId={customer?.id || ''} 
                        phone_no_primary={formData?.phone_no_primary || ''}
                    />
                </div> */}
            </div>

        </div>
    );
};

export default UseForm;