// src/components/routes/Forms/TeamForm/TeamForm.js

import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import './TeamForm.css';

const TeamForm = () => {
    const { teamName, businessId: routeBusinessId } = useParams();
    const navigate = useNavigate();
    const [teamDetails, setTeamDetails] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                let userData = JSON.parse(localStorage.getItem('user') || '{}');
                console.log('User data:', userData);
                
                // Check if we're using the business-center URL format
                const isBusinessCenterUrl = window.location.pathname.startsWith('/business/center');
                
                let apiEndpoint;
                if (isBusinessCenterUrl) {
                    // For business-center URL, use the new endpoint
                    apiEndpoint = `${process.env.REACT_APP_API_URL}/business/center/${encodeURIComponent(teamName)}`;
                    // Only add business_center_id if it exists
                    const businessCenterId = userData.business_center_id || localStorage.getItem('businessId');
                    if (businessCenterId && businessCenterId !== 'null') {
                        apiEndpoint += `?business_center_id=${businessCenterId}`;
                    }
                    console.log('Business center URL format with endpoint:', apiEndpoint);
                } else {
                    // For traditional URL, use the business ID endpoint
                    const businessId = routeBusinessId || localStorage.getItem('businessId') || userData.brand_id || userData.business_center_id;
                    if (!businessId || businessId === 'null') {
                        throw new Error('Business/Brand ID not found. Please log in again.');
                    }
                    apiEndpoint = `${process.env.REACT_APP_API_URL}/business/${businessId}/teams`;
                    console.log('Traditional URL format with endpoint:', apiEndpoint);
                }
                
                console.log('Using API endpoint:', apiEndpoint);
                const response = await axios.get(apiEndpoint, config);
                console.log('API Response:', response.data);

                let teamsData;
                if (isBusinessCenterUrl) {
                    // For business-center URL, response contains a single team
                    teamsData = response.data.team ? [response.data.team] : [];
                } else {
                    // For traditional URL, response contains an array of teams
                    teamsData = response.data.teams || [];
                }
                
                if (!Array.isArray(teamsData)) {
                    console.error('Invalid teams data:', teamsData);
                    throw new Error('Invalid response format from server');
                }

                console.log('Available teams:', teamsData.map(t => t.team_name));

                // Decode the team name from URL
                const decodedTeamName = decodeURIComponent(teamName);
                console.log('Looking for team:', decodedTeamName);

                // Find the specific team (case-insensitive and handle both spaces and underscores)
                const team = teamsData.find(t => {
                    const normalizedTeamName = t.team_name.replace(/_/g, ' ');
                    const normalizedSearchName = decodedTeamName.replace(/_/g, ' ');
                    return normalizedTeamName.toLowerCase() === normalizedSearchName.toLowerCase();
                });
                
                if (!team) {
                    throw new Error(`Team "${decodedTeamName}" not found. Available teams: ${teamsData.map(t => t.team_name.replace(/_/g, ' ')).join(', ')}`);
                }

                setTeamDetails(team);

                // Get team members - always use business endpoint
                const membersEndpoint = `${apiUrl}/business/${team.business_id}/team/${team.id}/members`;
                console.log('Fetching members from:', membersEndpoint);
                
                const membersResponse = await axios.get(membersEndpoint, config);
                console.log('Members response:', membersResponse.data);
                
                // Members data is in response.data.data
                const membersData = membersResponse.data?.data;

                if (membersData && Array.isArray(membersData)) {
                    setTeamMembers(membersData);
                }
                
                setIsLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to load team details');
                setIsLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        if (teamName) {
            fetchTeamDetails();
        }
    }, [teamName, navigate, apiUrl]);

    const handleViewRecords = () => {
        if (teamDetails) {
            navigate(`/customers/search?team=${encodeURIComponent(teamDetails.team_name)}`);
        }
    };

    const handleAddRecord = () => {
        navigate(`/customers/create?team=${encodeURIComponent(teamDetails.team_name)}`);
    };


    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!teamDetails) {
        return <div className="error">Team not found</div>;
    }

    return (
        <div className="team-form-container">
            <div className="team-titlee">
                <h1 className="team-name">{teamDetails.team_name}</h1>
                <button className="view-records-btn" onClick={handleViewRecords}>
                    View Records
                </button>
            </div>
            <div>
                <p className="team-prompt"><strong>PROMPT:</strong> <i>{teamDetails.team_prompt || 'No team prompt available'}</i></p>
            </div>

            <div className="team-info">
                <div className="info-section">
                    <h2>Company Details</h2>
                    <div className="detail-item">
                        <label>Phone No:</label>
                        <span>{teamDetails.team_phone || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Email:</label>
                        <span>{teamDetails.team_email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Registration No:</label>
                        <span>{teamDetails.reg_no || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Tax ID:</label>
                        <span>{teamDetails.tax_id || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Address:</label>
                        <span>{teamDetails.team_address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Country:</label>
                        <span>{teamDetails.team_country || 'N/A'}</span>
                    </div>
                </div>

                <div className="info-section">
                    <h2>Company Description</h2>
                    <p className="team-detail">{teamDetails.team_detail || 'No description available'}</p>
                </div>
            </div>

            <div className="team-members">
                <h2>Company Members ({teamMembers.length})</h2>
                <div className="members-grid">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="member-card">
                            <h3>{member.username}</h3>
                            <div className="member-details">
                                <p><strong>Role:</strong> {member.designation}</p>
                                <p><strong>Email:</strong> {member.email}</p>
                                <p><strong>Phone:</strong> <a href={`tel:${member.mobile_num}`}>{member.mobile_num}</a></p>
                                {member.mobile_num_2 && (
                                    <p><strong>Alt Phone:</strong> <a href={`tel:${member.mobile_num_2}`}>{member.mobile_num_2}</a></p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bottom-actions">
                <button className="add-record-btn" onClick={handleAddRecord}>
                    Add New Record
                </button>
            </div>
        </div>
    );
};

export default TeamForm;