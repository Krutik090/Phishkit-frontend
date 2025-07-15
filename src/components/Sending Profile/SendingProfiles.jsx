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
} from "@mui/icons-material";
import { toast } from "react-toastify";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import NewSendingProfileModal from "./NewSendingProfileModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SendingProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (profiles.length > 0 && !dataTableRef.current) {
      initializeDataTable();
    }
  }, [profiles]);

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

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles`);
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      setProfiles(data);
      
      // Reload DataTable after fetching new data
      setTimeout(() => {
        if (dataTableRef.current) {
          reloadDataTable();
        }
      }, 100);
    } catch (err) {
      toast.error("Failed to load sending profiles.");
      console.error(err);
    }
  };

  const confirmDelete = (profile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles/${profileToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete profile");
      
      // Update state and reload DataTable
      setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id));
      
      // Reload DataTable after state update
      setTimeout(() => {
        if (dataTableRef.current) {
          reloadDataTable();
        }
      }, 100);
      
      toast.success("Sending profile deleted!");
    } catch (err) {
      toast.error("Failed to delete profile.");
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleSaveSuccess = (savedProfile) => {
    if (editingProfile) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === savedProfile.id ? savedProfile : p))
      );
    } else {
      setProfiles((prev) => [...prev, savedProfile]);
    }
    
    // Reload DataTable after state update
    setTimeout(() => {
      if (dataTableRef.current) {
        reloadDataTable();
      }
    }, 100);
    
    setOpenModal(false);
    setEditingProfile(null);
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingProfile(null);
            setOpenModal(true);
          }}
          sx={{
            background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 3,
            py: 1,
            boxShadow: "0 4px 10px rgba(236, 0, 140, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #d6007a, #ff478a)",
            },
          }}
        >
          New Profile
        </Button>
      </Box>

      {/* Table */}
      <div className="table-responsive">
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
              <th style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>From Address</th>
              <th style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>Host</th>
              <th style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>Ignore Cert Errors</th>
              <th style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>{profile.name}</td>
                <td style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>{profile.from_address}</td>
                <td style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>{profile.host}</td>
                <td style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>{profile.ignore_cert_errors ? "Yes" : "No"}</td>
                <td style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}> 
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => {
                      setEditingProfile(profile);
                      setOpenModal(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => confirmDelete(profile)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <NewSendingProfileModal
        open={openModal}
        handleClose={() => {
          setOpenModal(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveSuccess}
        initialData={editingProfile}
      />
    </Box>
  );
};

export default SendingProfiles;