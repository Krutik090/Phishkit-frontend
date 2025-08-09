import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Collapse,
  alpha,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  Storage as DatabaseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Storage as StorageIcon,
  Description as DocumentIcon,
  TableRows as IndexIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { advancedToast } from '../../utils/toast';
import SecureIconWithTooltip from './SecureIconWithTooltip';
import axios from 'axios';
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const Database_Collection = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCollection, setOpenCollection] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Collection Name');
  const [secureMode, setSecureMode] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/db/full-db`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      
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
      advancedToast.error(
        'Failed to load database collections. Please try again.',
        'Database Error',
        { icon: '🗄️' }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/db/encryption-status`, {
          withCredentials: true
        });
        if (res.data.success) {
          setSecureMode(res.data.encrypted);
        }
      } catch (err) {
        console.error("Error fetching encryption status", err);
      }
    };

    fetchStatus();
    fetchCollections();
  }, []);

  const handleCardClick = (collectionName, event) => {
    if (event.target.closest('.chevron-area')) {
      event.stopPropagation();
      toggleCollection(collectionName);
      return;
    }
    navigate(`/database/${encodeURIComponent(collectionName)}`);
  };

  const toggleCollection = (name) => {
    setOpenCollection(prev => (prev === name ? null : name));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCollections();
    setIsRefreshing(false);
    advancedToast.success(
      'Database collections refreshed successfully.',
      'Refresh Complete',
      { icon: '🔄' }
    );
  };

  const filteredCollections = collections.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'Collection Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Document Count') return a.documentCount - b.documentCount;
    if (sortBy === 'Storage Size') return parseFloat(a.storageSize) - parseFloat(b.storageSize);
    return 0;
  });

  if (loading) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading collections...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          <Typography variant="h6" gutterBottom>Database Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Custom CSS for DataTables Dark Mode */}
      <style>
        {`
          /* Dark mode styles for DataTables */
          ${darkMode ? `
            .dataTables_wrapper {
              color: #e1e1e1 !important;
            }
            
            .dataTables_wrapper .dataTables_length,
            .dataTables_wrapper .dataTables_filter,
            .dataTables_wrapper .dataTables_info,
            .dataTables_wrapper .dataTables_processing,
            .dataTables_wrapper .dataTables_paginate {
              color: #e1e1e1 !important;
            }
            
            .dataTables_wrapper .dataTables_length label,
            .dataTables_wrapper .dataTables_filter label {
              color: #e1e1e1 !important;
            }
            
            .dataTables_wrapper .dataTables_length select,
            .dataTables_wrapper .dataTables_filter input {
              background-color: rgba(255, 255, 255, 0.1) !important;
              color: #e1e1e1 !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 8px !important;
              padding: 4px 8px !important;
            }
            
            .dataTables_wrapper .dataTables_length select:focus,
            .dataTables_wrapper .dataTables_filter input:focus {
              border-color: #ec008c !important;
              outline: none !important;
            }
            
            .dataTables_wrapper .dataTables_paginate .paginate_button {
              color: #e1e1e1 !important;
              background: rgba(255, 255, 255, 0.1) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 6px !important;
              margin: 0 2px !important;
            }
            
            .dataTables_wrapper .dataTables_paginate .paginate_button:hover {
              background: rgba(236, 0, 140, 0.2) !important;
              border-color: #ec008c !important;
              color: #fff !important;
            }
            
            .dataTables_wrapper .dataTables_paginate .paginate_button.current {
              background: linear-gradient(135deg, #ec008c, #fc6767) !important;
              border-color: #ec008c !important;
              color: #fff !important;
            }
            
            .dataTables_wrapper .dataTables_paginate .paginate_button.disabled {
              color: #666 !important;
              background: rgba(255, 255, 255, 0.05) !important;
              border-color: rgba(255, 255, 255, 0.1) !important;
            }
            
            table.dataTable thead th,
            table.dataTable thead td {
              background-color: rgba(30, 30, 47, 0.9) !important;
              color: #ffffff !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            
            table.dataTable tbody th,
            table.dataTable tbody td {
              background-color: rgba(30, 30, 47, 0.6) !important;
              color: #e1e1e1 !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            
            table.dataTable.stripe tbody tr.odd,
            table.dataTable.display tbody tr.odd {
              background-color: rgba(30, 30, 47, 0.8) !important;
            }
            
            table.dataTable.stripe tbody tr.even,
            table.dataTable.display tbody tr.even {
              background-color: rgba(30, 30, 47, 0.6) !important;
            }
            
            table.dataTable.hover tbody tr:hover,
            table.dataTable.display tbody tr:hover {
              background-color: rgba(236, 0, 140, 0.1) !important;
            }
            
            table.dataTable {
              border-collapse: separate !important;
              border-spacing: 0 !important;
              border-radius: 12px !important;
              overflow: hidden !important;
            }
          ` : ''}
        `}
      </style>

      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: '16px',
          backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.7),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: darkMode ? 'grey.100' : 'grey.900'
            }}
          >
            <DatabaseIcon sx={{ color: darkMode ? 'grey.100' : 'grey.900' }} />
            Database Collections
          </Typography>
          <SecureIconWithTooltip />
        </Box>
        
        <Tooltip title="Refresh Collections">
          <IconButton
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{
              backgroundColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.05),
              '&:hover': {
                backgroundColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.1),
              },
            }}
          >
            <RefreshIcon sx={{ 
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Controls Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          backgroundColor: darkMode ? alpha('#1e1e2f', 0.5) : alpha('#ffffff', 0.5),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          {/* Search */}
          <TextField
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                borderRadius: '12px',
                color: darkMode ? '#e1e1e1' : '#333',
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#ccc' : '#666',
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: darkMode ? '#999' : '#666',
                opacity: 1,
              },
            }}
          />

          {/* View Mode Toggle */}
          <Box display="flex" sx={{ backgroundColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.05), borderRadius: '12px', p: 0.5 }}>
            <IconButton
              onClick={() => setViewMode('grid')}
              size="small"
              sx={{
                backgroundColor: viewMode === 'grid' ? '#ec008c' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : (darkMode ? '#ccc' : '#666'),
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: viewMode === 'grid' ? '#d6007a' : alpha('#ec008c', 0.1),
                }
              }}
            >
              <GridIcon />
            </IconButton>
            <IconButton
              onClick={() => setViewMode('list')}
              size="small"
              sx={{
                backgroundColor: viewMode === 'list' ? '#ec008c' : 'transparent',
                color: viewMode === 'list' ? '#fff' : (darkMode ? '#ccc' : '#666'),
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: viewMode === 'list' ? '#d6007a' : alpha('#ec008c', 0.1),
                }
              }}
            >
              <ListIcon />
            </IconButton>
          </Box>

          {/* Sort Dropdown */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: darkMode ? '#ccc' : '#666' }}>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                borderRadius: '12px',
                backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                color: darkMode ? '#e1e1e1' : '#333',
                '& .MuiSelect-icon': {
                  color: darkMode ? '#ccc' : '#666',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ec008c',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                    color: darkMode ? '#e1e1e1' : '#333',
                    '& .MuiMenuItem-root': {
                      color: darkMode ? '#e1e1e1' : '#333',
                      '&:hover': {
                        backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                      },
                      '&.Mui-selected': {
                        backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="Collection Name">Collection Name</MenuItem>
              <MenuItem value="Document Count">Document Count</MenuItem>
              <MenuItem value="Storage Size">Storage Size</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Collections Grid/List */}
      {filteredCollections.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '16px',
            backgroundColor: darkMode ? alpha('#1e1e2f', 0.5) : alpha('#ffffff', 0.5),
            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          }}
        >
          <DatabaseIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom color={darkMode ? '#e1e1e1' : '#333'}>
            No collections found
          </Typography>
          <Typography color="text.secondary">
            Try adjusting your search term or refresh the page.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredCollections.map((col) => (
            <Grid 
              item 
              xs={12} 
              sm={viewMode === 'list' ? 12 : 6} 
              md={viewMode === 'list' ? 12 : 4} 
              lg={viewMode === 'list' ? 12 : 3}
              key={col.name}
            >
              <Card
                onClick={(e) => handleCardClick(col.name, e)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  backgroundColor: darkMode ? alpha('#1e1e2f', 0.8) : alpha('#ffffff', 0.8),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: darkMode ? '0 8px 32px rgba(236, 0, 140, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    borderColor: darkMode ? alpha('#ec008c', 0.5) : alpha('#ec008c', 0.3),
                  }
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #ec008c, #fc6767)',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="#fff">
                    {col.name}
                  </Typography>
                  <IconButton
                    className="chevron-area"
                    size="small"
                    sx={{ color: '#fff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollection(col.name);
                    }}
                  >
                    {openCollection === col.name ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <DocumentIcon sx={{ fontSize: 16, color: '#ec008c' }} />
                        <Typography variant="caption" color="text.secondary">
                          DOCUMENTS
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color={darkMode ? '#e1e1e1' : '#333'}>
                        {col.documentCount.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <StorageIcon sx={{ fontSize: 16, color: '#fc6767' }} />
                        <Typography variant="caption" color="text.secondary">
                          SIZE
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color={darkMode ? '#e1e1e1' : '#333'}>
                        {col.storageSize}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80' }} />
                        <Typography variant="caption" color="text.secondary">
                          AVG. DOC
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500" color={darkMode ? '#ccc' : '#555'}>
                        {col.avgDocumentSize}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IndexIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                        <Typography variant="caption" color="text.secondary">
                          INDEXES
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500" color={darkMode ? '#ccc' : '#555'}>
                        {col.indexes}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={2} pt={2} borderTop={`1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Index Size
                      </Typography>
                      <Typography variant="body2" fontWeight="500" color={darkMode ? '#ccc' : '#555'}>
                        {col.totalIndexSize}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Collapse in={openCollection === col.name}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: darkMode ? alpha('#000', 0.2) : alpha('#000', 0.02),
                      borderTop: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color={darkMode ? '#e1e1e1' : '#333'}>
                      Additional Details
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {[
                        { label: 'Total Documents:', value: col.documentCount.toLocaleString() },
                        { label: 'Storage Size:', value: col.storageSize },
                        { label: 'Average Document Size:', value: col.avgDocumentSize },
                        { label: 'Number of Indexes:', value: col.indexes },
                        { label: 'Total Index Size:', value: col.totalIndexSize }
                      ].map((item, index) => (
                        <Box key={index} display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography variant="body2" color={darkMode ? '#ccc' : '#555'}>
                            {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Database_Collection;
