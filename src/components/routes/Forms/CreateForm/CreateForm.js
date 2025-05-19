// src/components/routes/Forms/CreateForm/CreateForm.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateForm.css";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CreateForm = () => {
  const { phone_no_primary } = useParams();
  const [formDataa, setFormData] = useState({
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

  const [formSuccess, setFormSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [duplicateAction, setDuplicateAction] = useState('skip');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Set agent name in form data
        setFormData(prev => ({
          ...prev,
          agent_name: response.data.username
        }));

        // Log the response for debugging
        console.log('Current user API response:', response.data);

      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle scheduled_at click
  const handleScheduledAtClick = () => {
    // Optional: Add any special handling for the datetime-local input
    console.log('Scheduling a call');
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const requiredFields = [
      "first_name", "phone_no_primary"
    ];

    for (let field of requiredFields) {
      if (!formDataa[field] || formDataa[field].trim() === "") {
        setError(`Please fill out the "${field.replace(/_/g, ' ').toUpperCase()}" field.`);
        return false;
      }
    }
    
    // Ensure agent_name is set (should be automatically populated)
    if (!formDataa.agent_name || formDataa.agent_name.trim() === "") {
      console.error("Agent name not automatically populated");
      setError("Agent name not found. Please refresh the page or contact support.");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e, action = 'prompt') => {
    e.preventDefault();
    setError('');

    // First validate required fields
    if (!validateRequiredFields()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await axios.post(
        `${apiUrl}/customers/new`, 
        { ...formDataa, duplicateAction: action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.success) {
        console.log(response.data);
        setFormSuccess(true);
        alert("Record added successfully!");
        setFormData({
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
          agent_name: formDataa.agent_name, // Preserving agent name
          comment: '',
          scheduled_at: ''
        });
        navigate('/customers');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        // Handle duplicate record
        const duplicateData = error.response.data;
        
        // Store the duplicate info with calculated matching fields
        setDuplicateInfo({
          ...duplicateData,
          matchingFields: {
            name: formDataa.first_name === duplicateData.existing_record.first_name,
            phone: formDataa.phone_no_primary === duplicateData.existing_record.phone_no_primary,
            email: formDataa.email_id === duplicateData.existing_record.email_id
          }
        });
        
        setShowDuplicateDialog(true);
      } else {
        console.error('Error adding record:', error);
        setError(error.response?.data?.message || 'Error adding record. Please try again.');
      }
    }
  };

  const handleDuplicateAction = (action) => {
    // Validate required fields again before proceeding with the action
    if (!validateRequiredFields()) {
      return;
    }

    setShowDuplicateDialog(false);
    handleSubmit({ preventDefault: () => {} }, action);
  };

  return (
    <div>
      <h2 className="create_form_headiii">New Record</h2>
      <div className="create-form-container">
        {error && <div className="error-messagee">{error}</div>}
        
        {showDuplicateDialog && duplicateInfo && (
          <Dialog 
            open={showDuplicateDialog} 
            onClose={() => setShowDuplicateDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ padding: '0 10px 0 10px', backgroundColor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center', width: '100%', color: 'white' }}>Duplicate Record Found</Typography>
              <IconButton edge="end" color="inherit" onClick={() => setShowDuplicateDialog(false)} aria-label="close">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ padding: '20px' }}>
              <Typography variant="body1" sx={{ margin: '5px',color: '#EF6F53', fontWeight: 600}}>
                {duplicateInfo.phone_no_primary_exists 
                  ? "Phone number already exists in the system" 
                  : duplicateInfo.email_exists 
                    ? "Email already exists in the system"
                    : "Duplicate record found"}
              </Typography>
              
              <TableContainer sx={{ marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        width: '15%',
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                        padding: '5px'
                      }}>
                        Field
                      </TableCell>
                      <TableCell sx={{ 
                        width: '42.5%',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        padding: '5px'
                      }}>
                        New Record
                      </TableCell>
                      <TableCell sx={{ 
                        width: '42.5%',
                        backgroundColor: '#EF6F53',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        padding: '5px'
                      }}>
                        Existing Record <span style={{ fontSize: '0.8rem' }}>(★ indicates matching fields)</span>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: '#fafafa', padding: '5px' }}>Name</TableCell>
                      <TableCell sx={{ backgroundColor: '#f1f8f1', padding: '5px' }}>{formDataa.first_name}</TableCell>
                      <TableCell sx={{ 
                        backgroundColor: duplicateInfo.matchingFields.name ? '#ffecb3' : '#fff5f5', 
                        padding: '5px',
                        fontWeight: duplicateInfo.matchingFields.name ? 'bold' : 'normal'
                      }}>
                        {duplicateInfo.existing_record.first_name}
                        {duplicateInfo.matchingFields.name && <span style={{ color: '#d32f2f', marginLeft: '5px' }}>★</span>}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: '#fafafa', padding: '5px' }}>Phone</TableCell>
                      <TableCell sx={{ backgroundColor: '#f1f8f1', padding: '5px' }}>{formDataa.phone_no_primary}</TableCell>
                      <TableCell sx={{ 
                        backgroundColor: duplicateInfo.matchingFields.phone ? '#ffecb3' : '#fff5f5', 
                        padding: '5px',
                        fontWeight: duplicateInfo.matchingFields.phone ? 'bold' : 'normal'
                      }}>
                        {duplicateInfo.existing_record.phone_no_primary}
                        {duplicateInfo.matchingFields.phone && <span style={{ color: '#d32f2f', marginLeft: '5px' }}>★</span>}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: '#fafafa', padding: '5px' }}>Email</TableCell>
                      <TableCell sx={{ backgroundColor: '#f1f8f1', padding: '5px' }}>{formDataa.email_id}</TableCell>
                      <TableCell sx={{ 
                        backgroundColor: duplicateInfo.matchingFields.email ? '#ffecb3' : '#fff5f5', 
                        padding: '5px',
                        fontWeight: duplicateInfo.matchingFields.email ? 'bold' : 'normal'
                      }}>
                        {duplicateInfo.existing_record.email_id}
                        {duplicateInfo.matchingFields.email && <span style={{ color: '#d32f2f', marginLeft: '5px' }}>★</span>}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                <Typography variant="h6" sx={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: '#364C63' }}>Choose Action:</Typography>
                <select 
                  value={duplicateAction}
                  onChange={(e) => setDuplicateAction(e.target.value)}
                  style={{ 
                    padding: '2px 8px', 
                    borderRadius: '6px', 
                    border: '1px solid #364C63',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    width: '300px',
                    color: '#1976d2'
                  }}
                >
                  <option value="skip">Do Not Upload Duplicate</option>
                  <option value="append">Append with suffix (__1, __2, etc.)</option>
                  <option value="replace">Replace existing record</option>
                </select>
              </Box>
            </DialogContent>
            <DialogActions sx={{ padding: '16px', borderTop: '1px solid #eee' }}>
              <Button onClick={() => setShowDuplicateDialog(false)} color="secondary">
                Cancel
              </Button>
              <Button 
                onClick={() => handleDuplicateAction(duplicateAction)} 
                variant="contained" 
                color="primary"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'prompt')} className="create-form">
          {[
            { 
              label: "First Name", name: "first_name",required: true 
            },
            { 
              label: "Middle Name", name: "middle_name" 
            },
            { 
              label: "Last Name", name: "last_name"
            },
            { 
              label: "Phone", name: "phone_no_primary", required: true,
              type: "tel", maxLength: "12"
            },
            { 
              label: "Alternate Phone", name: "phone_no_secondary", 
              type: "tel", maxLength: "12"
            },
            { 
              label: "Whatsapp", name: "whatsapp_num", 
              type: "tel", maxLength: "12"
            },
            { 
              label: "Email" , name: "email_id", required: true ,
              type: "email"
            },
            { 
              label: "Date of Birth", name: "date_of_birth", 
              type: "date"
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
              label: "Disposition", name: "disposition"
            },
            { 
              label: "Source", name: "source"
            },
            { 
                label: "Queue Name", name: "QUEUE_NAME"
            },
          ].map(({ label, name, type = "text", maxLength, required }) => (
            <div key={name} className="label-input">
              <label>{label}{required && <span className="required"> *</span>}:</label>
              <input
                type={type}
                name={name}
                value={formDataa[name] || ''}
                onChange={handleInputChange}
                maxLength={maxLength}
              />
            </div>
          ))}

          {/* Agent Name Field */}
          {/* <div className="label-input">
              <label>Agent Name:</label>
              <input
                  type="text"
                  name="agent_name"
                  value={formData.agent_name || ''}
                  disabled
                  className="agent-input"
              />
          </div> */}

          {/* calling_code Dropdown */}
          <div className="label-input">
              <label>Gender:</label>
              <select name="gender" value={formDataa.gender} onChange={handleInputChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
              </select>
          </div>


          {/* Schedule Call  */}
          <div className="label-input">
              <label>Schedule Call:</label>
              <input
                  type="datetime-local"
                  name="scheduled_at"
                  value={formDataa.scheduled_at || ''}
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
                      value={formDataa.comment || ''}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Enter any additional comment"
                      className="comet"
                  />
              </div>
          </div>

          <button type="submit" className="submit-btn submmit-button">
            Add Customer
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateForm;
