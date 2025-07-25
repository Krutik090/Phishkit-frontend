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

  const [enrichedData, setEnrichedData] = useState([]);

  useEffect(() => {
    fetchEnrichedCampaignData();
  }, [campaignId]);

  const formatTime = (value) => {
    if (!value || typeof value !== "string") return "—";
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleTimeString();
  };

  const fetchEnrichedCampaignData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/gophish/all/${campaignId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setEnrichedData(data);
      } else {
        console.error("Unexpected data format:", data);
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
            📨 Campaign Details
          </Typography>
        </Box>

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
              <TableCell><strong>Tracker</strong></TableCell>
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
                  <Chip label={row.status || "—"} color="primary" size="small" />
                </TableCell>
                <TableCell>
                  {row.reported ? (
                    <Chip label="Yes" color="error" size="small" />
                  ) : (
                    <Chip label="No" variant="outlined" size="small" />
                  )}
                </TableCell>

                {/* Updated logic: print true or false */}
                <TableCell>{row.quizStart ? "true" : "false"}</TableCell>
                <TableCell>{row.quizEnd ? "true" : "false"}</TableCell>
                <TableCell>{row.score ?? "—"}</TableCell>
                <TableCell>{row.trainingStart ? "true" : "false"}</TableCell>
                <TableCell>{row.trainingEnd ? "true" : "false"}</TableCell>
                <TableCell>{row.trainingTracker ?? "—"}</TableCell>
              </TableRow>

            ))}
            {enrichedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align="center">
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
