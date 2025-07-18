import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import { toast } from "react-toastify";

import NewSuperAdminModal from "./NewSuperAdminModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const S_Admins = () => {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, superAdmin: null });

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  useEffect(() => {
    if (superAdmins.length > 0) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      setTimeout(() => {
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
      }, 100);
    }
  }, [superAdmins]);

  const fetchSuperAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/admins`, {
        credentials: "include",
      });
      const data = await res.json();
      setSuperAdmins(data);
    } catch (err) {
      console.error("Failed to fetch super admins:", err);
      toast.error("Failed to load super admins");
    }
  };

  const handleOpenModal = () => {
    setSelectedSuperAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditSuperAdmin = (superAdmin) => {
    setSelectedSuperAdmin(superAdmin);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = async () => {
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
      dataTableRef.current = null;
    }
    await fetchSuperAdmins(); // update state, triggers useEffect
    setIsModalOpen(false);
    setSelectedSuperAdmin(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const id = deleteDialog.superAdmin._id;

      const res = await fetch(`${API_BASE_URL}/superadmin/admins/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      await fetchSuperAdmins(); // re-fetch state after delete
      toast.success("Super admin deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete super admin");
    } finally {
      setDeleteDialog({ open: false, superAdmin: null });
    }
  };

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
          👥 Super Admins Management
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          startIcon={<AddIcon />}
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
          New Super Admin
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
            <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Company Name</th>
            <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Credit (Email Limit)</th>
            <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {superAdmins.map((admin) => (
            <tr key={admin._id}>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>{admin.name}</td>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>{admin.email}</td>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>{admin.emailLimit?.toLocaleString() || 'N/A'}</td>
              <td style={{ padding: 10, border: "1px solid #ddd" }}>
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => handleEditSuperAdmin(admin)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => setDeleteDialog({ open: true, superAdmin: admin })}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Super Admin Modal */}
      <NewSuperAdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSuccess}
        superAdminData={selectedSuperAdmin}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, superAdmin: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete super admin <strong>{deleteDialog.superAdmin?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, superAdmin: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default S_Admins;