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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import NewGroupModal from "./NewGroupModal";
import LdapConfigDialog from "../LDAP/Ldap";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const UsersGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [ldapDialogOpen, setLdapDialogOpen] = useState(false);
  const { darkMode } = useTheme();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/groups`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      toast.error("Failed to load groups.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/groups/${groupToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to delete group");
      toast.success("Group deleted successfully!");
      fetchGroups();
    } catch (err) {
      console.error("Failed to delete group:", err);
      toast.error(err.message || "Failed to delete group. Please try again.");
    } finally {
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
    }
  };

  const handleNewGroup = () => {
    setSelectedGroup(null);
    setModalMode("create");
    setOpenModal(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup({ ...group, id: group._id });
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleSaveSuccess = () => {
    fetchGroups();
    setOpenModal(false);
  };

  const columns = useMemo(() => [
    { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
    { 
        field: 'targets', 
        headerName: '# of Members', 
        width: 150, 
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        valueGetter: (value) => value?.length || 0 
    },
    {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        getActions: (params) => [
            <Tooltip title="Edit Group" key="edit">
                <IconButton size="small" onClick={() => handleEditGroup(params.row)} sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
            <Tooltip title="Delete Group" key="delete">
                <IconButton size="small" onClick={() => setGroupToDelete(params.row)} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
        ],
    }
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
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: darkMode ? 'grey.100' : 'grey.900' }}>
          <GroupIcon /> Users & Groups
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setLdapDialogOpen(true)}>
            LDAP Config
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewGroup}
            sx={{
              background: `linear-gradient(135deg, #ec008c, #fc6767)`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "12px",
            }}
          >
            New Group
          </Button>
        </Box>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={groups.map(g => ({ ...g, id: g._id }))}
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

      <NewGroupModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        mode={modalMode}
        groupData={selectedGroup}
        onSave={handleSaveSuccess}
      />
      
      <LdapConfigDialog open={ldapDialogOpen} onClose={() => setLdapDialogOpen(false)} />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
            Are you sure you want to delete the group <strong>{groupToDelete?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={handleDeleteGroup} color="error" variant="contained">Yes, Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersGroups;
