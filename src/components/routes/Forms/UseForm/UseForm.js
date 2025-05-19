// src/components/routes/Forms/UseForm/UseForm.js

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./UseForm.css";
import LastChanges from "../LastChange/LastChange";
import EditIcon from '@mui/icons-material/Edit';  // Import edit icon


const UseForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { phone_no_primary } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasDeletePermission, setHasDeletePermission] = useState(false);
    const [error, setError] = useState(null); 
    const [customer, setCustomer] = useState(null);
    const [availableAgents, setAvailableAgents] = useState([]); 
    const [editingInfo, setEditingInfo] = useState(false);
    const alertShownRef = useRef(false); // Use a ref to track if the alert has been shown

    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        phone_no_primary: '',
        phone_no_secondary: '',
        whatsapp_num: '',
        email_id: '',
        date_of_birth: '',
        gender: '',
        address: '',
        country: '',
        company_name: '',
        designation: '',
        website: '',
        other_location: '',
        contact_type: '',
        source: '',
        disposition: '',
        QUEUE_NAME: '',
        agent_name: '',
        comment: '',
        scheduled_at: ''
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

    const validateRequiredFields = () => {
        const requiredFields = ['first_name', 'email_id', 'phone_no_primary'];
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

    useEffect(() => {
        fetchUser();
        const fetchCustomerData = async () => {
            if (location.state?.customer) {
                setCustomer(location.state.customer);
                setFormData(location.state.customer);
                setLoading(false);
            } else if (phone_no_primary) {
                try {
                    const apiUrl = process.env.REACT_APP_API_URL;
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${apiUrl}/customers/phone/${phone_no_primary}`, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json", 
                        },
                    });
                    if (response.data?.customer) {
                        setCustomer(response.data.customer);
                        setFormData(response.data.customer);
                    } else {
                        navigate(`/customer/new/${phone_no_primary}`, { state: { phone_no_primary } });
                    }
                } catch (error) {
                    if (!alertShownRef.current && error.response?.status === 404) {
                        alert("Customer not found. Redirecting to create a new customer.");
                        alertShownRef.current = true;
                        navigate(`/customer/new/${phone_no_primary}`, { state: { phone_no_primary } });
                    } else {
                        console.error(error);
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCustomerData();
    }, [phone_no_primary]); // Add phone_no_primary as dependency since it's used in fetchCustomerData

    useEffect(() => {
        if (customer) {
            // Format phone numbers for display when loading data
            const displayData = { ...customer };
            Object.keys(displayData).forEach(key => {
                if (key.includes('phone') && displayData[key]) {
                    displayData[key] = formatPhoneForDisplay(displayData[key]);
                }
            });
            setFormData(displayData);
        }
    }, [customer]);

    const handleDelete = async () => {
        if (!hasDeletePermission) {
            alert("You do not have permission to delete customers.");
            return;
        }
        const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL;

            await axios.delete(`${apiUrl}/customers/${customer.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            alert("Customer deleted successfully.");
            navigate("/customers");
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("You do not have permission to delete customers.");
                // Refresh user data to get latest permissions
                const fetchUser = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const apiUrl = process.env.REACT_APP_API_URL;

                        // First get the current user's data
                        const userResponse = await axios.get(`${apiUrl}/current-user`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        setUser(userResponse.data);
                        
                        // Get permissions from API response only
                        const permissions = userResponse.data.permissions || [];
                        console.log('Latest user permissions from API:', permissions);
                        
                        // Check if delete_customer permission exists in the array
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
                await fetchUser();
            } else {
                console.error("Error deleting customer:", error);
                alert("Failed to delete customer. Please try again.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // First validate required fields
        const requiredFields = {
            'first_name': 'First Name',
            'phone_no_primary': 'Primary Phone Number',
            'email_id': 'Email'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([field]) => !formData[field] || !formData[field].trim())
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            alert(`Please fill in the following mandatory details:\n• ${missingFields.join('\n• ')}`);
            return;
        }

        // Check if any fields have actually changed
        const changedFields = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] !== customer[key]) {
                changedFields[key] = formData[key];
            }
        });

        // If no fields changed, return early without making API call
        if (Object.keys(changedFields).length === 0) {
            navigate("/customers");
            return;
        }

        // Validate phone number length (excluding + if present)
        const phoneLength = formData.phone_no_primary.replace('+', '').length;
        if (phoneLength < 8) {
            alert('Primary phone number must be at least 8 digits');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL;
            
            // Update customer data - only send changed fields
            const response = await axios.put(
                `${apiUrl}/customers/${customer.id}`, 
                changedFields,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setCustomer(formData);
            setFormData(formData);
            navigate("/customers");
        } catch (error) {
            console.error('Update error:', error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                alert(`Update failed: ${backendErrors.join('\n')}`);
            } else {
                alert('Failed to update customer. Please try again.');
            }
        }
    };
    
    if (loading) return <div>Loading customer data...</div>;
    if (!customer) return <div>No customer data found.</div>;

    return (
        <div>
            <div className="header-containerrr">
                <Link to="/customers">
                    <img src="/uploads/house-fill.svg" alt="Home" className="home-icon" />
                </Link>
                <h2 className="list_form_headiii">EDIT RECORD</h2>
            </div>
            <div className="use-last-container">
                <div className="use-form-container">
                    <div className="customer-info-header">
                        <div className="customer-info-section">
                            <div className="customer-name">
                                {formData.first_name} {formData.middle_name} {formData.last_name}
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
                                    setTimeout(() => document.querySelector('input[name="first_name"]')?.focus(), 100);
                                }
                            }} 
                        />
                    </div>
                    <form onSubmit={handleSubmit}>
                        {/* Your input fields */}
                        {[
                            ...(editingInfo ? [
                                { 
                                    label: "First Name", name: "first_name", required: true 
                                },
                                { 
                                    label: "Middle Name", name: "middle_name" 
                                },
                                { 
                                    label: "Last Name", name: "last_name"
                                },
                                { 
                                    label: "Phone", name: "phone_no_primary", required: true,
                                    type: "tel", maxLength: "15",
                                    pattern: "^\\+?[0-9]{8,14}$" // Allow + at start and 8-14 digits
                                }
                            ] : []),
                            { 
                                label: "Alternate Phone", name: "phone_no_secondary", 
                                type: "tel", maxLength: "15",
                                pattern: "^\\+?[0-9]{8,14}$"
                            },
                            { 
                                label: "Whatsapp", name: "whatsapp_num", 
                                type: "tel", maxLength: "15",
                                pattern: "^\\+?[0-9]{8,14}$"
                            },
                            { 
                                label: "Email" , name: "email_id", required: true 
                            },
                            {
                                label: "Date of Birth", name: "date_of_birth", 
                                type: "date",
                            },
                            { 
                                label: "Address", name: "address"
                            },
                            { 
                                label: "Country", name: "country"
                            },
                            { 
                                label: "Company Name", name: "company_name"
                            },
                            { 
                                label: "Designation", name: "designation"
                            },
                            { 
                                label: "Website", name: "website"
                            },
                            { 
                                label: "Other Location", name: "other_location"
                            },
                            { 
                                label: "Contact Type", name: "contact_type"
                            },
                            { 
                                label: "Source", name: "source"
                            },
                            { 
                                label: "Queue Name", name: "QUEUE_NAME"
                            },
                        ].map(({ label, name, type = "text", disabled, maxLength, required, pattern }) => (
                            <div key={name} className="label-input">
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
                        <div className="label-input">
                            <label>Agent Name:</label>
                            <input
                                type="text"
                                name="agent_name"
                                value={formData.agent_name || ''}
                                disabled
                                className="agent-input"
                            />
                        </div>

                        {/* Gender Dropdown */}
                        <div className="label-input">
                            <label>Gender:</label>
                            <select 
                                name="gender" 
                                value={formData.gender || ''} 
                                onChange={handleInputChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Disposition Dropdown */}
                        <div className="label-input">
                            <label>Disposition:</label>
                            <select 
                                name="disposition" 
                                value={formData.disposition || ''} 
                                onChange={handleInputChange}
                            >
                                <option value="">Select Disposition</option>
                                <option value="contacted">Contacted</option>
                                <option value="not_contacted">Not Contacted</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Schedule Call  */}
                        <div className="label-input">
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

                        {/* Comment Section */}
                        <div className="label-input comment">
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
                    {hasDeletePermission && (  
                        <button 
                            onClick={handleDelete} 
                            className="add-field-btnnn"
                            aria-label="Delete customer"
                        >
                            Delete Record
                        </button>
                    )}
                </div>

                <div>
                    {/* Pass customerId to LastChanges */}
                    <LastChanges 
                        customerId={customer?.id || ''} 
                        phone_no_primary={formData?.phone_no_primary || ''}
                    />
                </div>
            </div>

        </div>
    );
};

export default UseForm;