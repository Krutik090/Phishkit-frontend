// src/pages/ResultCampaign.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

const ResultCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/campaigns/${id}`)
      .then((res) => res.json())
      .then((data) => setCampaign(data))
      .catch((err) => {
        console.error("Error fetching campaign:", err);
        alert("Failed to load campaign results.");
      });
  }, [id]);

  const countByStatus = (status) => {
    return campaign?.results?.filter((r) => r.status === status)?.length || 0;
  };

  if (!campaign) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Results for {campaign.name}
      </Typography>

      {/* Top Buttons */}
      <Box display="flex" gap={2} mb={3}>
        <Button variant="outlined" onClick={() => navigate(-1)}>🔙 Back</Button>
        <Button variant="contained" color="success">Export CSV</Button>
        <Button variant="contained" color="info">Complete</Button>
        <Button variant="contained" color="error">Delete</Button>
        <Button variant="outlined" color="primary">Refresh</Button>
      </Box>

      {/* Donut Chart Summary */}
      <Grid container spacing={2} justifyContent="center" mb={4}>
        {[
          { label: "Email Sent", value: campaign.results?.length },
          { label: "Email Opened", value: countByStatus("Email Opened") },
          { label: "Clicked Link", value: countByStatus("Clicked Link") },
          { label: "Submitted Data", value: countByStatus("Submitted Data") },
          { label: "Email Reported", value: countByStatus("Email Reported") },
        ].map((item) => (
          <Grid item xs={6} sm={4} md={2.3} key={item.label}>
            <Box textAlign="center">
              <CircularProgress
                variant="determinate"
                value={100}
                size={80}
                thickness={5}
                sx={{ color: item.value > 0 ? "#ec008c" : "#ccc" }}
              />
              <Typography variant="h6" mt={1}>{item.value}</Typography>
              <Typography variant="caption">{item.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Results Table */}
      <Typography variant="h5" fontWeight="bold" mb={2}>Details</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ background: "#ffe0ef" }}>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reported</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaign.results?.length > 0 ? (
              campaign.results.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.first_name}</TableCell>
                  <TableCell>{r.last_name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.position || "—"}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      color="white"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        backgroundColor:
                          r.status === "Submitted Data"
                            ? "#dc3545"
                            : r.status === "Clicked Link"
                            ? "#fd7e14"
                            : r.status === "Email Opened"
                            ? "#ffc107"
                            : "#6c757d",
                        borderRadius: 1,
                        fontWeight: "bold",
                      }}
                    >
                      {r.status}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.reported ? "✔️" : "❌"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No results yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResultCampaign;
