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
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const campaignIds = location.state?.campaignIds || [];
  const campaignNames = location.state?.campaignNames || [];

  const [client, setClient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [projectId]);

  const fetchInsights = async () => {
    try {
      const clientRes = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        credentials: "include",
      });
      const clientData = await clientRes.json();
      setClient(clientData);

      const allResults = [];

      const campaignPromises = campaignIds.map((id) =>
        fetch(`${API_BASE_URL}/campaigns/gophish/all/${id}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .catch((err) => {
            console.error("Failed to fetch campaign", id, err.message);
            return null;
          })
      );

      const campaigns = await Promise.all(campaignPromises);
      const validResults = campaigns.flat().filter(Boolean);

      setResults(validResults);
    } catch (err) {
      console.error("Failed to load insights:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const csvData = results.map((r) => ({
    "First Name": r.first_name,
    "Last Name": r.last_name,
    Email: r.email,
    Position: r.position,
    Status: r.status,
    Reported: r.reported ? "Yes" : "No",
    "Quiz Started": r.quizStart ? "true" : "false",
    "Quiz Completed": r.quizEnd ? "true" : "false",
    Score: r.score ?? "-",
    "Training Started": r.trainingStart ? "true" : "false",
    "Training Completed": r.trainingEnd ? "true" : "false",
    "Training Tracker": r.trainingTracker ?? "-",
  }));

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              background:
                "linear-gradient(135deg, #fff, #fff) padding-box, linear-gradient(135deg, #ec008c, #ff6a9f) border-box",
              color: "#ec008c",
              border: "2px solid transparent",
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "uppercase",
              px: 3,
              py: 1,
              boxShadow: "0 4px 10px rgba(236, 0, 140, 0.2)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #fdfdfd, #fdfdfd) padding-box, linear-gradient(135deg, #d6007a, #ff478a) border-box",
                boxShadow: "0 6px 12px rgba(236, 0, 140, 0.3)",
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            📈 Insights for Project: {client?.name}
          </Typography>
        </Box>

        <CSVLink
          data={csvData}
          filename={`client-insights-${client?.name?.replace(/\s+/g, "_") || "unknown"}.csv`}
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
            Export CSV
          </Button>
        </CSVLink>
      </Box>

      <Typography variant="h6" fontWeight="bold" mb={2}>
        🧾 Combined Campaign Results{campaignNames.length > 0 ? `: ${campaignNames.join(", ")}` : ""}
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#ffe0ef" }}>
            <TableRow>
              {[
                "First Name",
                "Last Name",
                "Email",
                "Position",
                "Status",
                "Reported",
                "Quiz Started",
                "Quiz Completed",
                "Score",
                "Training Started",
                "Training Completed",
                "Tracker",
              ].map((header, idx) => (
                <TableCell key={idx} sx={{ fontWeight: "bold", color: "#ec008c" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.first_name}</TableCell>
                  <TableCell>{r.last_name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.position}</TableCell>
                  <TableCell>
                    <Chip label={r.status || "—"} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    {r.reported ? (
                      <Chip label="Yes" color="error" size="small" />
                    ) : (
                      <Chip label="No" variant="outlined" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{r.quizStart ? "true" : "false"}</TableCell>
                  <TableCell>{r.quizEnd ? "true" : "false"}</TableCell>
                  <TableCell>{r.score ?? "-"}</TableCell>
                  <TableCell>{r.trainingStart ? "true" : "false"}</TableCell>
                  <TableCell>{r.trainingEnd ? "true" : "false"}</TableCell>
                  <TableCell>{r.trainingTracker ?? "-"}</TableCell>
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
