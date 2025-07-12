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

const CampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [results, setResults] = useState([]);
  const [enrichedData, setEnrichedData] = useState([]);

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const loadCampaignDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
      const data = await res.json();
      setCampaign(data);

      if (Array.isArray(data.results)) {
        setResults(data.results);

        // Fetch details for each user based on email
        const enriched = await Promise.all(
          data.results.map(async (r) => {
            try {
              const uRes = await fetch(`${API_BASE_URL}/users/email/${r.email}`);
              const uData = await uRes.json();
              return {
                ...r,
                quizStartTime: uData.quizStartTime,
                quizCompletionTime: uData.quizCompletionTime,
                trainingStartTime: uData.trainingStartTime,
                trainingEndTime: uData.trainingEndTime,
                score: uData.score,
              };
            } catch (err) {
              console.warn(`User details not found for: ${r.email}`);
              return { ...r }; // Return original row if user not found
            }
          })
        );

        setEnrichedData(enriched);
      }
    } catch (err) {
      console.error("Failed to fetch campaign details:", err.message);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3} justifyContent="space-between">
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
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
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            📨 Campaign Details: {campaign?.name || "Loading..."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/campaign/${campaignId}/graphview`)}
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
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          📬 Campaign Results
        </Typography>
        {enrichedData.length > 0 && (
          <CSVLink
            data={enrichedData}
            filename={`campaign_${campaignId}_results.csv`}
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

        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#ffe0ef" }}>
            <TableRow>
              <TableCell><strong>First Name</strong></TableCell>
              <TableCell><strong>Last Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Reported</strong></TableCell>
              <TableCell><strong>Quiz Start</strong></TableCell>
              <TableCell><strong>Quiz End</strong></TableCell>
              <TableCell><strong>Score</strong></TableCell>
              <TableCell><strong>Training Start</strong></TableCell>
              <TableCell><strong>Training End</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrichedData.map((row, idx) => (
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
                <TableCell>{formatTime(row.quizStartTime)}</TableCell>
                <TableCell>{formatTime(row.quizCompletionTime)}</TableCell>
                <TableCell>{row.score ?? "—"}</TableCell>
                <TableCell>{formatTime(row.trainingStartTime)}</TableCell>
                <TableCell>{formatTime(row.trainingEndTime)}</TableCell>
              </TableRow>
            ))}
            {enrichedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CampaignDetails;
