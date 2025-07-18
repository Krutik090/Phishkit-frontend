import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SecureIconWithTooltip from './SecureIconWithTooltip';
import {
  ChevronDown, ChevronRight, RefreshCw, Search, Grid, List, MoreHorizontal, Database, AlertCircle, ShieldCheck
} from 'lucide-react';

const Database_Collection = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCollection, setOpenCollection] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Collection Name');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/db/full-db`, {
        credentials: 'include',
      });
      const result = await response.json();

      if (result.success && result.data) {
        const collectionsData = Object.entries(result.data).map(([name, data]) => ({
          name: name,
          documentCount: data.metadata.count,
          storageSize: data.metadata.storageSize,
          avgDocumentSize: data.metadata.avgObjSize,
          indexes: data.metadata.nIndexes,
          totalIndexSize: data.metadata.totalIndexSize,
          documents: data.documents || []
        }));
        setCollections(collectionsData);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCardClick = (collectionName, event) => {
    // Prevent navigation if clicking on the expand/collapse chevron area
    if (event.target.closest('.chevron-area')) {
      event.stopPropagation();
      toggleCollection(collectionName);
      return;
    }
    // Navigate to the database detail page
    navigate(`/database/${encodeURIComponent(collectionName)}`);
  };

  const toggleCollection = (name) => {
    setOpenCollection(prev => (prev === name ? null : name));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCollections();
    setIsRefreshing(false);
  };

  const filteredCollections = collections.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'Collection Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Document Count') return a.documentCount - b.documentCount;
    if (sortBy === 'Storage Size') return parseFloat(a.storageSize) - parseFloat(b.storageSize);
    return 0;
  });

  const containerStyle = {
    minHeight: '100vh',
    padding: '24px',
  };

  const headerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    gap: '16px'
  };

  const titleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const h1Style = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  };

  const refreshButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '14px'
  };

  const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const searchContainerStyle = {
    position: 'relative'
  };

  const searchInputStyle = {
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    fontSize: '14px'
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    width: '16px',
    height: '16px'
  };

  const viewToggleStyle = {
    display: 'flex',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const viewButtonStyle = (isActive) => ({
    padding: '8px',
    backgroundColor: isActive ? localStorage.getItem("primaryColor") : '#ffffff',
    color: isActive ? '#ffffff' : '#64748b',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const selectStyle = {
    padding: '8px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    fontSize: '14px'
  };

  const gridStyle = {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  const cardHeaderStyle = {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    background: localStorage.getItem("primaryColor"),
    transition: 'all 0.3s ease'
  };

  const cardHeaderContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const cardTitleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const cardTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0
  };

  const chevronAreaStyle = {
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  };

  const cardContentStyle = {
    padding: '16px'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  };

  const statItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const statDotStyle = (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color
  });

  const statContainerStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const statLabelStyle = {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px'
  };

  const statValueStyle = {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '14px'
  };

  const footerStyle = {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const footerLabelStyle = {
    fontSize: '14px',
    color: '#64748b'
  };

  const footerValueStyle = {
    fontWeight: '500',
    color: '#374151'
  };

  const expandedStyle = {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #f1f5f9'
  };

  const expandedTitleStyle = {
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '8px',
    fontSize: '16px'
  };

  const expandedContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '14px'
  };

  const expandedRowStyle = {
    display: 'flex',
    justifyContent: 'space-between'
  };

  const expandedLabelStyle = {
    color: '#64748b'
  };

  const expandedValueStyle = {
    color: '#1e293b'
  };

  const noResultsStyle = {
    textAlign: 'center',
    padding: '64px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const noResultsIconStyle = {
    width: '48px',
    height: '48px',
    color: '#94a3b8',
    margin: '0 auto 16px'
  };

  const noResultsTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px'
  };

  const noResultsTextStyle = {
    color: '#64748b'
  };

  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const errorStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    gap: '16px'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <RefreshCw className="animate-spin" style={{ width: '48px', height: '48px', color: '#3b82f6' }} />
          <p style={{ marginTop: '16px', color: '#64748b' }}>Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <AlertCircle style={{ width: '48px', height: '48px', color: '#ef4444' }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Error Loading Collections</h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={handleRefresh}
              style={{
                ...refreshButtonStyle,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none'
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
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <div style={titleStyle}>
            <Database style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            <h1 style={h1Style}>Database Collections</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              ...refreshButtonStyle,
              opacity: isRefreshing ? 0.5 : 1,
              backgroundColor: isRefreshing ? '#f1f5f9' : '#ffffff'
            }}
            onMouseEnter={(e) => !isRefreshing && (e.target.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => !isRefreshing && (e.target.style.backgroundColor = '#ffffff')}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

        <SecureIconWithTooltip />


        </div>

        <div style={controlsStyle}>
          {/* Search */}
          <div style={searchContainerStyle}>
            <Search style={searchIconStyle} />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          {/* View Mode Toggle */}
          <div style={viewToggleStyle}>
            <button
              onClick={() => setViewMode('list')}
              style={viewButtonStyle(viewMode === 'list')}
            >
              <List style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={viewButtonStyle(viewMode === 'grid')}
            >
              <Grid style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={selectStyle}
          >
            <option value="Collection Name">Collection Name</option>
            <option value="Document Count">Document Count</option>
            <option value="Storage Size">Storage Size</option>
          </select>
        </div>
      </div>

      {/* Collections */}
      {filteredCollections.length === 0 ? (
        <div style={noResultsStyle}>
          <Search style={noResultsIconStyle} />
          <h3 style={noResultsTitleStyle}>No collections found</h3>
          <p style={noResultsTextStyle}>Try adjusting your search term.</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredCollections.map((col) => (
            <div
              key={col.name}
              style={cardStyle}
              onClick={(e) => handleCardClick(col.name, e)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                const header = e.currentTarget.querySelector('.card-header');
                if (header) {
                  header.style.background = localStorage.getItem("primaryColor");
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                const header = e.currentTarget.querySelector('.card-header');
                if (header) {
                  header.style.background = localStorage.getItem("primaryColor");
                }
              }}
            >
              {/* Card Header */}
              <div className="card-header" style={cardHeaderStyle}>
                <div style={cardHeaderContentStyle}>
                  <div style={cardTitleContainerStyle}>
                    <div
                      className="chevron-area"
                      style={chevronAreaStyle}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      {openCollection === col.name ? (
                        <ChevronDown style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                      ) : (
                        <ChevronRight style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                      )}
                    </div>
                    <h3 style={cardTitleStyle}>{col.name}</h3>
                  </div>
                  <MoreHorizontal style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                </div>
              </div>

              {/* Card Content */}
              <div style={cardContentStyle}>
                <div style={statsGridStyle}>
                  <div style={statItemStyle}>
                    <div style={statDotStyle('#10b981')}></div>
                    <div style={statContainerStyle}>
                      <p style={statLabelStyle}>Documents</p>
                      <p style={statValueStyle}>{col.documentCount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div style={statItemStyle}>
                    <div style={statDotStyle('#3b82f6')}></div>
                    <div style={statContainerStyle}>
                      <p style={statLabelStyle}>Size</p>
                      <p style={statValueStyle}>{col.storageSize}</p>
                    </div>
                  </div>

                  <div style={statItemStyle}>
                    <div style={statDotStyle('#8b5cf6')}></div>
                    <div style={statContainerStyle}>
                      <p style={statLabelStyle}>Avg. Doc</p>
                      <p style={statValueStyle}>{col.avgDocumentSize}</p>
                    </div>
                  </div>

                  <div style={statItemStyle}>
                    <div style={statDotStyle('#f59e0b')}></div>
                    <div style={statContainerStyle}>
                      <p style={statLabelStyle}>Indexes</p>
                      <p style={statValueStyle}>{col.indexes}</p>
                    </div>
                  </div>
                </div>

                <div style={footerStyle}>
                  <span style={footerLabelStyle}>Index Size:</span>
                  <span style={footerValueStyle}>{col.totalIndexSize}</span>
                </div>
              </div>

              {/* Expanded Content */}
              {openCollection === col.name && (
                <div style={expandedStyle}>
                  <h4 style={expandedTitleStyle}>Collection Details</h4>
                  <div style={expandedContentStyle}>
                    <div style={expandedRowStyle}>
                      <span style={expandedLabelStyle}>Total Documents:</span>
                      <span style={expandedValueStyle}>{col.documentCount}</span>
                    </div>
                    <div style={expandedRowStyle}>
                      <span style={expandedLabelStyle}>Storage Size:</span>
                      <span style={expandedValueStyle}>{col.storageSize}</span>
                    </div>
                    <div style={expandedRowStyle}>
                      <span style={expandedLabelStyle}>Average Document Size:</span>
                      <span style={expandedValueStyle}>{col.avgDocumentSize}</span>
                    </div>
                    <div style={expandedRowStyle}>
                      <span style={expandedLabelStyle}>Number of Indexes:</span>
                      <span style={expandedValueStyle}>{col.indexes}</span>
                    </div>
                    <div style={expandedRowStyle}>
                      <span style={expandedLabelStyle}>Total Index Size:</span>
                      <span style={expandedValueStyle}>{col.totalIndexSize}</span>
                    </div>
                    <div style={expandedRowStyle}>
                      <span style={expandedLabelStyle}>Status:</span>
                      <span style={{ color: '#10b981', fontWeight: '500' }}>Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Database_Collection;