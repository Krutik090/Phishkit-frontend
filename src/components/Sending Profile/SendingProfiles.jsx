import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon, // Import view icon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import NewSendingProfileModal from "./NewSendingProfileModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get a cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const SendingProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // State for user role
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    // Check user role from cookies
    try {
      const authUserCookie = getCookie('auth_user');
      if (authUserCookie) {
        const userData = JSON.parse(decodeURIComponent(authUserCookie));
        setIsSuperAdmin(userData.role === 'superadmin');
      }
    } catch (error) {
      console.error("Failed to parse user auth cookie:", error);
      setIsSuperAdmin(false);
    }
    
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (profiles.length > 0) {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        dataTableRef.current.destroy();
      }
      initializeDataTable();
    }
  }, [profiles]);

  const initializeDataTable = () => {
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

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles`, { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      toast.error("Failed to load sending profiles.");
      console.error(err);
    }
  };

  const confirmDelete = (profile) => {
    if (!isSuperAdmin) {
      toast.error("You do not have permission to delete profiles.");
      return;
    }
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles/${profileToDelete.id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to delete profile");
      
      toast.success("Sending profile deleted!");
      fetchProfiles(); // Refetch profiles to update the list
    } catch (err) {
      toast.error("Failed to delete profile.");
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleSaveSuccess = () => {
    fetchProfiles(); // Refetch all profiles to ensure data is current
    setOpenModal(false);
    setEditingProfile(null);
  };

  const handleOpenModal = (profile = null) => {
    setEditingProfile(profile);
    setOpenModal(true);
  };

  // Cleanup DataTable on component unmount
  useEffect(() => {
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, []);

  return (
    <Box p={3}>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the sending profile <strong>{profileToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          📧 Sending Profiles
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal(null)}
            sx={{
              background: `linear-gradient(135deg, ${localStorage.getItem('primaryColor')}, ${localStorage.getItem('secondaryColor')})`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          >
            New Profile
          </Button>
        )}
      </Box>

      {/* Table */}
      <div className="table-responsive">
        <table ref={tableRef} className="display stripe" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>From Address</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Host</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Ignore Cert Errors</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>{profile.name}</td>
                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>{profile.from_address}</td>
                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>{profile.host}</td>
                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>{profile.ignore_cert_errors ? "Yes" : "No"}</td>
                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>
                  {isSuperAdmin ? (
                    <>
                      <IconButton size="small" color="secondary" onClick={() => handleOpenModal(profile)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => confirmDelete(profile)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton size="small" onClick={() => handleOpenModal(profile)}>
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <NewSendingProfileModal
          open={openModal}
          handleClose={() => {
            setOpenModal(false);
            setEditingProfile(null);
          }}
          onSave={handleSaveSuccess}
          initialData={editingProfile}
        />
      )}
    </Box>
  );
};

export default SendingProfiles;
