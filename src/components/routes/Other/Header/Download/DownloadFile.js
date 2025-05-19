// src/components/routes/Other/Header/Download/DownloadFile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './DownloadFile.css';

const DownloadFile = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.REACT_APP_API_URL;
                const userResponse = await axios.get(`${apiUrl}/current-user`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                
                setUser(userResponse.data);
                console.log('User data:', userResponse.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };

        fetchUser();
    }, [navigate]);

    // Filter data when search term changes
    useEffect(() => {
        if (!data.length) {
            setFilteredData([]);
            return;
        }

        if (!searchTerm) {
            setFilteredData(data);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filtered = data.filter(item => {
            // Helper function to safely check if a value includes the search term based on type
            const safeIncludes = (value, searchTerm, type = 'string') => {
                if (value === null || value === undefined) return false;
                
                switch(type) {
                    case 'date':
                        if (!value) return false;
                        const dateStr = new Date(value).toLocaleDateString();
                        return dateStr.toLowerCase().includes(searchTerm);
                    case 'enum':
                        return value.toLowerCase() === searchTerm;
                    default:
                        return value.toString().toLowerCase().includes(searchTerm);
                }
            };

            // Search based on new schema fields
            return (
                safeIncludes(item.first_name, searchTermLower) ||
                safeIncludes(item.middle_name, searchTermLower) ||
                safeIncludes(item.last_name, searchTermLower) ||
                safeIncludes(item.phone_no_primary, searchTermLower) ||
                safeIncludes(item.phone_no_secondary, searchTermLower) ||
                safeIncludes(item.whatsapp_num, searchTermLower) ||
                safeIncludes(item.email_id, searchTermLower) ||
                safeIncludes(item.gender, searchTermLower, 'enum') ||
                safeIncludes(item.address, searchTermLower) ||
                safeIncludes(item.country, searchTermLower) ||
                safeIncludes(item.company_name, searchTermLower) ||
                safeIncludes(item.designation, searchTermLower) ||
                safeIncludes(item.website, searchTermLower) ||
                safeIncludes(item.other_location, searchTermLower) ||
                safeIncludes(item.contact_type, searchTermLower, 'enum') ||
                safeIncludes(item.source, searchTermLower) ||
                safeIncludes(item.disposition, searchTermLower, 'enum') ||
                safeIncludes(item.QUEUE_NAME, searchTermLower) ||
                safeIncludes(item.agent_name, searchTermLower) ||
                safeIncludes(item.comment, searchTermLower) ||
                safeIncludes(item.date_of_birth, searchTermLower, 'date') ||
                safeIncludes(item.C_unique_id, searchTermLower)
            );
        });

        setFilteredData(filtered);
    }, [searchTerm, data, user?.role]);

    const isValidDateRange = () => {
        if (!startDate || !endDate) return false;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start <= end && !isNaN(start) && !isNaN(end);
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatTableValue = (value) => {
        if (value === null || value === undefined) return '-';
        if (value === '') return '-';
        if (typeof value === 'string' && value.includes('T')) {
            // Format datetime values
            return formatDateTime(value);
        }
        return value;
    };

    const getColumnOrder = () => {
        return [
            'first_name',
            'middle_name',
            'last_name',
            'phone_no_primary',
            'phone_no_secondary',
            'whatsapp_num',
            'email_id',
            'date_of_birth',
            'gender',
            'address',
            'country',
            'company_name',
            'designation',
            'website',
            'other_location',
            'contact_type',
            'source',
            'disposition',
            'QUEUE_NAME',
            'agent_name',
            'comment',
            'scheduled_at',
            'date_created',
            'last_updated'
        ];
    };

    const getColumnHeader = (key) => {
        const headers = {
            'first_name': 'First Name',
            'middle_name': 'Middle Name',
            'last_name': 'Last Name',
            'phone_no_primary': 'Primary Phone',
            'phone_no_secondary': 'Secondary Phone',
            'whatsapp_num': 'WhatsApp',
            'email_id': 'Email',
            'date_of_birth': 'Date of Birth',
            'gender': 'Gender',
            'address': 'Address',
            'country': 'Country',
            'company_name': 'Company',
            'designation': 'Designation',
            'website': 'Website',
            'other_location': 'Other Location',
            'contact_type': 'Contact Type',
            'source': 'Source',
            'disposition': 'Disposition',
            'QUEUE_NAME': 'Queue Name',
            'agent_name': 'Agent',
            'comment': 'Comment',
            'scheduled_at': 'Scheduled At',
            'date_created': 'Created Date',
            'last_updated': 'Last Updated'
        };
        return headers[key] || key;
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Set the end time to end of day
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.get(`${apiUrl}/customers/date-range`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                }
            });

            console.log('Response:', response.data);

            if (response.data.success) {
                const records = response.data.data || [];
                setData(records);
                
                if (records.length === 0) {
                    setError('No records found in the selected date range');
                } else {
                    console.log(`Found ${records.length} records between ${start.toLocaleString()} and ${end.toLocaleString()}`);
                }
            } else {
                setError(response.data.message || 'Error fetching data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.response?.data?.message || 'Error fetching data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchData();
        }
    }, [startDate, endDate]); // Re-fetch when dates change

    const handleDateChange = setter => e => {
        setter(e.target.value);
    };

    const handleScheduleddAtClick = (e) => {
        e.preventDefault();
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        e.target.value = localDateTime;
    };

    const handleDownload = () => {
        if (!filteredData.length) {
            setError('No data available to download');
            return;
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredData.map(row => {
                const formattedRow = {};
                getColumnOrder().forEach(key => {
                    let value = row[key];
                    // Format dates
                    if (key === 'date_of_birth' || key === 'scheduled_at' || key === 'date_created' || key === 'last_updated') {
                        value = value ? formatDateTime(value) : '';
                    }
                    // Format name fields
                    if (['first_name', 'middle_name', 'last_name'].includes(key)) {
                        value = value || '';
                    }
                    formattedRow[getColumnHeader(key)] = value;
                });
                return formattedRow;
            }));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Data');

            // Generate filename with current date
            const date = new Date();
            const filename = `customer_data_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.xlsx`;

            XLSX.writeFile(workbook, filename);
        } catch (error) {
            console.error('Error downloading file:', error);
            setError('Error downloading file. Please try again.');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Check if user has permission based on role
    const hasDownloadPermission = user && (
        ['super_admin', 'it_admin', 'business_head'].includes(user.role) ||
        (user.role === 'team_leader' && user.permissions && user.permissions.includes('download_data')) ||
        (user.permissions && user.permissions.includes('download_data'))
    );

    if (!hasDownloadPermission) {
        return <div className="error-message">You do not have permission to access this page.</div>;
    }

    // Show search for all roles, but with appropriate placeholder text
    const getSearchPlaceholder = () => {
        if (['super_admin', 'it_admin', 'business_head'].includes(user?.role)) {
            return "Search across all data...";
        }
        return "Search within your team's data...";
    };

    return (
        <div className="download-page">
            <h2 className="download-heading">
                {['super_admin', 'it_admin', 'business_head'].includes(user?.role) 
                    ? 'Download All Customer Data' 
                    : "Download Team's Customer Data"}
            </h2>
            
            <div className="date-picker-container">
                <div className="date-picker-wrapper">
                    <label htmlFor="start-date">Start Date and Time *</label>
                    <input
                        id="start-date"
                        type="datetime-local"
                        value={startDate}
                        onChange={handleDateChange(setStartDate)}
                        className="datetime-input"
                        required
                    />
                </div>
                <div className="date-picker-wrapper">
                    <label htmlFor="end-date">End Date and Time *</label>
                    <input
                        id="end-date"
                        type="datetime-local"
                        value={endDate}
                        onChange={handleDateChange(setEndDate)}
                        className="datetime-input"
                        required
                    />
                </div>
            </div>

            {/* {error && <div className="error-message">{error}</div>} */}
            
            {loading ? (
                <div className="loading-message">Loading data...</div>
            ) : filteredData.length > 0 ? (
                <>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {getColumnOrder().map((key) => (
                                        <th key={key}>{getColumnHeader(key)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, index) => (
                                    <tr key={index}>
                                        {getColumnOrder().map((key) => (
                                            <td key={key}>{formatTableValue(row[key])}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-info">
                        <span>Total Records: {filteredData.length}</span>
                        {searchTerm && <span> (Filtered from {data.length} records)</span>}
                    </div>
                    <button 
                        className="download-btn" 
                        onClick={handleDownload}
                        disabled={loading}
                    >
                        Download as Excel
                    </button>
                </>
            ) : (
                <div className="no-data-message">
                    {startDate && endDate ? 'No data available for the selected date range.' : 'Please select a date range to view data.'}
                </div>
            )}
        </div>
    );
};

export default DownloadFile;