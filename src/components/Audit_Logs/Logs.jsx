import React, { useState, useEffect } from 'react';

// Main Logs component to render the AuditLogPage
export default function Logs() {
  // In a real application, you would manage user authentication state here
  // For demonstration, we'll simulate an admin user
  const [isAdmin, setIsAdmin] = useState(true); // Set to true for testing admin view

  const containerStyle = {
    minHeight: '100vh',
    padding: '0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    margin: '0'
  };

  const accessDeniedStyle = {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
    maxWidth: '384px',
    width: '100%',
    animation: 'fadeIn 0.5s ease-in-out',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  const accessDeniedTitleStyle = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: '16px'
  };

  const accessDeniedTextStyle = {
    color: '#374151',
    fontSize: '1.125rem'
  };

  return (
    <div style={containerStyle}>
      {/* Conditionally render AuditLogPage based on admin status */}
      {isAdmin ? (
        <AuditLogPage />
      ) : (
        <div style={accessDeniedStyle}>
          <h2 style={accessDeniedTitleStyle}>Access Denied</h2>
          <p style={accessDeniedTextStyle}>You do not have permission to view this page. Please log in as an administrator.</p>
        </div>
      )}
    </div>
  );
}

// AuditLogPage component to display the audit log
function AuditLogPage() {
  // State to hold the audit log entries
  const [auditLogs, setAuditLogs] = useState([]);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to manage potential errors
  const [error, setError] = useState(null);
  // State for search query
  const [searchTerm, setSearchTerm] = useState('');
  // State for role filter
  const [roleFilter, setRoleFilter] = useState('All');
  // State for the currently selected log for details modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Function to export data to CSV
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
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const now = new Date();
    const dateTime = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('download', `${dateTime}_log.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulate fetching data from an API
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for demonstration
        const mockData = [
          {
            id: '1',
            timestamp: '2025-07-23 10:00:00',
            user: 'admin@example.com',
            role: 'Admin',
            activity: 'Logged in',
            status: 'Success',
            details: 'Successful login from IP: 192.168.1.100. Browser: Chrome, OS: Windows 10.',
          },
          {
            id: '2',
            timestamp: '2025-07-23 10:05:30',
            user: 'user1@example.com',
            role: 'User',
            activity: 'Created document',
            status: 'Success',
            details: 'Document "Project Plan Q3" created in folder "Marketing Materials". File size: 1.2MB.',
          },
          {
            id: '3',
            timestamp: '2025-07-23 10:10:15',
            user: 'admin@example.com',
            role: 'Admin',
            activity: 'Deleted user',
            status: 'Success',
            details: 'User "john.doe@example.com" (ID: U001) deleted permanently from the system. Associated data purged.',
          },
          {
            id: '4',
            timestamp: '2025-07-23 10:12:45',
            user: 'user2@example.com',
            role: 'User',
            activity: 'Updated profile',
            status: 'Failed',
            details: 'Email address update failed due to invalid format. Phone number update was successful.',
          },
          {
            id: '5',
            timestamp: '2025-07-23 10:15:00',
            user: 'admin@example.com',
            role: 'Admin',
            activity: 'Configured settings',
            status: 'Success',
            details: 'System settings updated: "Allow public registration" set to false, "Max file upload size" set to 50MB.',
          },
          {
            id: '6',
            timestamp: '2025-07-23 10:20:00',
            user: 'user3@example.com',
            role: 'User',
            activity: 'Downloaded report',
            status: 'Success',
            details: 'Report "Monthly Sales Q2 2025" downloaded in PDF format. IP: 172.16.0.50.',
          },
          {
            id: '7',
            timestamp: '2025-07-23 10:25:00',
            user: 'user1@example.com',
            role: 'User',
            activity: 'Logged out',
            status: 'Success',
            details: 'User logged out successfully from session ID: ABCDEFG123. Session duration: 25 minutes.',
          },
          {
            id: '8',
            timestamp: '2025-07-23 10:30:00',
            user: 'system',
            role: 'System',
            activity: 'Automated backup',
            status: 'Failed',
            details: 'Daily database backup failed. Error: Insufficient disk space. Backup size would be: 2.5GB.',
          },
          {
            id: '9',
            timestamp: '2025-07-23 10:35:00',
            user: 'user4@example.com',
            role: 'User',
            activity: 'Uploaded image',
            status: 'Success',
            details: 'Image "profile_pic.jpg" uploaded to user gallery. Resolution: 1024x768.',
          },
          {
            id: '10',
            timestamp: '2025-07-23 10:40:00',
            user: 'admin@example.com',
            role: 'Admin',
            activity: 'Granted permission',
            status: 'Success',
            details: 'Permission "edit_all_documents" granted to user "editor@example.com".',
          },
        ];
        setAuditLogs(mockData);
      } catch (err) {
        setError('Failed to fetch audit logs. Please try again.');
        console.error('Error fetching audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []); // Empty dependency array means this effect runs once on mount

  // Filtered logs based on search term and role filter
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || log.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    padding: '0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    margin: '0'
  };

  const loadingStyle = {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
    maxWidth: '384px',
    width: '100%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  const spinnerStyle = {
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px auto'
  };

  const errorStyle = {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
    maxWidth: '384px',
    width: '100%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  const mainContentStyle = {
    minHeight: '100vh',
    width: '100%',
    padding: '0'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px'
  };

  const titleStyle = {
    fontSize: '2.25rem',
    fontWeight: '800',
    margin: '0'
  };

  const exportButtonStyle = {
    padding: '12px 24px',
    background: localStorage.getItem("primaryColor"),
    color: 'white',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out'
  };

  const navbarStyle = {
    padding: '0 32px',
    borderBottom: '1px solid #6b7280'
  };

  const navTabsStyle = {
    display: 'flex',
    gap: '0'
  };

  const getNavTabStyle = (isActive) => ({
    padding: '16px 24px',
    backgroundColor: isActive ? '#374151' : 'transparent',
    color: isActive ? '#ffffff' : '#9ca3af',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease-in-out',
    borderBottom: isActive ? '3px solid #6366f1' : '3px solid transparent'
  });

  const contentAreaStyle = {
    padding: '32px'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #6b7280',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
    marginBottom: '24px'
  };

  const tableContainerStyle = {
    overflowX: 'auto',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const theadStyle = {
    background: 'linear-gradient(to right, #f9fafb, #f3f4f6)'
  };

  const thStyle = {
    padding: '16px 24px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const tdStyle = {
    padding: '16px 24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#1f2937',
    borderBottom: '1px solid #f3f4f6'
  };

  const getRoleBadgeStyle = (role) => {
    const baseStyle = {
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '9999px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    };

    if (role === 'Admin') {
      return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
    } else if (role === 'User') {
      return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
    } else {
      return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '9999px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    };

    if (status === 'Success') {
      return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
    } else {
      return { ...baseStyle, backgroundColor: '#fecaca', color: '#991b1b' };
    }
  };

  const viewDetailsButtonStyle = {
    color: '#6366f1',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    transition: 'color 0.2s ease-in-out'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 50
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '32px',
    maxWidth: '512px',
    width: '100%',
    transform: 'scale(0.95)',
    transition: 'transform 0.3s ease-out'
  };

  const modalTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px'
  };

  const modalCloseButtonStyle = {
    padding: '8px 24px',
    backgroundColor: '#6366f1',
    color: 'white',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out'
  };

  const detailsContainerStyle = {
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    marginTop: '4px',
    display: 'block'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <p style={{ color: '#374151', fontSize: '1.125rem' }}>Loading audit logs, please wait...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '16px' }}>Error</h2>
          <p style={{ color: '#374151', fontSize: '1.125rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  const roleOptions = ['All', 'Admin', 'User', 'System'];

  return (
    <div style={mainContentStyle}>
      {/* Header with title and export button */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Website Audit Log</h1>
        <button
          onClick={() => exportToCSV(filteredLogs)}
          style={exportButtonStyle}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Export to CSV
        </button>
      </div>

      {/* Navigation Tabs for Role Filter */}
      <div style={navbarStyle}>
        <div style={navTabsStyle}>
          {roleOptions.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={getNavTabStyle(roleFilter === role)}
              onMouseOver={(e) => {
                if (roleFilter !== role) {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.color = '#ffffff';
                }
              }}
              onMouseOut={(e) => {
                if (roleFilter !== role) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }
              }}
            >
              {role} Roles
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={contentAreaStyle}>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by user, activity, or details..."
          style={searchInputStyle}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = '#6366f1'}
          onBlur={(e) => e.target.style.borderColor = '#6b7280'}
        />

        {/* Audit Log Table */}
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Activity</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    style={{ transition: 'background-color 0.15s ease-in-out' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eef2ff'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={tdStyle}>{log.timestamp}</td>
                    <td style={tdStyle}>{log.user}</td>
                    <td style={tdStyle}>
                      <span style={getRoleBadgeStyle(log.role)}>
                        {log.role}
                      </span>
                    </td>
                    <td style={tdStyle}>{log.activity}</td>
                    <td style={tdStyle}>
                      <span style={getStatusBadgeStyle(log.status)}>
                        {log.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        style={viewDetailsButtonStyle}
                        onMouseOver={(e) => e.target.style.color = '#4338ca'}
                        onMouseOut={(e) => e.target.style.color = '#6366f1'}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontSize: '1.125rem', padding: '32px 24px' }}>
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Log Entry Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#374151' }}><strong>ID:</strong> {selectedLog.id}</p>
              <p style={{ color: '#374151' }}><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
              <p style={{ color: '#374151' }}><strong>User:</strong> {selectedLog.user}</p>
              <p style={{ color: '#374151' }}>
                <strong>Role:</strong> <span style={getRoleBadgeStyle(selectedLog.role)}>{selectedLog.role}</span>
              </p>
              <p style={{ color: '#374151' }}><strong>Activity:</strong> {selectedLog.activity}</p>
              <p style={{ color: '#374151' }}>
                <strong>Status:</strong> <span style={getStatusBadgeStyle(selectedLog.status)}>{selectedLog.status}</span>
              </p>
              <p style={{ color: '#374151' }}>
                <strong>Details:</strong> 
                <span style={detailsContainerStyle}>{selectedLog.details}</span>
              </p>
            </div>
            <div style={{ marginTop: '32px', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={modalCloseButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}