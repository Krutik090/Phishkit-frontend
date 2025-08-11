import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  ArrowBack as ArrowBackIcon,
  Insights as InsightsIcon,
  Campaign as CampaignIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClientCampaign = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [project, setProject] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientAndCampaigns = async () => {
      setLoading(true);
      try {
        const clientRes = await fetch(`${API_BASE_URL}/projects/${projectId}`, { 
          credentials: "include" 
        });
        if (!clientRes.ok) throw new Error("Failed to load project details.");
        const clientData = await clientRes.json();
        setProject(clientData);

        const campaignIds = Array.isArray(clientData.campaigns) ? clientData.campaigns : [];
        if (campaignIds.length === 0) {
          setCampaigns([]);
          return;
        }

        const campaignDetails = await Promise.all(
          campaignIds.map(async (id) => {
            try {
              const res = await fetch(`${API_BASE_URL}/campaigns/gophish/${id}`, { 
                credentials: "include" 
              });
              if (!res.ok) throw new Error(`Fetch failed for campaign ID: ${id}`);
              return await res.json();
            } catch (err) {
              console.error("Campaign fetch error:", err.message);
              return null;
            }
          })
        );

        const validCampaigns = campaignDetails.filter(Boolean).map(c => ({...c, id: c.id || c._id}));
        setCampaigns(validCampaigns);

      } catch (err) {
        console.error("Failed to load client or campaigns:", err);
        advancedToast.error(err.message || "Failed to load data.", "Loading Error");
      } finally {
        setLoading(false);
      }
    };

    fetchClientAndCampaigns();
  }, [projectId]);

  const handleInsightsClick = () => {
    const campaignIds = campaigns.map(c => c.id).filter(Boolean);
    const campaignNames = campaigns.map(c => c.name || "Unnamed Campaign");
    navigate(`/projects/${projectId}/insights`, { state: { campaignIds, campaignNames } });
  };
  
  const getStatusChip = (status) => {
    const statusConfig = {
      'Completed': { color: '#4caf50', icon: <CheckIcon fontSize="small" />, label: 'Completed' },
      'In Progress': { color: '#ff9800', icon: <PlayArrowIcon fontSize="small" />, label: 'In Progress' },
      'Paused': { color: '#9e9e9e', icon: <PauseIcon fontSize="small" />, label: 'Paused' },
      'Failed': { color: '#f44336', icon: <CloseIcon fontSize="small" />, label: 'Failed' },
      'Stopped': { color: '#607d8b', icon: <CloseIcon fontSize="small" />, label: 'Stopped' },
    };
    const config = statusConfig[status] || { color: '#2196f3', icon: <CampaignIcon fontSize="small" />, label: status || 'Unknown' };
    return (
      <Chip
        icon={config.icon}
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

  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Campaign Name',
      minWidth: 250,
      flex: 1,
      renderCell: (params) => (
        <Link 
          to={`/campaign/${params.id}/details`} 
          style={{ 
            textDecoration: 'none', 
            color: '#ec008c', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 0',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = 'underline';
            e.target.style.color = '#d6007a';
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = 'none';
            e.target.style.color = '#ec008c';
          }}
        >
          📧 {params.value}
        </Link>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => getStatusChip(params.row.status)
    },
    {
      field: 'emailsSent',
      headerName: 'Email Statistics',
      width: 220,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const sent = params.row.resultsSummary?.emailsSent || 0;
        const total = params.row.resultsSummary?.totalUsers || 0;
        const failed = params.row.resultsSummary?.failedToSend || 0;
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'medium',
                color: darkMode ? '#e1e1e1' : '#333',
                mb: 0.5,
              }}
            >
              📧 {sent} / {total}
            </Typography>
            {failed > 0 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#f44336',
                  fontWeight: 'medium',
                  backgroundColor: alpha('#f44336', 0.1),
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                }}
              >
                ❌ Failed: {failed}
              </Typography>
            )}
          </Box>
        );
      }
    }
  ], [darkMode]);

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

      <Box p={3}>
        {/* Enhanced Header */}
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
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  color: darkMode ? '#e1e1e1' : '#333',
                  mb: 0.5,
                }}
              >
                <CampaignIcon sx={{ color: '#ec008c' }} />
                Project Campaigns
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? '#ccc' : '#666',
                  ml: 4,
                }}
              >
                {project?.name || "Loading..."} • {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            onClick={handleInsightsClick}
            startIcon={<InsightsIcon />}
            disabled={campaigns.length === 0}
            sx={{
              background: campaigns.length === 0 
                ? (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                : 'linear-gradient(135deg, #6a11cb, #2575fc)',
              color: campaigns.length === 0 
                ? (darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)')
                : '#fff',
              fontWeight: "bold", 
              borderRadius: "12px",
              textTransform: 'none',
              px: 3,
              py: 1,
              border: campaigns.length === 0 
                ? `1px dashed ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`
                : 'none',
              '&:hover:not(:disabled)': {
                background: 'linear-gradient(135deg, #5e0dcf, #1459f5)',
                boxShadow: '0 4px 16px rgba(106, 17, 203, 0.3)',
              },
            }}
          >
            View Insights
          </Button>
        </Paper>

        {/* ✅ FIXED: DataGrid Container with Proper Dark Mode Header */}
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
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={campaigns}
              columns={columns}
              loading={loading}
              autoHeight
              checkboxSelection={false}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
              }}
              pageSizeOptions={[5, 10, 25]}
              sx={{
                '--DataGrid-containerBackground': darkMode ? '#1a1a2e' : '#ffffff',
                backgroundColor: 'var(--DataGrid-containerBackground)',
                border: 'none',
                borderRadius: '16px',
                color: darkMode ? 'grey.300' : 'grey.800',
                overflow: 'hidden',
                
                // ✅ FIXED: Column Headers with Proper Dark Mode Colors
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: darkMode 
                    ? '#1a1a2e !important'  // ✅ FIXED: Dark background
                    : '#f5f5f5 !important', // Light background
                  borderBottom: `2px solid #ec008c`,
                  borderRadius: '16px 16px 0 0',
                },
                
                // ✅ FIXED: Individual Column Header Styling
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: darkMode 
                    ? '#1a1a2e !important'  // ✅ FIXED: Dark background
                    : '#f5f5f5 !important', // Light background
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
                  color: darkMode ? '#e1e1e1 !important' : '#333 !important', // ✅ FIXED: Text color
                  fontSize: '0.95rem',
                },
                
                // ✅ FIXED: Header Icons Color
                '& .MuiDataGrid-iconButton, & .MuiDataGrid-menuIcon': { 
                  color: darkMode ? '#e1e1e1 !important' : '#666 !important' // ✅ FIXED: Icon color
                },
                
                // ✅ FIXED: Sort Icon Color
                '& .MuiDataGrid-sortIcon': {
                  color: darkMode ? '#e1e1e1 !important' : '#666 !important', // ✅ FIXED: Sort icon color
                },
                
                // Cell Styling
                '& .MuiDataGrid-cell': { 
                  borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
                  borderRight: `1px solid ${darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`,
                  color: darkMode ? '#e1e1e1' : '#333', // ✅ Cell text color
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                
                // Row Styling
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
                
                // Footer Styling
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
                
                // Loading Overlay
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
      </Box>
    </>
  );
};

export default ClientCampaign;
