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
  Paper,
  alpha
} from "@mui/material";
import { 
    Add as AddIcon, 
    Delete as DeleteIcon, 
    Edit as EditIcon,
    Description as DescriptionIcon
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import NewTemplateModal from "./NewTemplateModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, template: null });
  const { darkMode } = useTheme();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/templates`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      toast.error("Failed to load templates");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = () => {
    fetchTemplates();
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.template) return;
    try {
      const id = deleteDialog.template._id;
      const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchTemplates();
      toast.success("Template deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete template");
    } finally {
      setDeleteDialog({ open: false, template: null });
    }
  };

  const columns = useMemo(() => [
    {
        field: 'name',
        headerName: 'Template Name',
        minWidth: 200,
        flex: 1,
    },
    {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 200, // Increased width for better spacing
        align: 'center',
        headerAlign: 'center',
        getActions: (params) => [
            <Tooltip title="Edit Template" key="edit">
                <IconButton size="small" onClick={() => handleEditTemplate(params.row)} sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
            <Tooltip title="Delete Template" key="delete">
                <IconButton size="small" onClick={() => setDeleteDialog({ open: true, template: params.row })} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
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
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: darkMode ? 'grey.100' : 'grey.900'
          }}
        >
          <DescriptionIcon /> Email Templates
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
          New Template
        </Button>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={templates.map(t => ({ ...t, id: t._id }))}
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
            border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`, // Added border for visibility
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

      <NewTemplateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSuccess}
        templateData={selectedTemplate}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, template: null })}
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
            Are you sure you want to delete <strong>{deleteDialog.template?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, template: null })} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Templates;
