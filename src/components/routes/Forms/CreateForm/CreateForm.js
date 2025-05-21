import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./CreateForm.css";

const CreateForm = () => {
  const { phone_no_primary } = useParams();
  const [formDataa, setFormData] = useState({
    customer_name: '',
    phone_no_primary: phone_no_primary || '',
    phone_no_secondary: '',
    email_id: '',
    address: '',
    country: '',
    disposition: '',
    designation: '',
    QUEUE_NAME: '',
    comment: '',
    scheduled_at: '',
    designation: ''
  });

  const [formSuccess, setFormSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const teamName = searchParams.get('team');

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

        // Get team from URL parameters
        const searchParams = new URLSearchParams(location.search);
        const teamParam = searchParams.get('team');
        
        if (!teamParam) {
          navigate('/admin'); // Redirect if no team specified
          return;
        }

        // Set QUEUE_NAME from URL parameter
        setFormData(prev => ({
          ...prev,
          QUEUE_NAME: teamParam
        }));

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
  }, [navigate, location]);

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
      if (!formDataa[field] || formDataa[field].trim() === "") {
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
        formDataa,
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
          QUEUE_NAME: formDataa.QUEUE_NAME,
          comment: '',
          scheduled_at: '',
          designation: ''
        });
        setError('');
        
        // Navigate back to team view after successful creation
        setTimeout(() => {
          navigate(`/team/${formDataa.QUEUE_NAME}`);
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
                  value={formDataa.customer_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="label-input phone-field">
                <label>Phone Number<span className="required"> *</span>:</label>
                <input
                  type="tel"
                  name="phone_no_primary"
                  value={formDataa.phone_no_primary}
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
                  value={formDataa.email_id}
                  onChange={handleInputChange}
                />
              </div>
              <div className="label-input phone-field">
                <label>Alternative Number:</label>
                <input
                  type="text"
                  name="phone_no_secondary"
                  value={formDataa.phone_no_secondary}
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
                  value={formDataa.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="label-input country-field" style={{ flex: 1 }}>
                <label>Country:</label>
                <input
                  type="text"
                  name="country"
                  value={formDataa.country}
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
                  value={formDataa.designation}
                  onChange={handleInputChange}
                />
              </div>
              <div className="label-input disposition-field" style={{ flex: 1 }}>
                <label>Disposition:</label>
                <select
                  name="disposition"
                  value={formDataa.disposition}
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
                  value={formDataa.comment}
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
