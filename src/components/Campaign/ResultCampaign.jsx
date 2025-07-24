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
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

const API_BASE_URL = import.meta.env.VITE_API_URL;
const pink = localStorage.getItem("secondaryColor") || "#e91e63";

const StatGauge = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, "#e0e0e0"],
        borderWidth: 4,
        borderColor: "#333",
        cutout: "70%",
      },
    ],
  };

  const options = {
    cutout: "70%",
    rotation: -90,
    circumference: 360,
    plugins: {
      tooltip: { enabled: false },
    },
  };

  return (
    <Box width={150} height={150} position="relative" mx="auto">
      <Doughnut data={data} options={options} />
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography variant="h6" fontWeight="bold" color={color}>
          {Math.round(percentage)}%
        </Typography>
        <Typography fontSize="12px" color="#555" textAlign="center">
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const ResultCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/campaigns/${id}/results`, { credentials: "include" })
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
        credentials: "include",
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campaign.");
      }

      alert("Campaign deleted successfully.");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting campaign.");
    }
  };

  const countByMilestone = (milestone) => {
    if (!campaign?.results) return 0;
    return campaign.results.filter((r) => {
      switch (milestone) {
        case "Email Opened":
          return ["Email Opened", "Clicked Link", "Submitted Data"].includes(r.status);
        case "Clicked Link":
          return ["Clicked Link", "Submitted Data"].includes(r.status);
        case "Submitted Data":
          return r.status === "Submitted Data";
        case "Email Reported":
          return r.status === "Email Reported";
        default:
          return false;
      }
    }).length;
  };

  if (!campaign) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const totalSent = campaign.results?.length || 1;

  return (
    <Box px={4} py={3}>
      <Typography variant="h4" fontWeight="bold" color={pink} mb={4}>
        🎯 Results: {campaign.name}
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
        <Button variant="outlined" onClick={() => navigate(-1)}>🔙 Back</Button>
        <Button variant="contained" color="success" onClick={exportToCSV}>Export CSV</Button>
        <Button variant="contained" color="info">Mark Complete</Button>
        <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>🔄 Refresh</Button>
      </Box>

      <Grid container spacing={3} justifyContent="center" mb={5}>
        {[
          { label: "Email Opened", value: countByMilestone("Email Opened") },
          { label: "Clicked Link", value: countByMilestone("Clicked Link") },
          { label: "Submitted Data", value: countByMilestone("Submitted Data") },
          { label: "Email Reported", value: countByMilestone("Email Reported") },
        ].map((stat, i) => (
          <Grid item xs={6} sm={4} md={2.4} key={i}>
            <StatGauge
              label={stat.label}
              value={stat.value}
              total={totalSent}
              color={pink}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight="bold" mb={2}>
        👥 Result Details
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: pink }}>
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
                  <TableCell>{r.reported ? "✅" : "❌"}</TableCell>
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
