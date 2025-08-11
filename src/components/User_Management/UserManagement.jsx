import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  alpha,
  Paper,
  Avatar
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";
import NewUserModel from "./NewUserModel";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const { darkMode } = useTheme();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/users-under-admin`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user list");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      advancedToast.error(
        "Could not load the user list. Please try again later.",
        "Load Failed", { icon: "❌" }
      );
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = () => {
    fetchUsers();
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.user) return;
    const { _id, name } = deleteDialog.user;
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/${_id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== _id));
      advancedToast.success(`User "${name}" deleted successfully.`, "User Removed", { icon: "🗑️" });
    } catch (err) {
      advancedToast.error(err.message || "An error occurred while deleting the user.", "Delete Failed", { icon: "❌" });
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleReadOnlyToggle = async (user) => {
    const newStatus = !user.isReadOnly;
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/${user._id}/readonly`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isReadOnly: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchUsers();
      advancedToast.success(`Read-only ${newStatus ? "enabled" : "disabled"} for ${user.name}.`, "Status Updated", { icon: newStatus ? "🔒" : "✏️" });
    } catch (err) {
      advancedToast.error("Could not update read-only status. Please try again.", "Update Failed", { icon: "❌" });
    }
  };

  const columns = useMemo(() => [
    {
        field: 'name',
        headerName: 'Name',
        minWidth: 200,
        flex: 1,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                    {params.row.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight="bold">{params.row.name}</Typography>
            </Box>
        )
    },
    { field: 'email', headerName: 'Email', minWidth: 250, flex: 1 },
    {
        field: 'isReadOnly',
        headerName: 'Read-Only',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
            <Tooltip title={params.value ? "Read-Only Enabled" : "Read-Only Disabled"}>
                <Switch
                  checked={!!params.value}
                  onChange={() => handleReadOnlyToggle(params.row)}
                  color="primary"
                />
            </Tooltip>
        ),
    },
    {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        getActions: (params) => [
            <Tooltip title="Edit User" key="edit">
                <IconButton size="small" onClick={() => handleEditUser(params.row)} sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
            <Tooltip title="Delete User" key="delete">
                <IconButton size="small" onClick={() => setDeleteDialog({ open: true, user: params.row })} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
        ],
    },
  ], [darkMode]);

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
            color: darkMode ? 'grey.100' : 'grey.900'
          }}
        >
          <SupervisorAccountIcon /> User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            background: `linear-gradient(135deg, #ec008c, #ff6a9f)`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "12px",
          }}
        >
          Add User
        </Button>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={users.map(u => ({ ...u, id: u._id }))}
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

      <NewUserModel
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSuccess}
        user={selectedUser}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
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
            Are you sure you want to delete <strong>{deleteDialog.user?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
