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
  Switch,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import NewUserModel from "./NewUserModel";
import { useTheme } from "../../context/ThemeContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  const tableRef = useRef(null);
  const dataTable = useRef(null);

  const { darkMode } = useTheme();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (dataTable.current) {
      dataTable.current.destroy();
    }

    if (users.length > 0 && tableRef.current) {
      dataTable.current = $(tableRef.current).DataTable({
        pageLength: 10,
        searching: true,
        ordering: true,
        lengthChange: true,
        destroy: true,
        columnDefs: [
          { targets: [2, 3], orderable: false },
        ],
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/users-under-admin`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

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
    try {
      const id = deleteDialog.user._id;
      const res = await fetch(`${API_BASE_URL}/superadmin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleReadOnlyToggle = async (user) => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/${user._id}/readonly`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isReadOnly: !user.isReadOnly,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle readonly");
      fetchUsers();
    } catch (err) {
      console.error("Failed to update readonly status:", err);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🧑‍💼 User Management
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
        >
          Add User
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
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Read Only</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{user.name}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{user.email}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                <Switch
                  checked={!!user.isReadOnly}
                  onChange={() => handleReadOnlyToggle(user)}
                  color="primary"
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => handleEditUser(user)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, user })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <NewUserModel
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSuccess}
        user={selectedUser}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteDialog.user?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
