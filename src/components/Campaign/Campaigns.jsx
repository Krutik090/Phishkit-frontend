import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
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
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { pink } from "@mui/material/colors";
import CampaignIcon from "@mui/icons-material/Campaign";
import NewCampaignModal from "./NewCampaignModal";
import { useNavigate } from "react-router-dom";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import $ from "jquery";
import "datatables.net";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Campaigns = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(initialFormState());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });
  const [usageData, setUsageData] = useState({ totalLimit: 0, used: 0, remaining: 0 });
  const tableRef = useRef();
  const navigate = useNavigate();

  function initialFormState() {
    return {
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
  }

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const fetchUsageData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/usage`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const json = await res.json();
      setUsageData(json);
    } catch (err) {
      console.error("Failed to fetch usage data:", err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchUsageData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const table = $(tableRef.current).DataTable();
      return () => {
        table.destroy();
      };
    }
  }, [data]);

  const handleDeleteConfirm = (campaign) => {
    setDeleteDialog({ open: true, campaign });
  };

  const confirmDelete = async () => {
    const campaignId = deleteDialog.campaign?.id;
    if (!campaignId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setData((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete campaign.");
    } finally {
      setDeleteDialog({ open: false, campaign: null });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, campaign: null });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData(initialFormState());
  };

  const handleSaveSuccess = () => {
    fetchCampaigns();
    handleCloseModal();
  };

  return (
    <Box p={3}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: "#fff",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <CampaignIcon sx={{ color: pink[500], mr: 1 }} />
            <Typography variant="h5" fontWeight="bold">Campaigns</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData(initialFormState());
              setOpenModal(true);
            }}
            sx={{
              background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              px: 3,
              py: 1.5,
              textTransform: "uppercase",
              boxShadow: "0 4px 10px rgba(236, 0, 140, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #d6007a, #ff478a)",
                boxShadow: "0 6px 12px rgba(236, 0, 140, 0.5)",
              },
            }}
          >
            Add Campaign
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          {[
            { label: "Total Limit", value: usageData.totalLimit, color: "#1976d2", bg: "#e3f2fd" },
            { label: "Used", value: usageData.used, color: "#d32f2f", bg: "#ffebee" },
            { label: "Remaining", value: usageData.remaining, color: "#388e3c", bg: "#e8f5e9" },
          ].map((item, idx) => (
            <Paper
              key={idx}
              elevation={3}
              sx={{
                px: 2,
                py: 1,
                borderLeft: `5px solid ${item.color}`,
                backgroundColor: item.bg,
                borderRadius: 2,
                minWidth: "150px",
                textAlign: "center",
                flex: 1,
              }}
            >
              <Typography variant="h6" fontWeight={600} color="textSecondary">
                {item.label} : {item.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box>
          <table ref={tableRef} className="display" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Client ID</th>
                <th>Status</th>
                <th>Launch Date</th>
                <th>Email Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.client_id ?? "—"}</td>
                  <td>{row.status}</td>
                  <td>{row.launch_date ? new Date(row.launch_date).toLocaleDateString() : "—"}</td>
                  <td>{Array.isArray(row.results) ? row.results.length : 0}</td>
                  <td>
                    <Tooltip title="View">
                      <IconButton size="small" color="primary" onClick={() => navigate(`/campaign-results/${row.id}`)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteConfirm(row)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <NewCampaignModal
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSaveSuccess}
          formData={formData}
          setFormData={setFormData}
        />

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
      </Paper>

    </Box >
  );
};

export default Campaigns;