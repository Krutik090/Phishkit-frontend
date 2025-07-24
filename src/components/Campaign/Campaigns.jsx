import React, { useEffect, useState, useRef } from "react";
import {
  Box, Button, Typography, Paper, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { pink } from "@mui/material/colors";
import { Link } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

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

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
      initializeDataTable();
    }
  }, [data]);

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

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, { credentials: "include" });
      const json = await res.json();

      // Normalize _id to id (optional)
      const normalized = json.map(item => ({
        ...item,
        id: item._id,
      }));

      setData(normalized);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  const handleDeleteConfirm = (campaign) => setDeleteDialog({ open: true, campaign });
  const cancelDelete = () => setDeleteDialog({ open: false, campaign: null });

  const confirmDelete = async () => {
    try {
      const id = deleteDialog.campaign._id;
      const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");

      setData(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    } finally {
      cancelDelete();
    }
  };

  const handleSaveSuccess = async () => {
    try {
      // 🔁 Destroy old DataTable if it exists
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      // 🆕 Fetch updated data
      const res = await fetch(`${API_BASE_URL}/campaigns`, { credentials: "include" });
      const json = await res.json();
      setData(json);

      // 🕒 Reinitialize DataTable after short delay
      setTimeout(() => {
        initializeDataTable();
      }, 100);
    } catch (err) {
      console.error("Failed to refresh campaigns after save:", err);
    } finally {
      setOpenModal(false);
      setFormData(initialFormState());
    }
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
      <Box>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            📢 Campaigns
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setFormData(emptyFormData);
              setOpenModal(true);
            }}
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
            Add Campaign
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
              {["Campaign Name", "Launch Date", "Actions"].map((h, i) => (
                <th key={i} style={{ border: "1px solid #ccc", padding: 10 }}>
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
                {/* <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.client || "—"}</td> */}
                {/* <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.status || "—"}</td> */}
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {row.launchDate ? new Date(row.launchDate).toLocaleString() : "—"}
                </td>
                {/* <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {Array.isArray(row.results) ? row.results.length : 0}
                </td> */}
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  <Tooltip title="View">
                    <IconButton size="small" color="primary" component={Link} to={`/campaign-results/${row._id}`}>
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

        <NewCampaignModal
          open={openModal}
          onClose={() => setOpenModal(false)}
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
      </Box>
    </Box>
  );
};

export default Campaigns;
