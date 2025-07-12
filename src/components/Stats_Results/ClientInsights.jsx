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
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CSVLink } from "react-csv";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClientInsights = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Access route state
  const campaignNames = location.state?.campaignNames || []; // ✅ Get campaign names

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
            sx={{
              background: "linear-gradient(135deg, #fff, #fff) padding-box, linear-gradient(135deg, #ec008c, #ff6a9f) border-box",
              color: "#ec008c",
              border: "2px solid transparent",
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "uppercase",
              px: 3,
              py: 1,
              boxShadow: "0 4px 10px rgba(236, 0, 140, 0.2)",
              "&:hover": {
                background: "linear-gradient(135deg, #fdfdfd, #fdfdfd) padding-box, linear-gradient(135deg, #d6007a, #ff478a) border-box",
                boxShadow: "0 6px 12px rgba(236, 0, 140, 0.3)",
              },
            }}
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            📈 Insights for Project : {client?.name}
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/client/${clientId}/insights/graphview`)}
            sx={{
              background:
                "linear-gradient(135deg, #fff, #fff) padding-box, linear-gradient(135deg, #00c9ff, #92fe9d) border-box",
              color: "#00c9ff",
              border: "2px solid transparent",
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "uppercase",
              px: 3,
              py: 1,
              boxShadow: "0 4px 10px rgba(0, 201, 255, 0.2)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #fdfdfd, #fdfdfd) padding-box, linear-gradient(135deg, #00a5d4, #77e879) border-box",
                boxShadow: "0 6px 12px rgba(0, 201, 255, 0.3)",
              },
            }}

          >
            Graph View
          </Button>

          <CSVLink
            data={csvData} filename={`client-insights-${client?.name?.replace(/\s+/g, "_") || "unknown"}.csv`}

            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              startIcon={"⬇"}
              sx={{
                background:
                  "linear-gradient(135deg, #fff, #fff) padding-box, linear-gradient(135deg, #00b09b, #96c93d) border-box",
                color: "#00b09b",
                border: "2px solid transparent",
                borderRadius: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                px: 3,
                py: 1,
                boxShadow: "0 4px 10px rgba(0, 176, 155, 0.2)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #fdfdfd, #fdfdfd) padding-box, linear-gradient(135deg, #009688, #8bc34a) border-box",
                  boxShadow: "0 6px 12px rgba(0, 176, 155, 0.3)",
                },
              }}
            >
              Export to CSV
            </Button>
          </CSVLink>

        </Box>
      </Box>

      <Typography variant="h6" fontWeight="bold" mb={2}>
        🧾 Combined Campaign Results{campaignNames.length > 0 ? `: ${campaignNames.join(", ")}` : ""}
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
