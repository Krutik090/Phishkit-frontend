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
  DialogActions,
  alpha,
  Link as MuiLink
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Quiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const { darkMode } = useTheme();

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/quizzes`, { withCredentials: true });
      setQuizzes(res.data.map(q => ({...q, id: q._id})));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quizzes.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleOpenDeleteDialog = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/${quizToDelete._id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete quiz.");
      toast.success("Quiz deleted successfully.");
      loadQuizzes();
    } catch (err) {
      toast.error(err.message || "Error deleting quiz.");
    } finally {
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const columns = useMemo(() => [
    { field: 'title', headerName: 'Quiz Title', minWidth: 200, flex: 1 },
    { field: 'description', headerName: 'Description', minWidth: 300, flex: 2 },
    { 
        field: 'questions', 
        headerName: 'Questions', 
        width: 130, 
        type: 'number', 
        align: 'center',
        headerAlign: 'center',
        valueGetter: (value) => value?.length || 0 
    },
    {
        field: 'publicUrl',
        headerName: 'Public URL',
        width: 150,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
            params.value ? (
                <MuiLink href={`/quiz/${params.value}`} target="_blank" rel="noopener noreferrer">
                    Open Link
                </MuiLink>
            ) : "—"
        )
    },
    {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        getActions: (params) => [
            <Tooltip title="Edit" key="edit">
                <IconButton size="small" onClick={() => navigate(`/quizz/edit/${params.id}`)} sx={{ color: darkMode ? '#66bb6a' : '#2e7d32' }}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>,
            <Tooltip title="Delete" key="delete">
                <IconButton size="small" onClick={() => handleOpenDeleteDialog(params.row)} sx={{ color: darkMode ? '#ef5350' : '#d32f2f' }}>
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
          <QuizIcon /> Quizzes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/quizz/new")}
          sx={{
            background: `linear-gradient(135deg, #ec008c, #fc6767)`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "12px",
          }}
        >
          New Quiz
        </Button>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={quizzes}
          columns={columns}
          loading={loading}
          autoHeight
          checkboxSelection={false}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'title', sort: 'asc' }] },
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
          <Typography sx={{ color: darkMode ? 'grey.300' : 'grey.700' }}>
            Are you sure you want to delete <strong>{quizToDelete?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: darkMode ? 'grey.400' : 'grey.600' }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Quiz;
