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

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId]);

  const loadCampaignDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
      const data = await res.json();
      setCampaign(data);

      if (Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Failed to fetch campaign details:", err.message);
    }
  };

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
            📨 Campaign Details: {campaign?.name || "Loading..."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/campaign/${campaignId}/graphview`)}
        >
          Graph View
        </Button>
      </Box>

      <Typography variant="h6" fontWeight="bold" mb={2}>
        📬 Campaign Results
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
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((row, idx) => (
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
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
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
