import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import {
  Database,
  ArrowLeft,
  RefreshCw,
  Copy,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

// This component is not in the provided context, but for completeness.
const SecureIconWithTooltip = () => (
    <div title="This is a secure connection.">
        {/* Placeholder for a secure icon component */}
    </div>
);

const Database_Docs = () => {
  const { dbName } = useParams();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [documents, setDocuments] = useState([]);
  const [headers, setHeaders] = useState([]); // State to hold all unique headers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metadata, setMetadata] = useState({
    count: 0,
    storageSize: "0 KB",
    avgObjSize: "0 KB",
    nIndexes: 0,
    totalIndexSize: "0 KB"
  });

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    if (!dbName) {
      setError("Database name not found in the URL.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/db/full-db`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch database information: ${response.statusText}`);
      }
      const result = await response.json();

      if (result.success && result.data && result.data[dbName]) {
        const collectionDocs = result.data[dbName].documents || [];
        setDocuments(collectionDocs);
        setMetadata(result.data[dbName].metadata || {});

        // **FIX: Generate headers from ALL documents**
        if (collectionDocs.length > 0) {
            const allKeys = new Set();
            collectionDocs.forEach(doc => {
                Object.keys(doc).forEach(key => allKeys.add(key));
            });
            // Sort keys to ensure consistent order, with _id first.
            const sortedKeys = Array.from(allKeys).sort((a, b) => {
                if (a === '_id') return -1;
                if (b === '_id') return 1;
                return a.localeCompare(b);
            });
            setHeaders(sortedKeys);
        } else {
            setHeaders([]);
        }

      } else {
        setError(`No data available for collection: '${dbName}'.`);
        setDocuments([]);
        setHeaders([]);
      }
    } catch (err) {
      console.error('API Error:', err.message);
      setError(err.message);
      setDocuments([]);
      setHeaders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDocuments();
  };

  const handleGoBack = () => {
    navigate(-1); // Use navigate for better SPA behavior
  };
  
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
        toast.success("ID copied to clipboard!");
    }).catch(err => {
        toast.error("Failed to copy ID.");
        console.error('Copy failed', err);
    });
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '—'; // Display dash for null/undefined
    if (Array.isArray(value)) return `[ ${value.length} elements ]`;
    if (typeof value === 'object') return JSON.stringify(value).substring(0, 30) + '...';
    if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
    return String(value);
  };

  const getColumnType = (key) => {
    if (key === '_id') return 'ObjectId';
    if (key.toLowerCase().includes('name') || key.toLowerCase().includes('email')) return 'String';
    if (key.toLowerCase().includes('password')) return 'Hashed String';
    if (key.toLowerCase().includes('date') || key.endsWith('At')) return 'DateTime';
    if (key.toLowerCase().includes('count') || key.toLowerCase().includes('limit')) return 'Number';
    if (Array.isArray(documents[0]?.[key])) return 'Array';
    if (typeof documents[0]?.[key] === 'boolean') return 'Boolean';
    return 'Mixed';
  };

  useEffect(() => {
    fetchDocuments();
  }, [dbName]);

  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <RefreshCw className="animate-spin" style={{ width: '48px', height: '48px', color: '#3b82f6' }} />
          <p style={{ marginLeft: '16px', color: '#64748b' }}>Loading documents for {dbName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '400px', gap: '16px' }}>
          <AlertCircle style={{ width: '48px', height: '48px', color: '#ef4444' }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Error Loading Documents</h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
            <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              <RefreshCw style={{ width: '16px', height: '16px' }} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '16px 20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleGoBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>{dbName}</h1>
          </div>
          <SecureIconWithTooltip />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>{metadata.count > 0 ? `1–${documents.length} of ${metadata.count}` : '0 of 0'}</span>
          <button onClick={handleRefresh} disabled={isRefreshing} style={{ padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', opacity: isRefreshing ? 0.5 : 1 }}>
            <RefreshCw style={{ width: '16px', height: '16px' }} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {headers.map((key) => (
                  <th key={key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#374151', minWidth: key === '_id' ? '200px' : '150px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '600' }}>{key}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>{getColumnType(key)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={doc._id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {headers.map((headerKey) => (
                    <td key={`${doc._id}-${headerKey}`} style={{ padding: '12px 16px', textAlign: 'left', color: '#374151' }}>
                      {headerKey === '_id' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Monaco, "Courier New", monospace', fontSize: '12px' }}>
                          <span style={{ color: '#dc2626' }}>ObjectId</span>
                          <span style={{ color: '#1e293b' }}>("{doc[headerKey]}")</span>
                          <button onClick={() => handleCopyId(doc[headerKey])} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                            <Copy style={{ width: '12px', height: '12px' }} />
                          </button>
                        </div>
                      ) : (
                        <span>{formatValue(doc[headerKey])}</span>
                      )}
                    </td>
                  ))}
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
