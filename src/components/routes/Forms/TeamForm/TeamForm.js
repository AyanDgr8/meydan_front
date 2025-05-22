// src/components/routes/Forms/TeamForm/TeamForm.js

import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import './TeamForm.css';

const TeamForm = () => {
    const { teamName } = useParams();
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

                // First get all teams
                const teamsResponse = await axios.get(`${apiUrl}/team/players/teams`, config);
                console.log('Teams response:', teamsResponse.data); // Debug log

                if (!teamsResponse.data) {
                    throw new Error('No teams data received');
                }

                // Find the specific team
                const team = teamsResponse.data.find(t => t.team_name === teamName);
                console.log('Found team:', team); // Debug log

                if (!team) {
                    throw new Error(`Team ${teamName} not found`);
                }
                setTeamDetails(team);

                // Then fetch users for this team
                const usersResponse = await axios.get(`${apiUrl}/players/users`, config);
                console.log('Users response:', usersResponse.data); // Debug log

                if (usersResponse.data && usersResponse.data.data) {
                    // Filter users for this team
                    const teamUsers = usersResponse.data.data.filter(user => user.team_id === team.id);
                    console.log('Team users:', teamUsers); // Debug log
                    setTeamMembers(teamUsers);
                }
                
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching team details:', err);
                setError(err.response?.data?.message || 'Failed to load team details');
                setIsLoading(false);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchTeamDetails();
    }, [teamName, apiUrl, navigate]);

    const handleViewRecords = () => {
        if (teamDetails) {
            navigate(`/customers/search?team=${teamDetails.team_name}`);
        }
    };

    const handleAddRecord = () => {
        navigate(`/customers/create?team=${teamDetails.team_name}`);
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
            <div className="team-header">
                <div className="team-title">
                    <h1 className="team-namee">{teamDetails.team_name}</h1>
                    <p className="team-prompt"><strong>PROMPT:</strong> <i>{teamDetails.team_prompt || 'No team prompt available'}</i></p>
                </div>
                <button className="view-records-btn" onClick={handleViewRecords}>
                    View Records
                </button>
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