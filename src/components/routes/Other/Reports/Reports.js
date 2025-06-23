// src/components/routes/Other/Reports/Reports.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Reports.css';

// Reuse DownloadFile table styles
import '../Header/Download/DownloadFile.css';

/*
 * Simple page that lets an admin trigger the backend /reports/fetch endpoint
 * and then displays the resulting database rows (or inserted counts) in a table
 * using the same styling as DownloadFile.
 */
const Reports = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);        // holds table rows
  const [search, setSearch] = useState('');    // retained (invisible)
  const [filteredData, setFilteredData] = useState([]); // filtered table rows
  const [reportType, setReportType] = useState('inbound'); // inbound | outbound | charges
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const token = localStorage.getItem('token');

  // Safe includes helper (borrowed from DownloadFile)
  const safeIncludes = (value, term) => {
    if (value === null || value === undefined) return false;
    if (value instanceof Date) {
      return value.toLocaleString().toLowerCase().includes(term);
    }
    return value.toString().toLowerCase().includes(term);
  };

  // helper for date input
  const handleDateChange = setter => e => setter(e.target.value);

  // recompute filtered list whenever data/search/date range changes
  useEffect(() => {
    let rows = data;

    // text filter (optional)
    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter(row => Object.values(row).some(v => safeIncludes(v, term)));
    }

    // date range filter if created_at column exists and dates selected
    if ((startDate || endDate) && data.length && data[0].created_at) {
      const start = startDate ? new Date(startDate) : null;
      // add one minute to end to make comparison inclusive
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setSeconds(59, 999);

      rows = rows.filter(row => {
        const tsRaw = row.created_at || row.date || row.timestamp;
        if (!tsRaw) return false;
        const ts = new Date(tsRaw);
        if (isNaN(ts)) return false;
        if (start && ts < start) return false;
        if (end && ts > end) return false; // inclusive because end had extra seconds
        return true;
      });
    }

    setFilteredData(rows);

    // update message to reflect current counts
    if (data.length) {
      setMessage(`Displaying ${rows.length} record(s).`);
    }
  }, [search, data, startDate, endDate]);

  const handleFetch = async () => {
    if (!token) {
      setMessage('Login first.');
      return;
    }
    setLoading(true);
    setMessage('');
    setData([]);

    try {
      const base = process.env.REACT_APP_API_URL || '';

      // 1. Trigger backend to fetch and insert new e-mails first
      await axios.get(`${base}/reports/fetch`, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: { rejectUnauthorized: false }
      }).catch(() => {/* ignore errors – table fetch may still work */});

      // 2. Now fetch the latest rows from the requested table
      const res = await axios.get(`${base}/reports/table/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: { rejectUnauthorized: false }
      });

      // Attempt to extract table-like data from response
      let rows = res.data?.rows || res.data?.data || null;

      // Fallback: convert inserted counts object to rows
      if (!rows && res.data?.inserted && typeof res.data.inserted === 'object') {
        rows = Object.entries(res.data.inserted).map(([type, count]) => ({ Report: type, Inserted: count }));
      }

      if (Array.isArray(rows) && rows.length) {
        setData(rows);
        setFilteredData(rows);
        // message will be updated by useEffect
      } else {
        setMessage('No data returned from server.');
      }
    } catch (err) {
      const txt = err?.response?.data?.message || err.message || 'Request failed';
      setMessage(`Error: ${txt}`);
    } finally {
      setLoading(false);
    }
  };

  // Download current filteredData to Excel
  const handleDownload = () => {
    if (!filteredData.length) return;
    const excelData = filteredData.map(row => ({ ...row }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    const startPart = startDate ? startDate.split('T')[0] : 'all';
    const endPart = endDate ? endDate.split('T')[0] : 'now';
    const filename = `${reportType}_${startPart}_to_${endPart}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // Determine columns dynamically from first row
  const columns = data.length ? Object.keys(data[0]) : [];

  return (
    <div style={{ padding: '0.25rem' }}>
      <h2 className="reports-title">Reports</h2>
      <div style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="report-type" style={{ marginRight: '0.5rem' }}>Report Type:</label>
        <select
          id="report-type"
          className="queue-select"
          value={reportType}
          onChange={e => setReportType(e.target.value)}
          style={{ padding: '0.25rem' }}
        >
          <option value="inbound">Inbound Calls</option>
          <option value="outbound">Outbound Calls</option>
          <option value="charges">User Charges</option>
        </select>
      </div>
      <button className="download-btn" onClick={handleFetch} disabled={loading}>
        {loading ? 'Processing…' : 'Fetch Reports'}
      </button>

      {message && <p style={{ marginTop: '0.1rem' ,fontSize: '0.8rem' }}>{message}</p>}

      {data.length > 0 && (
        <>
          <div className="date-picker-wrapperr">
            <span className="date-pickerr">
              <label htmlFor="start-date">Start Date and Time *</label>
              <input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={handleDateChange(setStartDate)}
                className="datetime-input"
                required
              />
            </span>

            <span className="date-pickerr"> 
              <label htmlFor="end-date">End Date and Time *</label>
              <input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={handleDateChange(setEndDate)}
                className="datetime-input"
                required
              /> 

            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map(col => (
                      <td key={col}>{row[col] !== null && row[col] !== undefined ? row[col].toString() : 'N/A'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-info">
            <span>Total Records: {filteredData.length}</span>
          </div>
          <button className="download-btn" style={{ marginTop: '4px' }} onClick={handleDownload}>
            Download as Excel
          </button>
        </>
      )}
    </div>
  );
};

export default Reports;