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
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

const ClientInsights = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const campaignIds = location.state?.campaignIds || [];
  const campaignNames = location.state?.campaignNames || [];

  const [clientName, setClientName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchInsights();
  }, [projectId]);

  useEffect(() => {
    if (results.length > 0) {
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
  }, [results]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const clientRes = await fetch(`${API_BASE_URL}/projects/${projectId}`, { credentials: "include" });
      const clientData = await clientRes.json();
      setClientName(clientData.name || "Project");

      if (campaignIds.length === 0) {
        setResults([]);
        return;
      }

      const campaignPromises = campaignIds.map((id) =>
        fetch(`${API_BASE_URL}/campaigns/gophish/all/${id}`, { credentials: "include" })
          .then((res) => res.json())
          .catch((err) => {
            console.error(`Failed to fetch campaign ${id}:`, err.message);
            return []; // Return empty array on error to not break Promise.all
          })
      );

      const campaignsResults = await Promise.all(campaignPromises);
      const flattenedResults = campaignsResults.flat().filter(Boolean);
      setResults(flattenedResults);

    } catch (err) {
      toast.error("Failed to load project insights.");
      console.error(err);
    } finally {
      setLoading(false);
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

  const csvData = results.map(row => ({
    "First Name": row.first_name,
    "Last Name": row.last_name,
    "Email": row.email,
    "Position": row.position,
    "Status": row.status,
    "Reported": row.reported ? "Yes" : "No",
    "Quiz Started": row.quizStart ? "Yes" : "No",
    "Quiz Start Time": formatDateTime(row.quizStartTime),
    "Quiz Ended": row.quizEnd ? "Yes" : "No",
    "Quiz End Time": formatDateTime(row.quizCompletionTime),
    "Score": row.score,
    "Training Started": row.trainingStart ? "Yes" : "No",
    "Training Start Time": formatDateTime(row.trainingStartTime),
    "Training Ended": row.trainingEnd ? "Yes" : "No",
    "Training End Time": formatDateTime(row.trainingEndTime),
    "Training Tracker": row.trainingTracker,
  }));

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            📈 Insights for Project: {clientName}
          </Typography>
        </Box>
        {results.length > 0 && (
          <CSVLink data={csvData} filename={`project_${clientName}_insights.csv`} style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="success">Export to CSV</Button>
          </CSVLink>
        )}
      </Box>

      <div className="table-responsive">
        <table ref={tableRef} className="display stripe" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", border: "1px solid #ddd" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>First Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Last Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Email</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Position</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Reported</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Quiz</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Training</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.first_name}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.last_name}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.email}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.position}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}><Chip label={row.status || "—"} color="primary" size="small" /></td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.reported ? <Chip label="Yes" color="error" size="small" /> : <Chip label="No" variant="outlined" size="small" />}</td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  <Tooltip title="View Quiz Details">
                    <IconButton size="small" onClick={() => handleOpenQuizModal(row)}><VisibilityIcon /></IconButton>
                  </Tooltip>
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  <Tooltip title="View Training Details">
                    <IconButton size="small" onClick={() => handleOpenTrainingModal(row)}><VisibilityIcon /></IconButton>
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
            <InfoRow label="Quiz Started" value={selectedUser.quizStart ? "Yes" : "No"} />
            <InfoRow label="Start Time" value={formatDateTime(selectedUser.quizStartTime)} />
            <Divider />
            <InfoRow label="Quiz Ended" value={selectedUser.quizEnd ? "Yes" : "No"} />
            <InfoRow label="End Time" value={formatDateTime(selectedUser.quizCompletionTime)} />
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
            <InfoRow label="Training Started" value={selectedUser.trainingStart ? "Yes" : "No"} />
            <InfoRow label="Start Time" value={formatDateTime(selectedUser.trainingStartTime)} />
            <Divider sx={{ my: 1 }} />
            <InfoRow label="Training Ended" value={selectedUser.trainingEnd ? "Yes" : "No"} />
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

export default ClientInsights;
