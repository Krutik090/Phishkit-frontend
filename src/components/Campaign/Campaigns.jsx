import React, { useEffect, useState, useRef } from "react";
import {
  Box, Button, Typography, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CloneIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import dayjs from "dayjs";

import NewCampaignModal from "./NewCampaignModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const emptyFormData = {
  id: null,
  name: "",
  template: "",
  landingPage: "",
  url: "",
  schedule: "",
  sendingProfile: "",
  groups: [],
  quiz: "",
  client: "",
};

const Campaigns = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const { user } = useAuth();
  const isReadOnly = user?.isReadOnly || false;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, { credentials: "include" });
      const json = await res.json();
      const normalized = json.map(item => ({ ...item, id: item._id }));

      // Destroy old DataTable before updating data
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      setData(normalized);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  useEffect(() => {
    if (data.length > 0 && !dataTableRef.current) {
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
    }
  }, [data]);

  const handleAddCampaign = () => {
    if (isReadOnly) return toast.error("You don't have permission to create campaigns.");
    setFormData(emptyFormData);
    setOpenModal(true);
  };

  const handleCloneCampaign = async (campaign) => {
    if (isReadOnly) return toast.error("You don't have permission to clone campaigns.");

    try {
      // toast.info("Fetching campaign data for cloning...");
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaign._id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaign details.");
      const details = await res.json();

      const clonedFormData = {
        name: `${details.name} - Clone`,
        template: details.templateName || "",
        landingPage: details.landingPageName || "",
        url: details.url || "",
        schedule: dayjs().add(2, "minute"),
        sendingProfile: details.smtpName || "",
        group: details.groupNames || [],
        project: details.projectId?._id || "",
        quiz: null,
      };

      setFormData(clonedFormData);
      setOpenModal(true);
    } catch (err) {
      console.error("Clone failed:", err);
      toast.error(err.message || "Could not prepare the cloned campaign.");
    }
  };

  const handleDeleteConfirm = (campaign) => {
    if (isReadOnly) return toast.error("You don't have permission to delete campaigns.");
    setDeleteDialog({ open: true, campaign });
  };

  const cancelDelete = () => setDeleteDialog({ open: false, campaign: null });

  const confirmDelete = async () => {
    try {
      const id = deleteDialog.campaign._id;
      const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");

      toast.success("Campaign deleted successfully!");
      fetchCampaigns();
    } catch (err) {
      toast.error("Delete failed.");
    } finally {
      cancelDelete();
    }
  };

  const handleSaveSuccess = () => {
    setOpenModal(false);
    setFormData(emptyFormData);
    fetchCampaigns();
  };

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
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">📢 Campaigns</Typography>
        {!isReadOnly && (
          <Button
            variant="contained"
            onClick={handleAddCampaign}
            sx={{
              background: `linear-gradient(135deg, ${localStorage.getItem('primaryColor')}, ${localStorage.getItem('secondaryColor')})`,
              color: "#fff", fontWeight: "bold",
              borderRadius: "8px", px: 3, py: 1,
              textTransform: "uppercase",
            }}
          >
            Add Campaign
          </Button>
        )}
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
            {["Campaign Name", "Launch Date", "Launched By", "Actions"].map((h, i) => (
              <th key={i} style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                <Link to={`/campaign-results/${row._id}`} style={{ color: localStorage.getItem('primaryColor'), fontWeight: "bold", textDecoration: "none" }}>
                  {row.name}
                </Link>
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {row.launchDate ? new Date(row.launchDate).toLocaleString() : "—"}
              </td>
              {/* ✅ NEW COLUMN */}
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {row.launchedBy?.name || "—"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                <Tooltip title="View">
                  <IconButton size="small" color="primary" component={Link} to={`/campaign-results/${row._id}`}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                {!isReadOnly && (
                  <>
                    <Tooltip title="Clone Campaign">
                      <IconButton size="small" color="secondary" onClick={() => handleCloneCampaign(row)}>
                        <CloneIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteConfirm(row)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isReadOnly && (
        <NewCampaignModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSave={handleSaveSuccess}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      <Dialog open={deleteDialog.open} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.campaign?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Campaigns;
