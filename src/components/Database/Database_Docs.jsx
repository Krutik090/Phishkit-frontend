import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Copy
} from 'lucide-react';

const Database_Docs = ({ dbName = 'authusers' }) => {
  const [documents, setDocuments] = useState([
    {
      _id: "6877c19e3b1850...",
      name: "kalpataru",
      email: "kalpataru@tribastion.com",
      emailsSent: 0,
      emailLimit: 5000,
      campaignsLaunched: ["6 elements"],
      password: "$2b$10$LNyVF1aZHMKilzJk...",
      role: "admin"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metadata, setMetadata] = useState({
    count: 1,
    storageSize: "2.4 KB",
    avgObjSize: "2.4 KB",
    nIndexes: 2,
    totalIndexSize: "1.2 KB"
  });
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/db/all-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const result = await response.json();
      
      if (result.success && result.data && result.data[dbName]) {
        setDocuments(result.data[dbName].documents || []);
        setMetadata(result.data[dbName].metadata || {});
      } else {
        // Use mock data if API fails
        console.log(`Collection '${dbName}' not found, using mock data`);
      }
    } catch (err) {
      console.error('API Error:', err.message);
      // Use mock data on error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDocuments();
    setIsRefreshing(false);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleAddData = () => {
    alert('Add new document functionality');
  };

  const handleExportData = () => {
    alert('Export data functionality');
  };

  const handleUpdate = () => {
    alert('Update functionality');
  };

  const handleDelete = () => {
    alert('Delete functionality');
  };

  const handleView = (id) => {
    const doc = documents.find(d => d._id === id);
    if (doc) {
      alert(`View Document: ${JSON.stringify(doc, null, 2)}`);
    }
  };

  const handleEdit = (id) => {
    const doc = documents.find(d => d._id === id);
    if (doc) {
      alert(`Edit Document: ${id}`);
    }
  };

  const handleDeleteDoc = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc._id !== id));
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    alert('ID copied to clipboard');
  };

  const formatValue = (value, key) => {
    if (value === null || value === undefined) return '';
    
    if (key === '_id') {
      return value.toString().substring(0, 18) + '...';
    }
    
    if (Array.isArray(value)) {
      return `${value.length} elements`;
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 20) + '...';
    }
    
    if (typeof value === 'string' && value.length > 30) {
      return value.substring(0, 30) + '...';
    }
    
    return value.toString();
  };

  const getColumnType = (key) => {
    if (key === '_id') return 'ObjectId';
    if (key === 'name' || key === 'email' || key === 'password' || key === 'role') return 'String';
    if (key === 'emailsSent' || key === 'emailLimit') return 'Int32';
    if (key === 'campaignsLaunched') return 'Array';
    return 'String';
  };

  useEffect(() => {
    fetchDocuments();
  }, [dbName]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f8fafc' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <RefreshCw className="animate-spin" style={{ width: '48px', height: '48px', color: '#3b82f6' }} />
          <p style={{ marginLeft: '16px', color: '#64748b' }}>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f8fafc' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          gap: '16px'
        }}>
          <AlertCircle style={{ width: '48px', height: '48px', color: '#ef4444' }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Error Loading Documents</h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleGoBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
              {dbName}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>1 – 1 of 1</span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              opacity: isRefreshing ? 0.5 : 1
            }}
          >
            <RefreshCw style={{ width: '16px', height: '16px', color: '#374151' }} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => alert('Previous page')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            ‹
          </button>
          <button
            onClick={() => alert('Next page')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            ›
          </button>
          <button
            onClick={() => alert('View options')}
            style={{
              padding: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Eye style={{ width: '16px', height: '16px', color: '#374151' }} />
          </button>
          <button
            onClick={() => alert('Table view')}
            style={{
              padding: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <FileText style={{ width: '16px', height: '16px', color: '#374151' }} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        backgroundColor: '#ffffff',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={handleAddData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#22c55e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          ADD DATA
        </button>
        <button
          onClick={handleExportData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            color: '#374151',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <Download style={{ width: '16px', height: '16px' }} />
          EXPORT DATA
        </button>
        <button
          onClick={handleUpdate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            color: '#374151',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <Edit style={{ width: '16px', height: '16px' }} />
          UPDATE
        </button>
        <button
          onClick={handleDelete}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            color: '#374151',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <Trash2 style={{ width: '16px', height: '16px' }} />
          DELETE
        </button>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#374151', minWidth: '40px' }}>
                  <input type="checkbox" style={{ margin: 0 }} />
                </th>
                {documents.length > 0 && Object.keys(documents[0]).map((key) => (
                  <th key={key} style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontWeight: '500', 
                    color: '#374151',
                    minWidth: key === '_id' ? '200px' : '150px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '600' }}>{key}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#64748b', 
                        fontWeight: '400',
                        fontStyle: 'italic'
                      }}>
                        {getColumnType(key)}
                      </span>
                    </div>
                  </th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '500', color: '#374151', width: '120px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={doc._id || index} style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  ':hover': { backgroundColor: '#f8fafc' }
                }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                    <input type="checkbox" style={{ margin: 0 }} />
                  </td>
                  {Object.entries(doc).map(([key, value]) => (
                    <td key={key} style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      color: key === '_id' ? '#dc2626' : '#374151',
                      fontFamily: key === '_id' ? 'Monaco, "Courier New", monospace' : 'inherit',
                      fontSize: key === '_id' ? '12px' : '14px'
                    }}>
                      {key === '_id' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#dc2626' }}>ObjectId</span>
                          <span style={{ color: '#1e293b' }}>("{formatValue(value, key)}")</span>
                          <button
                            onClick={() => handleCopyId(value)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              color: '#64748b'
                            }}
                          >
                            <Copy style={{ width: '12px', height: '12px' }} />
                          </button>
                        </div>
                      ) : key === 'campaignsLaunched' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#7c3aed' }}>□</span>
                          <span>{formatValue(value, key)}</span>
                        </div>
                      ) : (
                        <span>{formatValue(value, key)}</span>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleView(doc._id)}
                        style={{
                          padding: '4px 6px',
                          backgroundColor: '#f0f9ff',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="View"
                      >
                        <Eye style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => handleEdit(doc._id)}
                        style={{
                          padding: '4px 6px',
                          backgroundColor: '#fffbeb',
                          color: '#d97706',
                          border: '1px solid #fed7aa',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Edit"
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc._id)}
                        style={{
                          padding: '4px 6px',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Delete"
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Database_Docs;