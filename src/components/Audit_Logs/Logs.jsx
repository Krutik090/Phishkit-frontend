import React, { useState, useEffect } from 'react';
import './Logs.css'; // Import the CSS file

export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);
useEffect(() => {
  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/users/getlogs');
      if (!response.ok) throw new Error('Failed to fetch logs');

      const result = await response.json();

      // Transform API logs to match UI format
      const mappedLogs = result.logs.map((log, index) => ({
        id: log._id,
        timestamp: new Date(log.timestamp).toLocaleString(),
        user: log.details.split(': ')[1] || 'Unknown',
        role: log.userId === '687deb05c6bc103b7e6df658' ? 'Admin' : 'User', // Adjust as needed
        activity: log.action.charAt(0).toUpperCase() + log.action.slice(1),
        status: log.category === 'success' ? 'Success' : 'Failed',
        details: `${log.details} | IP: ${log.ip}`,
      }));

      setAuditLogs(mappedLogs);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch audit logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchAuditLogs();
}, []);


  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || log.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportToCSV = (data) => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Activity', 'Status', 'Details'];
    const csvContent = [
      headers.join(','),
      ...data.map(log => [
        log.id,
        log.timestamp,
        `"${log.user}"`,
        log.role,
        `"${log.activity}"`,
        log.status,
        `"${log.details.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${new Date().toISOString().replace(/[:.]/g, '-')}_logs.csv`;
    link.click();
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="audit-log-container">
      <div className="header">
        <h1>Website Audit Log</h1>
        <button onClick={() => exportToCSV(filteredLogs)}>Export to CSV</button>
      </div>

      <div className="filters">
        {['All', 'Admin', 'User'].map(role => (
          <button
            key={role}
            className={`role-tab ${roleFilter === role ? 'active' : ''}`}
            onClick={() => setRoleFilter(role)}
          >
            {role} Roles
          </button>
        ))}
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="audit-log-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Activity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.user}</td>
                <td><span className={`badge ${log.role.toLowerCase()}`}>{log.role}</span></td>
                <td>{log.activity}</td>
                <td><span className={`badge ${log.status.toLowerCase()}`}>{log.status}</span></td>
                <td><button onClick={() => setSelectedLog(log)} className='view'>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Log Entry Details</h2>
            {/* <p><strong>ID:</strong> {selectedLog.id}</p> */}
            <p><strong>User:</strong> {selectedLog.user}</p>
            <p><strong>Details:</strong> {selectedLog.details}</p>
            <button onClick={() => setSelectedLog(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
