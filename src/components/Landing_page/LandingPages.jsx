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
  Language as LanguageIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import NewLandingPageModal from "./NewLandingPageModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const LandingPages = () => {
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, page: null });
  const { darkMode } = useTheme();

  const fetchLandingPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/landing-pages`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch landing pages");
      const data = await res.json();
      setLandingPages(data);
    } catch (err) {
      console.error("Failed to fetch landing pages:", err);
      toast.error("Failed to load landing pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const handleOpenModal = () => {
    setEditingPage(null);
    setIsModalOpen(true);
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = () => {
    fetchLandingPages();
    setIsModalOpen(false);
    setEditingPage(null);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.page) return;
    try {
      const id = deleteDialog.page._id;
      const res = await fetch(`${API_BASE_URL}/landing-pages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`"${deleteDialog.page.name}" deleted successfully.`);
      fetchLandingPages();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete landing page.");
    } finally {
      setDeleteDialog({ open: false, page: null });
    }
  };
  
  const columns = useMemo(() => [
    { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
    {
        field: 'capture_credentials',
        headerName: 'Capture Credentials',
        width: 200,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
            <Chip 
                label={params.value ? "Yes" : "No"}
                color={params.value ? "success" : "error"}
                variant="outlined"
                size="small"
            />
        )
    },
    { field: 'redirect_url', headerName: 'Redirect URL', minWidth: 250, flex: 1, valueGetter: (value) => value || '—' },
    {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        getActions: (params) => [
            <Tooltip title="Edit" key="edit">
                <IconButton size="small" onClick={() => handleEditPage(params.row)} sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
            <Tooltip title="Delete" key="delete">
                <IconButton size="small" onClick={() => setDeleteDialog({ open: true, page: params.row })} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
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
        <Typography 
            variant="h5" 
            fontWeight="bold" 
            display="flex" 
            alignItems="center" 
            gap={1.5}
            sx={{ color: darkMode ? 'grey.100' : 'grey.900' }}
        >
          <LanguageIcon sx={{ color: darkMode ? 'grey.100' : 'grey.900' }} /> Landing Pages
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          startIcon={<AddIcon />}
          sx={{
            background: `linear-gradient(135deg, #ec008c, #fc6767)`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "12px",
          }}
        >
          New Landing Page
        </Button>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={landingPages.map(p => ({...p, id: p._id}))}
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

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, page: null })}
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
            Are you sure you want to delete the landing page "<strong>{deleteDialog.page?.name}</strong>"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, page: null })} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <NewLandingPageModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPage(null);
        }}
        onSave={handleSaveSuccess}
        pageToEdit={editingPage}
      />
    </Box>
  );
};

export default LandingPages;
