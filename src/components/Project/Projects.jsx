import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Button, Typography, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, alpha, Paper, DialogContentText
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Folder as FolderIcon
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import NewProjectModal from "./NewProjectModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

const Projects = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, { credentials: "include" });
      const data = await response.json();

      await Promise.all(
        data.map(project =>
          fetch(`${API_BASE_URL}/projects/sync-stats/${project._id}`, {
            method: "POST",
            credentials: "include",
          }).catch(err => console.warn(`Failed to sync stats for ${project.name}`, err))
        )
      );

      const finalResponse = await fetch(`${API_BASE_URL}/projects`, { credentials: "include" });
      const updatedProjects = await finalResponse.json();
      setProjects(updatedProjects);

    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUploadCertificate = async (projectId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("certificate", file);

    try {
      await fetch(`${API_BASE_URL}/projects/${projectId}/upload-template`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      toast.success("Template uploaded successfully.");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to upload certificate template.");
    }
  };

  const handlePreview = (path) => {
    setPreviewUrl(`${FILE_BASE_URL}/${path}`);
    setPreviewDialogOpen(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await fetch(`${API_BASE_URL}/projects/${projectToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      toast.success(`Project "${projectToDelete.name}" deleted successfully.`);
      fetchProjects();
    } catch (err) {
      toast.error("Failed to delete project.");
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Project Name',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Link to={`/projects/${params.row.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
          {params.value}
        </Link>
      ),
    },
    { field: 'campaigns', headerName: 'Campaigns', width: 120, type: 'number', valueGetter: (value) => value.length },
    { field: 'emailSent', headerName: 'Sent', width: 100, type: 'number' },
    { field: 'linkClicked', headerName: 'Clicked', width: 100, type: 'number' },
    { field: 'submitted_data', headerName: 'Submitted', width: 120, type: 'number' },
    { field: 'quizCompleted', headerName: 'Quiz Done', width: 120, type: 'number' },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      type: 'dateTime',
      valueGetter: (value) => new Date(value),
    },
    {
      field: 'certificateTemplatePath',
      headerName: 'Certificate',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Tooltip title="View Certificate">
            <IconButton size="small" onClick={() => handlePreview(params.value)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="caption" sx={{ color: darkMode ? 'grey.500' : 'grey.600' }}>N/A</Typography>
        )
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
        <Tooltip title="Upload Certificate" key="upload">
          <IconButton size="small" component="label" sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
            <UploadFileIcon fontSize="small" />
            <input
              hidden
              type="file"
              accept=".ppt,.pptx,.pdf"
              onChange={(e) => handleUploadCertificate(params.id, e.target.files[0])}
            />
          </IconButton>
        </Tooltip>,
        <Tooltip title="Delete Project" key="delete">
          <IconButton size="small" onClick={() => handleDeleteClick(params.row)} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
      ],
    },
  ], [user, darkMode]);

  const visibleColumns = useMemo(() => {
    if (user?.role === "admin" || user?.role === "superadmin") {
      return columns;
    }
    return columns.filter(col => col.field !== 'actions');
  }, [columns, user]);

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
          <FolderIcon /> Projects
        </Typography>
        {(user?.role === "admin" || user?.role === "superadmin") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{
              background: `linear-gradient(135deg, #ec008c, #fc6767)`,
              color: "#fff", fontWeight: "bold", borderRadius: "12px",
            }}
          >
            Add Project
          </Button>
        )}
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={projects.map(p => ({ ...p, id: p._id }))}
          columns={visibleColumns}
          loading={loading}
          autoHeight
          checkboxSelection={false}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
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
            
            // Custom Scrollbar Styling
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
              height: '8px',
            },
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
              background: darkMode ? '#2e2e42' : '#f1f1f1',
              borderRadius: '4px',
            },
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
              background: darkMode ? '#555' : '#888',
              borderRadius: '4px',
            },
            '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
              background: darkMode ? '#777' : '#555',
            },
          }}
        />
      </Box>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshProjects={fetchProjects}
      />
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>📄 Certificate Template Preview</DialogTitle>
        <DialogContent dividers>
          {previewUrl?.toLowerCase().endsWith(".pdf") ? (
            <iframe src={previewUrl} title="PDF Preview" width="100%" height="600px" style={{ border: "none" }} />
          ) : (
            <Typography>Preview not available for this file type. <a href={previewUrl} target="_blank" rel="noopener noreferrer">Download</a></Typography>
          )}
        </DialogContent>
      </Dialog>
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
            Are you sure you want to delete the project <strong>"{projectToDelete?.name}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
