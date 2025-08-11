import React, { useEffect, useState, useMemo } from "react";
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
import { advancedToast } from "../../utils/toast";
import { DataGrid } from '@mui/x-data-grid';
import dayjs from "dayjs";
import NewCampaignModal from "./NewCampaignModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const emptyFormData = {
  id: null, name: "", template: "", landingPage: "", url: "",
  schedule: "", sendingProfile: "", groups: [], quiz: "", client: "",
};

const Campaigns = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const isReadOnly = user?.isReadOnly || false;

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const json = await res.json();
      setData(json.map(item => ({ ...item, id: item._id })));
    } catch (err) {
      advancedToast.error("Failed to load campaigns. Please try again.", "Load Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAddCampaign = () => {
    if (isReadOnly) {
      return advancedToast.warning("You don't have permission to create campaigns.", "Access Denied");
    }
    setFormData(emptyFormData);
    setOpenModal(true);
  };

  const handleCloneCampaign = async (campaign) => {
    if (isReadOnly) {
      return advancedToast.warning("You don't have permission to clone campaigns.", "Access Denied");
    }
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaign._id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaign details.");
      const details = await res.json();
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
      advancedToast.success("Campaign data loaded for cloning.", "Ready to Clone");
    } catch (err) {
      advancedToast.error(err.message || "Could not prepare the cloned campaign.", "Clone Failed");
    }
  };

  const handleDeleteConfirm = (campaign) => {
    if (isReadOnly) {
      return advancedToast.warning("You don't have permission to delete campaigns.", "Access Denied");
    }
    setDeleteDialog({ open: true, campaign });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.campaign) return;
    try {
      const { _id, name } = deleteDialog.campaign;
      const res = await fetch(`${API_BASE_URL}/campaigns/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      advancedToast.success(`Campaign "${name}" deleted successfully!`, "Campaign Deleted");
      fetchCampaigns();
    } catch (err) {
      advancedToast.error("Failed to delete campaign. Please try again.", "Delete Failed");
    } finally {
      setDeleteDialog({ open: false, campaign: null });
    }
  };

  const handleSaveSuccess = () => {
    setOpenModal(false);
    setFormData(emptyFormData);
    fetchCampaigns();
    advancedToast.success("Campaign saved successfully!", "Campaign Created");
  };

  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Campaign Name',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Link to={`/campaign-results/${params.row.id}`} style={{ textDecoration: 'none', color: '#ec008c', fontWeight: 'bold' }}>
          {params.value}
        </Link>
      )
    },
    { 
        field: 'launchDate', 
        headerName: 'Launch Date', 
        width: 200,
        type: 'dateTime',
        valueGetter: (value) => value ? new Date(value) : null,
    },
    { field: 'launchedBy.name', headerName: 'Launched By', width: 180, valueGetter: (value, row) => row.launchedBy?.name || '—' },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      getActions: (params) => [
        <Tooltip title="View Results" key="view">
          <IconButton size="small" component={Link} to={`/campaign-results/${params.id}`}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
        ...(!isReadOnly ? [
          <Tooltip title="Clone Campaign" key="clone">
            <IconButton size="small" onClick={() => handleCloneCampaign(params.row)} sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
              <CloneIcon fontSize="small" />
            </IconButton>
          </Tooltip>,
          <Tooltip title="Delete Campaign" key="delete">
            <IconButton size="small" onClick={() => handleDeleteConfirm(params.row)} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ] : [])
      ]
    }
  ], [darkMode, isReadOnly]);

  return (
    <Box p={3}>
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
            color: darkMode ? 'grey.100' : 'grey.900' // Corrected color
          }}
        >
          <CampaignIcon sx={{ color: darkMode ? 'grey.100' : 'grey.900' }} /> Campaigns
        </Typography>
        {!isReadOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCampaign}
            sx={{
              background: `linear-gradient(135deg, #ec008c, #fc6767)`,
              color: "#fff", fontWeight: "bold", borderRadius: "12px",
            }}
          >
            Add Campaign
          </Button>
        )}
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          autoHeight
          checkboxSelection={false}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'launchDate', sort: 'desc' }] },
          }}
          pageSizeOptions={[5, 10, 25]}
          sx={{
            '--DataGrid-containerBackground': darkMode ? '#1e1e2f' : '#ffffff',
            backgroundColor: 'var(--DataGrid-containerBackground)',
            borderRadius: '16px',
            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            color: darkMode ? 'grey.300' : 'grey.800',
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle': {
              backgroundColor: darkMode ? '#0f0f1a' : '#f5f5f5',
              color: darkMode ? '#ffffff' : '#222',
              borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
            '& .MuiDataGrid-iconButton, & .MuiDataGrid-menuIcon': { color: darkMode ? '#ffffff' : '#666' },
            '& .MuiDataGrid-cell': { borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.08)}` },
            '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`, backgroundColor: darkMode ? '#1a1a2e' : '#fafafa' },
            '& .MuiTablePagination-root, & .MuiIconButton-root': { color: darkMode ? 'grey.300' : 'grey.800' },
            '& .MuiDataGrid-row:hover': { backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05) },
            '& .MuiDataGrid-overlay': { color: darkMode ? 'grey.300' : 'grey.800', backgroundColor: darkMode ? alpha('#1e1e2f', 0.5) : alpha('#ffffff', 0.5) },
            '&.MuiDataGrid-root, & .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders': { border: 'none' },
          }}
        />
      </Box>

      {!isReadOnly && (
        <NewCampaignModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSave={handleSaveSuccess}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, campaign: null })}
        PaperProps={{
            sx: {
                borderRadius: '20px',
                background: darkMode ? alpha("#1a1a2e", 0.9) : alpha("#ffffff", 0.9),
                backdropFilter: 'blur(16px)',
                border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
                color: darkMode ? 'grey.100' : 'grey.800',
            }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>🗑️ Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: darkMode ? 'grey.300' : 'grey.700' }}>
            Are you sure you want to delete <strong>{deleteDialog.campaign?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, campaign: null })} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Campaigns;
