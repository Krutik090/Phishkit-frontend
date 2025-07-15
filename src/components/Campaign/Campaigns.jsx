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

const initialFormState = () => ({
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
});

const Campaigns = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(initialFormState());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (data.length > 0 && !dataTableRef.current) {
      initializeDataTable();
    }
  }, [data]);

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

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`);
      const json = await res.json();
      setData(json);
      
      // Reload DataTable after fetching new data
      setTimeout(() => {
        if (dataTableRef.current) {
          reloadDataTable();
        }
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = (c) => setDeleteDialog({ open: true, campaign: c });
  const cancelDelete = () => setDeleteDialog({ open: false, campaign: null });

  const confirmDelete = async () => {
    try {
      const id = deleteDialog.campaign.id;
      const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      
      // Update state and reload DataTable
      setData(prev => prev.filter(c => c.id !== id));
      
      // Reload DataTable after state update
      setTimeout(() => {
        if (dataTableRef.current) {
          reloadDataTable();
        }
      }, 100);
      
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      cancelDelete();
    }
  };

  const handleSaveSuccess = () => {
    fetchCampaigns();
    setOpenModal(false);
    setFormData(initialFormState());
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
      <Box>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            📢 Campaigns
          </Typography>
          <Button
            variant="contained"
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
              {["Campaign Name", "Client", "Status", "Launch Date", "Sent", "Actions"].map((h, i) => (
                <th key={i} style={{ border: "1px solid #ccc", padding: 10 , textAlign: "center", verticalAlign: "middle"}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={{ border: "1px solid #ddd", padding: 8 , textAlign: "center", verticalAlign: "middle"}}>
                  <Link to={`/campaign-results/${row.id}`} style={{ color: "#ec008c", fontWeight: "bold", textDecoration: "none" }}>
                    {row.name}
                  </Link>
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 , textAlign: "center", verticalAlign: "middle"}}>{row.client || "—"}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 , textAlign: "center", verticalAlign: "middle"}}>{row.status || "—"}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 , textAlign: "center", verticalAlign: "middle"}}>{row.launch_date ? new Date(row.launch_date).toLocaleString() : "—"}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 , textAlign: "center", verticalAlign: "middle"}}>{Array.isArray(row.results) ? row.results.length : 0}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 , textAlign: "center", verticalAlign: "middle"}}>
                  <Tooltip title="View">
                    <IconButton size="small" color="primary" component={Link} to={`/campaign-results/${row.id}`}>
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