// src/components/routes/Forms/AdminPortal/Business/Center.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Center.css';

const Center = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [messageVisible, setMessageVisible] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        mobile_num: '',
        mobile_num_2: '',
        team_id: '',
        designation: ''
    });

    const [newTeams, setNewTeams] = useState([{
        team_name: '',
        tax_id: '',
        reg_no: '',
        team_phone: '',
        team_email: '',
        team_address: '',
        team_country: '',
        team_prompt: '',
        team_detail: ''
    }]);

    const fetchTeams = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = `${process.env.REACT_APP_API_URL}/business/${businessId}/teams`;
            
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.data?.teams || !Array.isArray(response.data.teams)) {
                console.error('Invalid teams data:', response.data);
                setError('Invalid teams data received');
                setTeams([]);
                return;
            }

            setTeams(response.data.teams);
        } catch (error) {
            console.error('Error fetching teams:', error.response || error);
            setError('Error fetching teams');
            setTeams([]);
        }
    }, [businessId]);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/business/${businessId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBusiness(response.data);
            } catch (error) {
                console.error('Error fetching business:', error);
                setError('Error fetching business details');
            }
        };

        const fetchData = async () => {
            if (!businessId) {
                console.error('No business ID provided');
                setError('No business ID provided');
                return;
            }
            try {
                await fetchBusiness();
                await fetchTeams();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [businessId, fetchTeams]);

    const handleUserInputChange = (field, value) => {
        setNewUser(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleTeamInputChange = (index, field, value) => {
        const updatedTeams = [...newTeams];
        updatedTeams[index] = {
            ...updatedTeams[index],
            [field]: value
        };
        setNewTeams(updatedTeams);
    };

    const handleCreateUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/business/${businessId}/associate`,
                newUser,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data) {
                setSuccess('Associate created successfully');
                setNewUser({
                    username: '',
                    email: '',
                    mobile_num: '',
                    mobile_num_2: '',
                    team_id: '',
                    designation: ''
                });
                setFieldErrors({});
            }
        } catch (err) {
            console.error('Error creating associate:', err);
            const errorData = err.response?.data;
            
            if (errorData?.field) {
                setFieldErrors({ [errorData.field]: errorData.error });
                setError(errorData.error);
            } else {
                setError(errorData?.error || 'Failed to create associate');
            }
        }
        setMessageVisible(true);
        setTimeout(() => setMessageVisible(false), 3000);
    };

    const handleCreateTeams = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/business/${businessId}/teams`,
                { teams: newTeams },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.teams) {
                setTeams([...teams, ...response.data.teams]);
                setNewTeams([{
                    team_name: '',
                    tax_id: '',
                    reg_no: '',
                    team_phone: '',
                    team_email: '',
                    team_address: '',
                    team_country: '',
                    team_prompt: '',
                    team_detail: ''
                }]);
                fetchTeams(); // Refresh teams list
                setSuccess('Companies created successfully');
            }
        } catch (error) {
            console.error('Error creating company:', error);
            const errorMessage = error.response?.data?.message || 'Error creating company';
            setError(errorMessage);
        }
        setMessageVisible(true);
        setTimeout(() => setMessageVisible(false), 3000);
    };

    if (!business) {
        return <div>Loading...</div>;
    }

    return (
        <div className="business-center-container">
            <h2 className='business-name'>{business?.business_name || 'Business Center'}</h2>
            
            {/* Teams List Section */}
            <div className="teams-list-section">
                <h3>Companies</h3>
                <div className="teams-grid">
                    {teams.map((team, index) => (
                        <div 
                            key={team.id} 
                            className="team-card"
                            onClick={() => navigate(`/business/${businessId}/team/${encodeURIComponent(team.team_name)}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <h4>{team.team_name}</h4>
                            <div className="team-details">
                                <p><strong>Email:</strong> {team.team_email}</p>
                                <p><strong>Phone:</strong> {team.team_phone}</p>
                                <p><strong>Country:</strong> {team.team_country}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {messageVisible && (error || success) && (
                <div className={`message-container ${error ? 'error' : 'success'}`}>
                    {error || success}
                </div>
            )}
            <div className="sectionnnn">
                <h3 className='create-team-heading'>Create Company</h3>
                <div className='team-inputsss'>
                    {newTeams.map((team, index) => (
                        <div key={index} className="team-inputt">
                            <div className="team-row">
                                <input
                                    type="text"
                                    value={team.team_name}
                                    onChange={(e) => handleTeamInputChange(index, 'team_name', e.target.value)}
                                    placeholder="Enter Company name"
                                    className="team-name-input"
                                />
                                <input
                                    type="text"
                                    value={team.tax_id}
                                    onChange={(e) => handleTeamInputChange(index, 'tax_id', e.target.value)}
                                    placeholder="Tax ID"
                                    className="tax-id-input"
                                />
                                <input
                                    type="text"
                                    value={team.reg_no}
                                    onChange={(e) => handleTeamInputChange(index, 'reg_no', e.target.value)}
                                    placeholder="Registration Number"
                                    className="reg-no-input"
                                />
                            </div>
                            <div className="team-row">
                                <input
                                    type="text"
                                    value={team.team_phone}
                                    onChange={(e) => handleTeamInputChange(index, 'team_phone', e.target.value)}
                                    placeholder="Company Phone"
                                    className="team-phone-input"
                                />
                                <input
                                    type="text"
                                    value={team.team_email}
                                    onChange={(e) => handleTeamInputChange(index, 'team_email', e.target.value)}
                                    placeholder="Company Email"
                                    className="team-email-input"
                                />
                            </div>
                            <div className="team-row">
                                <input
                                    type="text"
                                    value={team.team_address}
                                    onChange={(e) => handleTeamInputChange(index, 'team_address', e.target.value)}
                                    placeholder="Company Address"
                                    className="team-address-input"
                                />
                                <input
                                    type="text"
                                    value={team.team_country}
                                    onChange={(e) => handleTeamInputChange(index, 'team_country', e.target.value)}
                                    placeholder="Company Country"
                                    className="team-country-input"
                                />
                            </div>
                            <div className="team-row">
                                <input
                                    type="text"
                                    value={team.team_prompt}
                                    onChange={(e) => handleTeamInputChange(index, 'team_prompt', e.target.value)}
                                    placeholder="Company Prompt"
                                    className="team-prompt-input"
                                />
                            </div>
                            <div className="team-row">
                                <input
                                    type="text"
                                    value={team.team_detail}
                                    onChange={(e) => handleTeamInputChange(index, 'team_detail', e.target.value)}
                                    placeholder="Company Details"
                                    className="team-detail-input"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="team-button-container">
                    <button onClick={handleCreateTeams} className="create-button">Create Company</button>
                </div>
            </div>

            <div className="sectionnnn">
                <h3 className='create-user-heading'>Create Associate</h3>
                <div className="user-formm">
                    <div className="user-inputs">
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => handleUserInputChange('username', e.target.value)}
                            placeholder="Username"
                            className={fieldErrors.username ? 'error-field' : ''}
                        />
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => handleUserInputChange('email', e.target.value)}
                            placeholder="Email"
                            className={fieldErrors.email ? 'error-field' : ''}
                        />
                        <input
                            type="text"
                            value={newUser.mobile_num}
                            onChange={(e) => handleUserInputChange('mobile_num', e.target.value)}
                            placeholder="Mobile Number"
                            className={fieldErrors.mobile_num ? 'error-field' : ''}
                        />
                        <input
                            type="text"
                            value={newUser.mobile_num_2}
                            onChange={(e) => handleUserInputChange('mobile_num_2', e.target.value)}
                            placeholder="Alter Mobile Number"
                            className={fieldErrors.mobile_num_2 ? 'error-field' : ''}
                        />
                        <input
                            type="text"
                            value={newUser.designation}
                            onChange={(e) => handleUserInputChange('designation', e.target.value)}
                            placeholder="Designation"
                            className={fieldErrors.designation ? 'error-field' : ''}
                        />
                        <select
                            value={newUser.team_id}
                            onChange={(e) => handleUserInputChange('team_id', e.target.value)}
                            className={fieldErrors.team_id ? 'error-field' : ''}
                        >
                            <option value="">Select Company</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.team_name}</option>
                            ))}
                        </select>
                        {fieldErrors.team_id && <div className="error-messaage">{fieldErrors.team_id}</div>}
                    </div>

                    <button onClick={handleCreateUser} className="create-button">Create Associate</button>
                </div>
            </div>

        </div>
    );
};

export default Center;