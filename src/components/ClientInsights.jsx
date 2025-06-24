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

const ClientInsights = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadInsights();
  }, [clientId]);

  const loadInsights = async () => {
    try {
      const clientRes = await fetch(`http://localhost:5000/api/clients/${clientId}`);
      const clientData = await clientRes.json();
      setClient(clientData);

      const allResults = [];

      const campaignPromises = clientData.campaigns.map((id) =>
        fetch(`http://localhost:5000/api/campaigns/${id}`)
          .then((res) => res.json())
          .catch((err) => {
            console.error("Failed to fetch campaign", id, err.message);
            return null;
          })
      );

      const allCampaigns = await Promise.all(campaignPromises);
      const validCampaigns = allCampaigns.filter(Boolean);

      validCampaigns.forEach((campaign) => {
        if (Array.isArray(campaign.results)) {
          campaign.results.forEach((result) => allResults.push(result));
        }
      });

      setResults(allResults);
    } catch (err) {
      console.error("Failed to load insights:", err.message);
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
            📈 Insights for Client: {client?.name}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/client/${clientId}/insights/graphview`)}
        >
          Graph View
        </Button>
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

export default ClientInsights;
