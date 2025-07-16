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
  Language as LanguageIcon,
} from "@mui/icons-material";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import NewLandingPageModal from "./NewLandingPageModal";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const LandingPages = () => {
  const [landingPages, setLandingPages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, page: null });
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchLandingPages();
  }, []);

  useEffect(() => {
    if (landingPages.length > 0 && !dataTableRef.current) {
      initializeDataTable();
    }
  }, [landingPages]);

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

  const fetchLandingPages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/landing-pages`);
      const data = await res.json();
      setLandingPages(data);
      
      // Reload DataTable after fetching new data
      setTimeout(() => {
        if (dataTableRef.current) {
          reloadDataTable();
        }
      }, 100);
    } catch (err) {
      console.error("Failed to fetch landing pages:", err);
    }
  };

  const handleOpenModal = () => {
    setEditingPage(null);
    setIsModalOpen(true);
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = async (data, mode) => {
    try {
      const url = mode === "edit"
        ? `${API_BASE_URL}/landing-pages/${data.id}`
        : `${API_BASE_URL}/landing-pages`;

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("API call failed");

      // toast.success(
      //   mode === "edit"
      //     ? `✅ "${data.name}" updated successfully.`
      //     : `🎉 "${data.name}" created successfully.`
      // );

      fetchLandingPages();
      setIsModalOpen(false);
      setEditingPage(null);
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("❌ Failed to save landing page.");
    }
  };

  const confirmDelete = async () => {
    try {
      const id = deleteDialog.page.id;
      const res = await fetch(`${API_BASE_URL}/landing-pages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      
      // Update state and reload DataTable
      setLandingPages((prev) => prev.filter((p) => p.id !== id));
      
      // Reload DataTable after state update
      setTimeout(() => {
        if (dataTableRef.current) {
          reloadDataTable();
        }
      }, 100);
      
      toast.success(`"${deleteDialog.page.name}" deleted successfully.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete landing page.");
    } finally {
      setDeleteDialog({ open: false, page: null });
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
        <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <LanguageIcon color="primary" />
          Landing Pages
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 3,
            py: 1,
            textTransform: "uppercase",
          }}
          startIcon={<AddIcon />}
        >
          New Landing Page
        </Button>
      </Box>

      <table
        ref={tableRef}
        className="display stripe"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr>
            {["Name", "Capture Credentials", "Redirect URL", "Actions"].map((h, i) => (
              <th key={i} style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {landingPages.map((page) => (
            <tr key={page.id}>
              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>{page.name}</td>
              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>
                {page.capture_credentials ? "Yes" : "No"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>
                {page.redirect_url || "—"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => handleEditPage(page)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, page })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, page: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the landing page "
            <strong>{deleteDialog.page?.name}</strong>"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, page: null })}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
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