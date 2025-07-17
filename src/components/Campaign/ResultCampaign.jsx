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

const API_BASE_URL = import.meta.env.VITE_API_URL;
const pink = "#ec008c";

const ResultCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  
  useEffect(() => {
    fetch(`${API_BASE_URL}/campaigns/${id}`, {credentials : "include"})
      .then((res) => res.json())
      .then((data) => setCampaign(data))
      .catch((err) => {
        console.error("Error fetching campaign:", err);
        alert("Failed to load campaign results.");
      });
  }, [id]);
  const exportToCSV = () => {
    if (!campaign?.results || campaign.results.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ["First Name", "Last Name", "Email", "Position", "Status", "Reported"];
    const rows = campaign.results.map((r) => [
      r.first_name,
      r.last_name,
      r.email,
      r.position || "",
      r.status,
      r.reported ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${campaign.name.replace(/\s+/g, "_")}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this campaign?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      credentials : "include",
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete campaign.");
    }

    alert("Campaign deleted successfully.");
    navigate("/"); // Or wherever you want to redirect after deletion
  } catch (error) {
    console.error("Delete error:", error);
    alert("Error deleting campaign.");
  }
};

  const countByStatus = (status) =>
    campaign?.results?.filter((r) => r.status === status)?.length || 0;

  if (!campaign) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box px={4} py={3}>
      {/* Page Title */}
      <Typography variant="h4" fontWeight="bold" color={pink} mb={4}>
        🎯 Results: {campaign.name}
      </Typography>

      {/* Action Buttons */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
        <Button variant="outlined" onClick={() => navigate(-1)}>🔙 Back</Button>
        <Button variant="contained" color="success" onClick={exportToCSV}>Export CSV</Button>
        <Button variant="contained" color="info">Mark Complete</Button>
        <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>🔄 Refresh</Button>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} justifyContent="center" mb={5}>
        {[
          { label: "Email Sent", value: campaign.results?.length },
          { label: "Email Opened", value: countByStatus("Email Opened") },
          { label: "Clicked Link", value: countByStatus("Clicked Link") },
          { label: "Submitted Data", value: countByStatus("Submitted Data") },
          { label: "Email Reported", value: countByStatus("Email Reported") },
        ].map((stat, i) => (
          <Grid item xs={6} sm={4} md={2.4} key={i}>
            <Box
              bgcolor="#fff0f7"
              border={`2px solid ${pink}`}
              borderRadius="12px"
              textAlign="center"
              py={3}
              px={2}
              boxShadow="0 4px 12px rgba(0,0,0,0.06)"
            >
              <Typography variant="h5" fontWeight="bold" color={pink}>
                {stat.value}
              </Typography>
              <Typography fontSize="14px" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Table Section */}
      <Typography variant="h5" fontWeight="bold" mb={2}>
        👥 Result Details
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#fdf0f6" }}>
            <TableRow>
              <TableCell><strong>First Name</strong></TableCell>
              <TableCell><strong>Last Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Reported</strong></TableCell>
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
                      sx={{
                        backgroundColor:
                          r.status === "Submitted Data"
                            ? "#dc3545"
                            : r.status === "Clicked Link"
                              ? "#fd7e14"
                              : r.status === "Email Opened"
                                ? "#ffc107"
                                : "#6c757d",
                        color: "#fff",
                        fontWeight: "bold",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        display: "inline-block",
                        minWidth: 100,
                        textAlign: "center",
                      }}
                    >
                      {r.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {r.reported ? "✅" : "❌"}
                  </TableCell>
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
