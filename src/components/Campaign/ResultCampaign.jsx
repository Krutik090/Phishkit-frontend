import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const CustomCircularProgress = ({ value, total, color, label }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: 96, height: 96 }}>
        <svg
          style={{ width: 96, height: 96, transform: 'rotate(-90deg)' }}
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease-in-out' }}
          />
        </svg>
        {/* Center text */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
            {value}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
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
  const [loading, setLoading] = useState(true);
  
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const pink = "#e91e63";

  useEffect(() => {
    fetch(`${API_BASE_URL}/campaigns/${id}/results`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching campaign:", err);
        alert("Failed to load campaign results.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (campaign?.results && campaign.results.length > 0) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      setTimeout(() => {
        dataTableRef.current = $(tableRef.current).DataTable({
          destroy: true,
          responsive: true,
          pageLength: 10,
          lengthChange: true,
          searching: true,
          ordering: true,
          info: true,
          autoWidth: false,
        });
      }, 100);
    }
  }, [campaign]);

  useEffect(() => {
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }
    };
  }, []);

  const exportToCSV = () => {
    if (!campaign?.results || campaign.results.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ["First Name", "Last Name", "Email", "Position", "Status"];
    const rows = campaign.results.map((r) => [
      r.first_name,
      r.last_name,
      r.email,
      r.position || "",
      r.status,
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
        case "Scheduled":
          return ["Scheduled", "Email Sent", "Clicked Link", "Submitted Data"].includes(r.status);
        case "Clicked Link":
          return ["Clicked Link", "Submitted Data"].includes(r.status);
        case "Submitted Data":
          return r.status === "Submitted Data";
        default:
          return false;
      }
    }).length;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <Typography variant="h6" color="text.secondary">Campaign not found</Typography>
      </Box>
    );
  }

  const totalSent = campaign.results?.length || 1;

  return (
    <Box sx={{ px: 4, py: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: pink, mb: 4 }}>
          🎯 Results for {campaign.name}
        </Typography>
        
        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            sx={{ textTransform: 'none' }}
          >
            🔙 Back
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={exportToCSV}
            sx={{ textTransform: 'none' }}
          >
            📊 Export CSV
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDelete}
            sx={{ textTransform: 'none' }}
          >
            🗑 Delete
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ textTransform: 'none' }}
          >
            🔄 Refresh
          </Button>
        </Box>
      </Box>

      {/* Progress Circles - Removed Email Reported */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mb: 4, flexWrap: 'wrap' }}>
        <CustomCircularProgress
          value={countByMilestone("Scheduled")}
          total={totalSent}
          color="#6366f1"
          label="Scheduled"
        />
        <CustomCircularProgress
          value={totalSent}
          total={totalSent}
          color="#10b981"
          label="Email Sent"
        />
        <CustomCircularProgress
          value={countByMilestone("Clicked Link")}
          total={totalSent}
          color="#f97316"
          label="Clicked Link"
        />
        <CustomCircularProgress
          value={countByMilestone("Submitted Data")}
          total={totalSent}
          color="#ef4444"
          label="Submitted Data"
        />
      </Box>

      {/* Results Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          👥 Result Details
        </Typography>

        <table
          ref={tableRef}
          className="display stripe"
          style={{
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>First Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Last Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Email</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Position</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaign.results?.length > 0 ? (
              campaign.results.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: 10, border: "1px solid #ddd" }}>{r.first_name}</td>
                  <td style={{ padding: 10, border: "1px solid #ddd" }}>{r.last_name}</td>
                  <td style={{ padding: 10, border: "1px solid #ddd" }}>{r.email}</td>
                  <td style={{ padding: 10, border: "1px solid #ddd" }}>{r.position || "—"}</td>
                  <td style={{ padding: 10, border: "1px solid #ddd" }}>
                    <span
                      style={{
                        backgroundColor:
                          r.status === "Submitted Data"
                            ? "#dc3545"
                            : r.status === "Clicked Link"
                              ? "#fd7e14"
                              : r.status === "Scheduled"
                                ? "#6366f1"
                                : "#6c757d",
                        color: "#fff",
                        fontWeight: "bold",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        display: "inline-block",
                        minWidth: "100px",
                        textAlign: "center",
                        fontSize: "12px"
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: 20, border: "1px solid #ddd", textAlign: 'center', color: '#666' }}>
                  No results yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default ResultCampaign;