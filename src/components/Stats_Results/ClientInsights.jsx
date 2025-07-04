import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CSVLink } from "react-csv";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClientInsights = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [clientId]);

  const loadInsights = async () => {
    try {
      const clientRes = await fetch(`${API_BASE_URL}/clients/${clientId}`);
      const clientData = await clientRes.json();
      setClient(clientData);

      const allResults = [];

      const campaignPromises = clientData.campaigns.map((id) =>
        fetch(`${API_BASE_URL}/campaigns/${id}`)
          .then((res) => res.json())
          .catch((err) => {
            console.error("Failed to fetch campaign", id, err.message);
            return null;
          })
      );

      const allCampaigns = await Promise.all(campaignPromises);
      const validCampaigns = allCampaigns.filter(Boolean);

      for (const campaign of validCampaigns) {
        if (Array.isArray(campaign.results)) {
          for (const result of campaign.results) {
            const enriched = { ...result };

            try {
              const res = await fetch(`${API_BASE_URL}/users/email/${result.email}`);
              if (res.ok) {
                const user = await res.json();
                enriched.quizStartTime = user.quizStartTime;
                enriched.quizCompletionTime = user.quizCompletionTime;
                enriched.trainingStartTime = user.trainingStartTime;
                enriched.trainingEndTime = user.trainingEndTime;
                enriched.score = user.score;
              }
            } catch (err) {
              console.warn(`Failed to fetch user for ${result.email}:`, err.message);
            }

            allResults.push(enriched);
          }
        }
      }

      setResults(allResults);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load insights:", err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString("en-IN") : "-";

  const csvData = results.map((r) => ({
    "First Name": r.first_name,
    "Last Name": r.last_name,
    Email: r.email,
    Position: r.position,
    Status: r.status,
    Reported: r.reported ? "Yes" : "No",
    "Quiz Start": formatDate(r.quizStartTime),
    "Quiz End": formatDate(r.quizCompletionTime),
    Score: r.score ?? "-",
    "Training Start": formatDate(r.trainingStartTime),
    "Training End": formatDate(r.trainingEndTime),
  }));

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3} gap={2} justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            📈 Insights for Client: {client?.name}
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/client/${clientId}/insights/graphview`)}
          >
            Graph View
          </Button>
          <CSVLink data={csvData} filename="client-insights.csv">
            <Button variant="outlined" color="success">Export to CSV</Button>
          </CSVLink>
        </Box>
      </Box>

      <Typography variant="h6" fontWeight="bold" mb={2}>
        🧾 Combined Campaign Results
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#ffe0ef" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>First Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Last Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Position</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Reported</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Quiz Start</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Quiz End</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Score</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Training Start</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#ec008c" }}>Training End</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">Loading...</TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">No results found.</TableCell>
              </TableRow>
            ) : (
              results.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.first_name}</TableCell>
                  <TableCell>{row.last_name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    {row.reported ? (
                      <Chip label="Yes" color="error" size="small" />
                    ) : (
                      <Chip label="No" variant="outlined" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(row.quizStartTime)}</TableCell>
                  <TableCell>{formatDate(row.quizCompletionTime)}</TableCell>
                  <TableCell>{row.score ?? "-"}</TableCell>
                  <TableCell>{formatDate(row.trainingStartTime)}</TableCell>
                  <TableCell>{formatDate(row.trainingEndTime)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClientInsights;
