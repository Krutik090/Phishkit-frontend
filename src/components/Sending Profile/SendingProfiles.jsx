import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  Chip
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import NewSendingProfileModal from "./NewSendingProfileModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SendingProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, profile: null });
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  const isSuperAdmin = useMemo(() => user?.role === 'superadmin', [user]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles`, { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      toast.error("Failed to load sending profiles.");
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const confirmDelete = (profile) => {
    if (!isSuperAdmin) {
      return toast.error("You do not have permission to delete profiles.");
    }
    setDeleteDialog({ open: true, profile: profile });
  };

  const handleDelete = async () => {
    if (!deleteDialog.profile) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles/${deleteDialog.profile.id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to delete profile");
      
      toast.success("Sending profile deleted!");
      fetchProfiles();
    } catch (err) {
      toast.error("Failed to delete profile.");
      console.error(err);
    } finally {
      setDeleteDialog({ open: false, profile: null });
    }
  };

  const handleSaveSuccess = () => {
    fetchProfiles();
    setOpenModal(false);
    setEditingProfile(null);
  };

  const handleOpenModal = (profile = null) => {
    setEditingProfile(profile);
    setOpenModal(true);
  };

  const columns = useMemo(() => [
    { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
    { field: 'from_address', headerName: 'From Address', minWidth: 250, flex: 1 },
    { field: 'host', headerName: 'Host', minWidth: 200, flex: 1 },
    {
        field: 'ignore_cert_errors',
        headerName: 'Ignore Cert Errors',
        width: 180,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
            <Chip 
                label={params.value ? "Yes" : "No"}
                color={params.value ? "warning" : "success"}
                variant="outlined"
                size="small"
            />
        )
    },
    {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        getActions: (params) => isSuperAdmin ? [
            <Tooltip title="Edit Profile" key="edit">
                <IconButton size="small" onClick={() => handleOpenModal(params.row)} sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
            <Tooltip title="Delete Profile" key="delete">
                <IconButton size="small" onClick={() => confirmDelete(params.row)} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
        ] : [
            <Tooltip title="View Profile" key="view">
                <IconButton size="small" onClick={() => handleOpenModal(params.row)}>
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        ],
    }
  ], [darkMode, isSuperAdmin]);

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
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: darkMode ? 'grey.100' : 'grey.900' }}>
          <SendIcon /> Sending Profiles
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal(null)}
            sx={{
              background: `linear-gradient(135deg, #ec008c, #fc6767)`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "12px",
            }}
          >
            New Profile
          </Button>
        )}
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={profiles.map(p => ({...p, id: p._id || p.id}))}
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

      {openModal && (
        <NewSendingProfileModal
          open={openModal}
          handleClose={() => {
            setOpenModal(false);
            setEditingProfile(null);
          }}
          onSave={handleSaveSuccess}
          initialData={editingProfile}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, profile: null })}
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
            Are you sure you want to delete the sending profile <strong>{deleteDialog.profile?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, profile: null })} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Yes, Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendingProfiles;
