import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Helper Components ---
const InfoRow = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight="500">{value}</Typography>
  </Box>
);

const ModuleStatus = ({ label, completed }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    {completed ? (
      <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />
    ) : (
      <Chip icon={<CancelIcon />} label="Pending" variant="outlined" size="small" />
    )}
  </Box>
);

const CampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaignName, setCampaignName] = useState("");
  const [enrichedData, setEnrichedData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchEnrichedCampaignData();
  }, [campaignId]);

  useEffect(() => {
    if (enrichedData.length > 0) {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        dataTableRef.current.destroy();
      }
      dataTableRef.current = $(tableRef.current).DataTable({
        destroy: true,
        responsive: true,
        pageLength: 10,
        lengthChange: true,
      });
    }
  }, [enrichedData]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const fetchEnrichedCampaignData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/gophish/all/${campaignId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setEnrichedData(data);
        setCampaignName(data[0].campaignName || "Campaign Details");
      } else {
        setEnrichedData([]);
        setCampaignName("Campaign Details");
      }
    } catch (err) {
      toast.error("Failed to fetch campaign details.");
      console.error(err);
    }
  };

  const handleOpenQuizModal = (user) => {
    setSelectedUser(user);
    setQuizModalOpen(true);
  };

  const handleOpenTrainingModal = (user) => {
    setSelectedUser(user);
    setTrainingModalOpen(true);
  };

  const csvData = enrichedData.map(row => ({
    ...row,
    Reported: row.reported ? "Yes" : "No",
    "Quiz Started": row.quizStart ? "Yes" : "No",
    "Quiz Start Time": formatDateTime(row.quizStartTime),
    "Quiz Ended": row.quizEnd ? "Yes" : "No",
    "Quiz End Time": formatDateTime(row.quizCompletionTime),
    "Training Started": row.trainingStart ? "Yes" : "No",
    "Training Start Time": formatDateTime(row.trainingStartTime),
    "Training Ended": row.trainingEnd ? "Yes" : "No",
    "Training End Time": formatDateTime(row.trainingEndTime),
  }));

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            📨 {campaignName}
          </Typography>
        </Box>
        {enrichedData.length > 0 && (
          <CSVLink data={csvData} filename={`campaign_${campaignId}_results.csv`} style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="success">Export to CSV</Button>
          </CSVLink>
        )}
      </Box>

      <div className="table-responsive">
        <table ref={tableRef} className="display stripe" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", border: "1px solid #ddd" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>First Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Last Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Email</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Position</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Reported</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Quiz</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Training</th>
            </tr>
          </thead>
          <tbody>
            {enrichedData.map((row, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.first_name}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.last_name}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.email}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.position}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}><Chip label={row.status || "—"} color="primary" size="small" /></td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.reported ? <Chip label="Yes" color="error" size="small" /> : <Chip label="No" variant="outlined" size="small" />}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  <Tooltip title="View Quiz Details">
                    <IconButton size="small" onClick={() => handleOpenQuizModal(row)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  <Tooltip title="View Training Details">
                    <IconButton size="small" onClick={() => handleOpenTrainingModal(row)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quiz Details Modal */}
      {selectedUser && (
        <Dialog open={quizModalOpen} onClose={() => setQuizModalOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle fontWeight="bold">Quiz Details for {selectedUser.first_name}</DialogTitle>
          <DialogContent dividers>
            <InfoRow label="Quiz Started" value={selectedUser.quizStarted ? "Yes" : "No"} />
            <InfoRow label="Start Time" value={formatDateTime(selectedUser.quizStartTime)} />
            <Divider />
            <InfoRow label="Quiz Ended" value={selectedUser.quizCompleted ? "Yes" : "No"} />
            <InfoRow label="End Time" value={formatDateTime(selectedUser.quizEndTime)} />
            <Divider />
            <InfoRow label="Score" value={selectedUser.score ?? "—"} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuizModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Training Details Modal */}
      {selectedUser && (
        <Dialog open={trainingModalOpen} onClose={() => setTrainingModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle fontWeight="bold">Training Details for {selectedUser.first_name}</DialogTitle>
          <DialogContent dividers>
            <InfoRow label="Training Started" value={selectedUser.trainingStarted ? "Yes" : "No"} />
            <InfoRow label="Start Time" value={formatDateTime(selectedUser.trainingStartTime)} />
            <Divider sx={{ my: 1 }} />
            <InfoRow label="Training Ended" value={selectedUser.trainingCompleted ? "Yes" : "No"} />
            <InfoRow label="End Time" value={formatDateTime(selectedUser.trainingEndTime)} />
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" mt={2} mb={1}>Module Progress</Typography>
            <ModuleStatus label="Module 1: Phishing Awareness" completed={selectedUser.trainingTracker >= 1} />
            <ModuleStatus label="Module 2: Password Hygiene" completed={selectedUser.trainingTracker >= 2} />
            <ModuleStatus label="Module 3: Spot the Phish Game" completed={selectedUser.trainingTracker >= 3} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTrainingModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CampaignDetails;
