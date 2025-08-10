import React, { useEffect, useState, useRef } from "react";
import {
  Box, Paper, Button, Typography, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, alpha
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CloneIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast"; // Import advanced toast
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import dayjs from "dayjs";
import NewCampaignModal from "./NewCampaignModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const emptyFormData = {
  id: null,
  name: "",
  template: "",
  landingPage: "",
  url: "",
  schedule: "",
  sendingProfile: "",
  groups: [],
  quiz: "",
  client: "",
};

const Campaigns = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const isReadOnly = user?.isReadOnly || false;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      
      const json = await res.json();
      const normalized = json.map(item => ({ ...item, id: item._id }));

      // Destroy old DataTable before updating data
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      setData(normalized);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      advancedToast.error(
        "Failed to load campaigns. Please try again.",
        "Load Failed",
        { icon: "📢" }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.length > 0 && !dataTableRef.current) {
      dataTableRef.current = $(tableRef.current).DataTable({
        destroy: true,
        responsive: true,
        pageLength: 10,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
      });
    }
  }, [data]);

  const handleAddCampaign = () => {
    if (isReadOnly) {
      advancedToast.warning(
        "You don't have permission to create campaigns.",
        "Access Denied",
        { icon: "🔒" }
      );
      return;
    }
    setFormData(emptyFormData);
    setOpenModal(true);
  };

  const handleCloneCampaign = async (campaign) => {
    if (isReadOnly) {
      advancedToast.warning(
        "You don't have permission to clone campaigns.",
        "Access Denied",
        { icon: "🔒" }
      );
      return;
    }

    try {
      const loadingId = advancedToast.info(
        `Preparing to clone "${campaign.name}"...`,
        "Cloning Campaign",
        { icon: "⏳", autoClose: false }
      );

      const res = await fetch(`${API_BASE_URL}/campaigns/${campaign._id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaign details.");
      
      const details = await res.json();

      advancedToast.dismissById(loadingId);

      const clonedFormData = {
        name: `${details.name} - Clone`,
        template: details.templateName || "",
        landingPage: details.landingPageName || "",
        url: details.url || "",
        schedule: dayjs().add(2, "minute"),
        sendingProfile: details.smtpName || "",
        group: details.groupNames || [],
        project: details.projectId?._id || "",
        quiz: null,
      };

      setFormData(clonedFormData);
      setOpenModal(true);

      advancedToast.success(
        "Campaign data loaded for cloning.",
        "Ready to Clone",
        { icon: "📋" }
      );
    } catch (err) {
      console.error("Clone failed:", err);
      advancedToast.error(
        err.message || "Could not prepare the cloned campaign.",
        "Clone Failed",
        { icon: "❌" }
      );
    }
  };

  const handleDeleteConfirm = (campaign) => {
    if (isReadOnly) {
      advancedToast.warning(
        "You don't have permission to delete campaigns.",
        "Access Denied",
        { icon: "🔒" }
      );
      return;
    }
    setDeleteDialog({ open: true, campaign });
  };

  const cancelDelete = () => setDeleteDialog({ open: false, campaign: null });

  const confirmDelete = async () => {
    if (!deleteDialog.campaign) return;
    
    try {
      const id = deleteDialog.campaign._id;
      const loadingId = advancedToast.info(
        `Deleting "${deleteDialog.campaign.name}"...`,
        "Processing",
        { icon: "⏳", autoClose: false }
      );

      const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      advancedToast.dismissById(loadingId);

      if (!res.ok) throw new Error("Delete failed");

      advancedToast.success(
        `Campaign "${deleteDialog.campaign.name}" deleted successfully!`,
        "Campaign Deleted",
        { icon: "🗑️" }
      );
      
      fetchCampaigns();
    } catch (err) {
      advancedToast.error(
        "Failed to delete campaign. Please try again.",
        "Delete Failed",
        { icon: "❌" }
      );
    } finally {
      cancelDelete();
    }
  };

  const handleSaveSuccess = () => {
    setOpenModal(false);
    setFormData(emptyFormData);
    fetchCampaigns();
    advancedToast.success(
      "Campaign saved successfully!",
      "Campaign Created",
      { icon: "🎉" }
    );
  };

  useEffect(() => {
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, []);

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
              background-color: #0f0f1a !important;
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
          <CampaignIcon sx={{ color: darkMode ? 'grey.100' : 'grey.900' }} />
          Campaigns
        </Typography>
        {!isReadOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCampaign}
            sx={{
              background: `linear-gradient(135deg, #ec008c, #fc6767)`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              py: 1,
            }}
          >
            Add Campaign
          </Button>
        )}
      </Paper>

      {/* Table Wrapper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          backgroundColor: darkMode ? alpha('#1e1e2f', 0.8) : alpha('#ffffff', 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <table
          ref={tableRef}
          className="display stripe"
          style={{
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
            border: "none",
            backgroundColor: "transparent",
            color: darkMode ? "#e1e1e1" : "#333",
          }}
        >
          <thead>
            <tr>
              {["Campaign Name", "Launch Date", "Launched By", "Actions"].map((h, i) => (
                <th key={i} style={{ 
                  border: "none", 
                  padding: 16, 
                  textAlign: "center",
                  backgroundColor: darkMode ? '#0f0f1a' : '#f5f5f5',
                  color: darkMode ? '#ffffff' : '#222',
                  fontWeight: 'bold'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row._id} style={{
                borderBottom: darkMode
                  ? `1px solid ${alpha('#fff', 0.08)}`
                  : `1px solid ${alpha('#000', 0.08)}`,
              }}>
                <td style={{ border: "none", padding: 12 }}>
                  <Link 
                    to={`/campaign-results/${row._id}`} 
                    style={{ 
                      color: '#ec008c', 
                      fontWeight: "bold", 
                      textDecoration: "none",
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {row.name}
                  </Link>
                </td>
                <td style={{ border: "none", padding: 12, color: darkMode ? '#ccc' : '#555' }}>
                  {row.launchDate ? new Date(row.launchDate).toLocaleString() : "—"}
                </td>
                <td style={{ border: "none", padding: 12, color: darkMode ? '#ccc' : '#555' }}>
                  {row.launchedBy?.name || "—"}
                </td>
                <td style={{ border: "none", padding: 12 }}>
                  <Tooltip title="View Campaign">
                    <IconButton 
                      size="small" 
                      component={Link} 
                      to={`/campaign-results/${row._id}`}
                      sx={{ 
                        color: '#ec008c',
                        '&:hover': { backgroundColor: alpha('#ec008c', 0.1) }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {!isReadOnly && (
                    <>
                      <Tooltip title="Clone Campaign">
                        <IconButton 
                          size="small" 
                          onClick={() => handleCloneCampaign(row)}
                          sx={{ 
                            ml: 1,
                            color: '#4ade80',
                            '&:hover': { backgroundColor: alpha('#4ade80', 0.1) }
                          }}
                        >
                          <CloneIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Campaign">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteConfirm(row)}
                          sx={{
                            ml: 1,
                            color: '#fff',
                            backgroundColor: '#f44336',
                            '&:hover': {
                              backgroundColor: '#d32f2f',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>

      {/* New Campaign Modal */}
      {!isReadOnly && (
        <NewCampaignModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSave={handleSaveSuccess}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={cancelDelete}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            backgroundColor: darkMode ? alpha('#1e1e2f', 0.95) : alpha('#ffffff', 0.95),
            backdropFilter: 'blur(12px)',
          }
        }}
      >
        <DialogTitle sx={{ color: darkMode ? '#e1e1e1' : '#333' }}>
          🗑️ Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: darkMode ? '#ccc' : '#666' }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: darkMode ? '#e1e1e1' : '#333' }}>
              {deleteDialog.campaign?.name}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={cancelDelete}
            sx={{ 
              color: darkMode ? '#ccc' : '#666',
              '&:hover': { backgroundColor: alpha('#ccc', 0.1) }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: '8px' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Campaigns;
