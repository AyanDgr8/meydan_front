import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./CreateForm.css";

const CreateForm = () => {
  const { phone_no_primary } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState({
    customer_name: '',
    phone_no_primary: phone_no_primary || location.state?.phone_no_primary || '',
    phone_no_secondary: '',
    email_id: '',
    address: '',
    country: '',
    disposition: '',
    designation: '',
    QUEUE_NAME: location.state?.QUEUE_NAME || '',
    comment: '',
    scheduled_at: '',
  });

  const [formSuccess, setFormSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get team from URL query parameter or state
    const params = new URLSearchParams(location.search);
    const teamName = location.state?.QUEUE_NAME || params.get('team');
    if (teamName) {
      setFormData(prev => ({
        ...prev,
        QUEUE_NAME: teamName
      }));
    }
  }, [location.search, location.state]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/admin');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/current-queue`, {
          headers: { Authorization: `Bearer ${token}` },
        });

      } catch (error) {
        console.error('Error fetching queue info:', error);
        if (error.response?.status === 401) {
          navigate('/admin');
        } else {
          setError('Error loading queue data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent QUEUE_NAME from being changed
    if (name === 'QUEUE_NAME') return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle scheduled_at click
  const handleScheduledAtClick = () => {
    console.log('Scheduling a call');
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const requiredFields = [
      "customer_name", "phone_no_primary", "QUEUE_NAME"
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        setError(`Please fill out the "${field.replace(/_/g, ' ').toUpperCase()}" field.`);
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequiredFields()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/customers/create`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setFormSuccess(true);
        // Reset form data but keep team 
        setFormData({
          customer_name: '',
          phone_no_primary: '',
          phone_no_secondary: '',
          email_id: '',
          address: '',
          country: '',
          disposition: '',
          QUEUE_NAME: formData.QUEUE_NAME,
          comment: '',
          scheduled_at: '',
          designation: ''
        });
        setError('');
        
        // Navigate back to team view after successful creation
        setTimeout(() => {
          navigate(`/team/${formData.QUEUE_NAME}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      setError(error.response?.data?.message || 'Failed to create customer');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="create_form_headiii">New Record</h2>
      <div className="create-form-container">
        {error && <div className="error-messagee">{error}</div>}
        {formSuccess && (
          <div className="success-message">Record created successfully!</div>
        )}
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-section">
            <div className="form-section-title">Basic Information</div>
            <div className="form-row">
              <div className="label-input customer-field">
                <label>Customer Name<span className="required"> *</span>:</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="label-input phone-field">
                <label>Phone Number<span className="required"> *</span>:</label>
                <input
                  type="tel"
                  name="phone_no_primary"
                  value={formData.phone_no_primary}
                  onChange={handleInputChange}
                  required
                  maxLength={15}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="label-input email-field">
                <label>Email:</label>
                <input
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleInputChange}
                />
              </div>
              <div className="label-input phone-field">
                <label>Alternative Number:</label>
                <input
                  type="text"
                  name="phone_no_secondary"
                  value={formData.phone_no_secondary}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Additional Details</div>
            
            {/* First row: Address and Country */}
            <div className="form-row">
              <div className="label-input address-field" style={{ flex: 2 }}>
                <label>Address:</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="label-input country-field" style={{ flex: 1 }}>
                <label>Country:</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Second row: Designation and Disposition */}
            <div className="form-row">
              <div className="label-input designation-field" style={{ flex: 1 }}>
                <label>Designation:</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                />
              </div>
              <div className="label-input disposition-field" style={{ flex: 1 }}>
                <label>Disposition:</label>
                <select
                  name="disposition"
                  value={formData.disposition}
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
            </div>

            {/* Third row: Comment */}
            <div className="form-row">
              <div className="label-input comment-field" style={{ flex: 1 }}>
                <label>Comment:</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Enter any additional comments..."
                />
              </div>
            </div>
          </div>

          <div className="button-container">
            <button type="submit" className="submit-buttonn">
              Create Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateForm;
