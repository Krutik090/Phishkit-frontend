import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { pink } from "@mui/material/colors";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import NewTemplateModal from "./NewTemplateModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, template: null });
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (templates.length > 0 && !dataTableRef.current) {
      initializeDataTable();
    }
  }, [templates]);

  const initializeDataTable = () => {
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
    }
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
  };

  const reloadDataTable = () => {
    if (dataTableRef.current) {
      dataTableRef.current.clear();
      dataTableRef.current.rows.add($(tableRef.current).find('tbody tr'));
      dataTableRef.current.draw();
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/templates`, {
        credentials: "include",
      });
      const data = await res.json();
      setTemplates(data);

      setTimeout(() => {
        initializeDataTable();
      }, 100);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      toast.error("Failed to load templates");
    }
  };

  const handleOpenModal = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = () => {
    // Fetch fresh data and reload DataTable
    fetchTemplates();
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };
  const confirmDelete = async () => {
    try {
      const id = deleteDialog.template.id;

      const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete template");

      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");

      setTimeout(() => reloadDataTable(), 100);
    } catch (err) {
      console.error("❌ Delete failed:", err);
      toast.error("Failed to delete template");
    } finally {
      setDeleteDialog({ open: false, template: null });
    }
  };

  // Cleanup DataTable on component unmount
  useEffect(() => {
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }
    };
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          📄 Email Templates
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            background: `linear-gradient(135deg, ${localStorage.getItem('primaryColor')}, ${localStorage.getItem('secondaryColor')})`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 3,
            py: 1,
            textTransform: "uppercase",
          }}
        >
          New Template
        </Button>
      </Box>

      <table
        ref={tableRef}
        className="display stripe"
        style={{
          width: "100%",
          textAlign: "center",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Template Name</th>
            <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template._id}>
              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>{template.name}</td>
              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => handleEditTemplate(template)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => setDeleteDialog({ open: true, template })}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* New/Edit Modal */}
      <NewTemplateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSuccess}
        templateData={selectedTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, template: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.template?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, template: null })}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Templates;