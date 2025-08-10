import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Divider,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Quiz as QuizIcon,
  School as TrainingIcon,
  Person as PersonIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";
import { CSVLink } from "react-csv";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Enhanced Helper Components with Dark Mode Support
const InfoRow = ({ label, value, darkMode }) => (
  <Box 
    display="flex" 
    justifyContent="space-between" 
    alignItems="center" 
    py={1.5}
    sx={{
      borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
      '&:last-child': {
        borderBottom: 'none',
      },
    }}
  >
    <Typography 
      variant="body2" 
      sx={{ 
        color: darkMode ? '#ccc' : 'text.secondary',
        fontWeight: 'medium',
      }}
    >
      {label}
    </Typography>
    <Typography 
      variant="body2" 
      fontWeight="600"
      sx={{ 
        color: darkMode ? '#e1e1e1' : '#333',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const ModuleStatus = ({ label, completed, darkMode }) => (
  <Box 
    display="flex" 
    justifyContent="space-between" 
    alignItems="center" 
    py={1.5}
    sx={{
      borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
      '&:last-child': {
        borderBottom: 'none',
      },
    }}
  >
    <Typography 
      variant="body2" 
      sx={{ 
        color: darkMode ? '#ccc' : 'text.secondary',
        fontWeight: 'medium',
      }}
    >
      {label}
    </Typography>
    {completed ? (
      <Chip 
        icon={<CheckCircleIcon />} 
        label="Completed" 
        sx={{
          backgroundColor: alpha('#4caf50', 0.1),
          color: '#4caf50',
          border: `1px solid ${alpha('#4caf50', 0.3)}`,
          fontWeight: 'medium',
        }}
        size="small" 
      />
    ) : (
      <Chip 
        icon={<CancelIcon />} 
        label="Pending" 
        sx={{
          backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
          color: darkMode ? '#ccc' : '#666',
          border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
          fontWeight: 'medium',
        }}
        size="small" 
      />
    )}
  </Box>
);

const ClientInsights = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  
  const campaignIds = location.state?.campaignIds || [];
  const campaignNames = location.state?.campaignNames || [];

  const [clientName, setClientName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [projectId]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const loadingId = advancedToast.info(
        "Loading project insights...",
        "Loading Data",
        { icon: "📊", autoClose: false }
      );

      const clientRes = await fetch(`${API_BASE_URL}/projects/${projectId}`, { 
        credentials: "include" 
      });
      
      if (!clientRes.ok) throw new Error("Failed to fetch project details");
      
      const clientData = await clientRes.json();
      setClientName(clientData.name || "Project");

      if (campaignIds.length === 0) {
        setResults([]);
        advancedToast.dismissById(loadingId);
        advancedToast.info(
          "No campaigns selected for insights analysis.",
          "No Campaigns",
          { icon: "📭" }
        );
        return;
      }

      const campaignLoadingId = advancedToast.info(
        `Analyzing ${campaignIds.length} campaigns...`,
        "Analyzing Campaigns",
        { icon: "⏳", autoClose: false }
      );

      const campaignPromises = campaignIds.map((id) =>
        fetch(`${API_BASE_URL}/campaigns/gophish/all/${id}`, { 
          credentials: "include" 
        })
          .then((res) => res.json())
          .catch((err) => {
            console.error(`Failed to fetch campaign ${id}:`, err.message);
            return [];
          })
      );

      const campaignsResults = await Promise.all(campaignPromises);
      const flattenedResults = campaignsResults.flat().filter(Boolean);
      setResults(flattenedResults);

      advancedToast.dismissById(loadingId);
      advancedToast.dismissById(campaignLoadingId);
      
      advancedToast.success(
        `Loaded insights for ${flattenedResults.length} participants across ${campaignIds.length} campaigns!`,
        "Insights Loaded",
        { icon: "✅" }
      );

    } catch (err) {
      advancedToast.error(
        "Failed to load project insights. Please try again.",
        "Load Failed",
        { icon: "❌" }
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuizModal = (user) => {
    setSelectedUser(user);
    setQuizModalOpen(true);
    
    advancedToast.info(
      `Opening quiz details for ${user.first_name}...`,
      "Quiz Details",
      { icon: "📝" }
    );
  };

  const handleOpenTrainingModal = (user) => {
    setSelectedUser(user);
    setTrainingModalOpen(true);
    
    advancedToast.info(
      `Opening training details for ${user.first_name}...`,
      "Training Details",
      { icon: "🎓" }
    );
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'Email Sent': { color: '#2196f3', label: 'Email Sent' },
      'Email Opened': { color: '#ff9800', label: 'Email Opened' },
      'Clicked Link': { color: '#f44336', label: 'Clicked Link' },
      'Submitted Data': { color: '#9c27b0', label: 'Submitted Data' },
      'Email Reported': { color: '#4caf50', label: 'Email Reported' },
    };

    const config = statusConfig[status] || { color: '#757575', label: status || '—' };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: alpha(config.color, 0.1),
          color: config.color,
          border: `1px solid ${alpha(config.color, 0.3)}`,
          fontWeight: 'medium',
        }}
      />
    );
  };

  // ✅ DataGrid columns definition
  const columns = [
    {
      field: 'first_name',
      headerName: 'First Name',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" sx={{ color: '#ec008c' }} />
          {params.value || '—'}
        </Box>
      ),
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      minWidth: 120,
      flex: 0.8,
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon fontSize="small" sx={{ color: '#2196f3' }} />
          {params.value || '—'}
        </Box>
      ),
    },
    {
      field: 'position',
      headerName: 'Position',
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'reported',
      headerName: 'Reported',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Chip 
            label="Yes" 
            sx={{
              backgroundColor: alpha('#f44336', 0.1),
              color: '#f44336',
              border: `1px solid ${alpha('#f44336', 0.3)}`,
              fontWeight: 'medium',
            }}
            size="small" 
          />
        ) : (
          <Chip 
            label="No" 
            sx={{
              backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
              color: darkMode ? '#ccc' : '#666',
              border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
              fontWeight: 'medium',
            }}
            size="small" 
          />
        )
      ),
    },
    {
      field: 'quiz',
      headerName: 'Quiz',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Quiz Details">
          <IconButton 
            size="small" 
            onClick={() => handleOpenQuizModal(params.row)}
            sx={{
              color: '#ec008c',
              '&:hover': {
                backgroundColor: alpha('#ec008c', 0.1),
              },
            }}
          >
            <QuizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'training',
      headerName: 'Training',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Training Details">
          <IconButton 
            size="small" 
            onClick={() => handleOpenTrainingModal(params.row)}
            sx={{
              color: '#6a11cb',
              '&:hover': {
                backgroundColor: alpha('#6a11cb', 0.1),
              },
            }}
          >
            <TrainingIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // ✅ Transform data for DataGrid
  const rows = results.map((item, index) => ({
    id: index,
    ...item,
  }));

  const csvData = results.map(row => ({
    "First Name": row.first_name,
    "Last Name": row.last_name,
    "Email": row.email,
    "Position": row.position,
    "Status": row.status,
    "Reported": row.reported ? "Yes" : "No",
    "Quiz Started": row.quizStart ? "Yes" : "No",
    "Quiz Start Time": formatDateTime(row.quizStartTime),
    "Quiz Ended": row.quizEnd ? "Yes" : "No",
    "Quiz End Time": formatDateTime(row.quizCompletionTime),
    "Score": row.score,
    "Training Started": row.trainingStart ? "Yes" : "No",
    "Training Start Time": formatDateTime(row.trainingStartTime),
    "Training Ended": row.trainingEnd ? "Yes" : "No",
    "Training End Time": formatDateTime(row.trainingEndTime),
    "Training Tracker": row.trainingTracker,
  }));

  return (
    <>
      {/* ✅ Custom Scrollbar Styling for DataGrid */}
      <style jsx global>{`
        .MuiDataGrid-virtualScroller::-webkit-scrollbar,
        .MuiDataGrid-main::-webkit-scrollbar,
        .MuiDataGrid-virtualScrollerContent::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .MuiDataGrid-virtualScroller::-webkit-scrollbar-track,
        .MuiDataGrid-main::-webkit-scrollbar-track,
        .MuiDataGrid-virtualScrollerContent::-webkit-scrollbar-track {
          background: ${darkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'
          };
          border-radius: 4px;
        }
        
        .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb,
        .MuiDataGrid-main::-webkit-scrollbar-thumb,
        .MuiDataGrid-virtualScrollerContent::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ec008c, #fc6767);
          border-radius: 4px;
          border: 1px solid ${darkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'
          };
        }
        
        .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover,
        .MuiDataGrid-main::-webkit-scrollbar-thumb:hover,
        .MuiDataGrid-virtualScrollerContent::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #d6007a, #e55555);
          box-shadow: 0 2px 8px rgba(236, 0, 140, 0.3);
        }
        
        .MuiDataGrid-virtualScroller::-webkit-scrollbar-corner,
        .MuiDataGrid-main::-webkit-scrollbar-corner,
        .MuiDataGrid-virtualScrollerContent::-webkit-scrollbar-corner {
          background: ${darkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'
          };
        }
      `}</style>

      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* ✅ Enhanced Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2,
            borderRadius: '16px',
            backgroundColor: darkMode ? alpha('#1e1e2f', 0.8) : alpha('#ffffff', 0.9),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(236, 0, 140, 0.1)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(236, 0, 140, 0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                color: darkMode ? '#e1e1e1' : '#333',
                backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: alpha('#ec008c', 0.1),
                  color: '#ec008c',
                  borderColor: '#ec008c',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box>
              <Typography 
                variant="h5" 
                fontWeight="bold"
                sx={{ 
                  color: darkMode ? '#e1e1e1' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 0.5,
                }}
              >
                <InsightsIcon sx={{ color: '#ec008c' }} />
                Project Insights
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? '#ccc' : '#666',
                }}
              >
                {clientName} • {results.length} participant{results.length !== 1 ? 's' : ''} • {campaignIds.length} campaign{campaignIds.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {results.length > 0 && (
            <CSVLink 
              data={csvData} 
              filename={`project_${clientName}_insights.csv`} 
              style={{ textDecoration: 'none' }}
            >
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #388e3c, #4caf50)',
                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                  },
                }}
              >
                Export CSV
              </Button>
            </CSVLink>
          )}
        </Paper>

        {/* ✅ DataGrid Container with Dynamic Height */}
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: '16px',
              background: darkMode 
                ? alpha("#1a1a2e", 0.6) 
                : alpha("#ffffff", 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              textAlign: 'center',
            }}
          >
            <CircularProgress 
              sx={{ mb: 3, color: '#ec008c' }} 
              size={48} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: darkMode ? '#ccc' : '#666',
                mb: 1,
              }}
            >
              Loading project insights...
            </Typography>
          </Paper>
        ) : results.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: '16px',
              background: darkMode 
                ? alpha("#1a1a2e", 0.6) 
                : alpha("#ffffff", 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: darkMode ? '#e1e1e1' : '#333',
                mb: 2,
                fontWeight: 'bold',
              }}
            >
              No Insights Data Found
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: darkMode ? '#ccc' : '#666',
                mb: 3,
              }}
            >
              No campaigns were selected or no participant data is available for analysis.
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.6) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `2px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.12)}`,
              boxShadow: darkMode 
                ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(236, 0, 140, 0.15)' 
                : '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(236, 0, 140, 0.1)',
            }}
          >
            {/* ✅ Dynamic Height DataGrid Container */}
            <Box sx={{ width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                autoHeight // ✅ Dynamic height based on content
                pagination
                paginationModel={{ pageSize: 10, page: 0 }}
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
                slots={{
                  toolbar: GridToolbar,
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                sx={{
                  '--DataGrid-containerBackground': darkMode ? '#1a1a2e' : '#ffffff',
                  backgroundColor: 'var(--DataGrid-containerBackground)',
                  border: 'none',
                  borderRadius: '16px',
                  color: darkMode ? 'grey.300' : 'grey.800',
                  overflow: 'hidden',
                  minHeight: 300, // ✅ Minimum height for consistent appearance
                  
                  // ✅ FIXED: Column Headers with Proper Dark Mode Colors
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: darkMode 
                      ? '#1a1a2e !important'
                      : '#f5f5f5 !important',
                    borderBottom: `2px solid #ec008c`,
                    borderRadius: '16px 16px 0 0',
                  },
                  
                  // ✅ FIXED: Individual Column Header Styling
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: darkMode 
                      ? '#1a1a2e !important'
                      : '#f5f5f5 !important',
                    '&:first-of-type': {
                      borderTopLeftRadius: '16px',
                    },
                    '&:last-of-type': {
                      borderTopRightRadius: '16px',
                    },
                  },
                  
                  // ✅ FIXED: Column Header Title Text Color
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 'bold',
                    color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                    fontSize: '0.95rem',
                  },
                  
                  // ✅ FIXED: Header Icons Color
                  '& .MuiDataGrid-iconButton, & .MuiDataGrid-menuIcon': { 
                    color: darkMode ? '#e1e1e1 !important' : '#666 !important'
                  },
                  
                  // ✅ FIXED: Sort Icon Color
                  '& .MuiDataGrid-sortIcon': {
                    color: darkMode ? '#e1e1e1 !important' : '#666 !important',
                  },
                  
                  // ✅ Cell Styling
                  '& .MuiDataGrid-cell': { 
                    borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                    borderRight: `1px solid ${darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                    color: darkMode ? '#e1e1e1' : '#333',
                    '&:last-child': {
                      borderRight: 'none',
                    },
                  },
                  
                  // ✅ Row Styling
                  '& .MuiDataGrid-row': {
                    backgroundColor: darkMode ? 'transparent' : '#fff',
                    '&:hover': { 
                      backgroundColor: darkMode 
                        ? alpha('#ec008c', 0.08) 
                        : alpha('#ec008c', 0.04),
                      cursor: 'pointer',
                    },
                    '&:last-child .MuiDataGrid-cell': {
                      borderBottom: 'none',
                    },
                  },
                  
                  // ✅ Footer Styling
                  '& .MuiDataGrid-footerContainer': { 
                    borderTop: `2px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
                    backgroundColor: darkMode 
                      ? alpha('#1a1a2e', 0.8) 
                      : alpha('#fafafa', 0.9),
                    borderRadius: '0 0 16px 16px',
                  },
                  '& .MuiTablePagination-root, & .MuiIconButton-root': { 
                    color: darkMode ? 'grey.300' : 'grey.800' 
                  },
                  
                  // ✅ FIXED: Toolbar Styling
                  '& .MuiDataGrid-toolbarContainer': {
                    backgroundColor: darkMode 
                      ? alpha('#1a1a2e', 0.8) + ' !important'
                      : alpha('#f5f5f5', 0.9) + ' !important',
                    borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                  },
                  '& .MuiInputBase-input': {
                    color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                  },
                  '& .MuiSvgIcon-root': {
                    color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                  },
                  
                  // ✅ Loading Overlay
                  '& .MuiDataGrid-overlay': { 
                    color: darkMode ? 'grey.300' : 'grey.800', 
                    backgroundColor: darkMode 
                      ? alpha('#1e1e2f', 0.8) 
                      : alpha('#ffffff', 0.8),
                    backdropFilter: 'blur(8px)',
                  },
                }}
              />
            </Box>
          </Paper>
        )}

        {/* ✅ Enhanced Quiz Details Modal */}
        {selectedUser && (
          <Dialog 
            open={quizModalOpen} 
            onClose={() => setQuizModalOpen(false)} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
              sx: {
                borderRadius: '20px',
                background: darkMode 
                  ? alpha("#1a1a2e", 0.95) 
                  : alpha("#ffffff", 0.95),
                backdropFilter: 'blur(16px)',
                border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <DialogTitle 
              sx={{
                fontWeight: 'bold',
                color: darkMode ? '#e1e1e1' : '#333',
                background: `linear-gradient(135deg, ${alpha('#ec008c', 0.1)}, ${alpha('#fc6767', 0.05)})`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              }}
            >
              <QuizIcon sx={{ color: '#ec008c' }} />
              Quiz Details for {selectedUser.first_name}
            </DialogTitle>
            <DialogContent 
              dividers
              sx={{
                backgroundColor: darkMode 
                  ? alpha('#1a1a2e', 0.3) 
                  : alpha('#f8f9fa', 0.5),
              }}
            >
              <InfoRow 
                label="Quiz Started" 
                value={selectedUser.quizStarted ? "Yes" : "No"} 
                darkMode={darkMode}
              />
              <InfoRow 
                label="Start Time" 
                value={formatDateTime(selectedUser.quizStartTime)} 
                darkMode={darkMode}
              />
              <InfoRow 
                label="Quiz Ended" 
                value={selectedUser.quizCompleted ? "Yes" : "No"} 
                darkMode={darkMode}
              />
              <InfoRow 
                label="End Time" 
                value={formatDateTime(selectedUser.quizEndTime)} 
                darkMode={darkMode}
              />
              <InfoRow 
                label="Score" 
                value={selectedUser.score ?? "—"} 
                darkMode={darkMode}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setQuizModalOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  color: darkMode ? '#ccc' : '#666',
                  borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* ✅ Enhanced Training Details Modal */}
        {selectedUser && (
          <Dialog 
            open={trainingModalOpen} 
            onClose={() => setTrainingModalOpen(false)} 
            fullWidth 
            maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: '20px',
                background: darkMode 
                  ? alpha("#1a1a2e", 0.95) 
                  : alpha("#ffffff", 0.95),
                backdropFilter: 'blur(16px)',
                border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <DialogTitle 
              sx={{
                fontWeight: 'bold',
                color: darkMode ? '#e1e1e1' : '#333',
                background: `linear-gradient(135deg, ${alpha('#6a11cb', 0.1)}, ${alpha('#2575fc', 0.05)})`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              }}
            >
              <TrainingIcon sx={{ color: '#6a11cb' }} />
              Training Details for {selectedUser.first_name}
            </DialogTitle>
            <DialogContent 
              dividers
              sx={{
                backgroundColor: darkMode 
                  ? alpha('#1a1a2e', 0.3) 
                  : alpha('#f8f9fa', 0.5),
              }}
            >
              <InfoRow 
                label="Training Started" 
                value={selectedUser.trainingStarted ? "Yes" : "No"} 
                darkMode={darkMode}
              />
              <InfoRow 
                label="Start Time" 
                value={formatDateTime(selectedUser.trainingStartTime)} 
                darkMode={darkMode}
              />
              <InfoRow 
                label="Training Ended" 
                value={selectedUser.trainingCompleted ? "Yes" : "No"} 
                darkMode={darkMode}
              />
              <InfoRow 
                label="End Time" 
                value={formatDateTime(selectedUser.trainingEndTime)} 
                darkMode={darkMode}
              />
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  color: darkMode ? '#e1e1e1' : '#333',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                🎯 Module Progress
              </Typography>
              
              <ModuleStatus 
                label="Module 1: Phishing Awareness" 
                completed={selectedUser.trainingTracker >= 1} 
                darkMode={darkMode}
              />
              <ModuleStatus 
                label="Module 2: Password Hygiene" 
                completed={selectedUser.trainingTracker >= 2} 
                darkMode={darkMode}
              />
              <ModuleStatus 
                label="Module 3: Spot the Phish Game" 
                completed={selectedUser.trainingTracker >= 3} 
                darkMode={darkMode}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setTrainingModalOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  color: darkMode ? '#ccc' : '#666',
                  borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </>
  );
};

export default ClientInsights;
