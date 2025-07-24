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

const TimelineStep = ({ time, isActive, isCompleted }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="caption" sx={{ color: '#6b7280', mb: 1 }}>
        {time}
      </Typography>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: isCompleted
            ? '#10b981'
            : isActive
            ? '#f59e0b'
            : '#d1d5db'
        }}
      />
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

  // Generate timeline based on campaign data
  const generateTimeline = () => {
    if (!campaign?.results) return [];
    
    const now = new Date();
    const baseTime = new Date(now.getTime() - (15 * 60 * 1000)); // 15 minutes ago
    
    const timeline = [];
    for (let i = 0; i <= 14; i++) {
      const time = new Date(baseTime.getTime() + (i * 60 * 1000));
      const timeStr = time.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      let isCompleted = false;
      let isActive = false;
      
      if (i <= 1) isCompleted = true; // Email sent
      else if (i <= 3 && countByMilestone("Email Opened") > 0) isCompleted = true;
      else if (i <= 5 && countByMilestone("Clicked Link") > 0) isCompleted = true;
      else if (i <= 7 && countByMilestone("Submitted Data") > 0) isCompleted = true;
      else if (i === 8 && countByMilestone("Submitted Data") > 0) isActive = true;
      
      timeline.push({ time: timeStr, isCompleted, isActive });
    }
    
    return timeline;
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
  const timeline = generateTimeline();

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
          {/* <Button 
            variant="contained" 
            color="info"
            sx={{ textTransform: 'none' }}
          >
            ✓ Mark Complete
          </Button> */}
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

      {/* Campaign Timeline */}
      {/* <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: "600", color: '#374151', mb: 3, textAlign: 'center' }}>
          Campaign Timeline
        </Typography>
        
        <Box sx={{ position: 'relative', mb: 6 }}>
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '32px', 
              left: 0, 
              right: 0, 
              height: '2px', 
              backgroundColor: '#d1d5db' 
            }} 
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {timeline.map((step, index) => (
              <TimelineStep
                key={index}
                time={step.time}
                isActive={step.isActive}
                isCompleted={step.isCompleted}
              />
            ))}
          </Box>
        </Box>
      </Box> */}

      {/* Progress Circles */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mb: 4, flexWrap: 'wrap' }}>
        <CustomCircularProgress
          value={totalSent}
          total={totalSent}
          color="#10b981"
          label="Email Sent"
        />
        <CustomCircularProgress
          value={countByMilestone("Email Opened")}
          total={totalSent}
          color="#f59e0b"
          label="Email Opened"
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
        {/* <CustomCircularProgress
          value={countByMilestone("Email Reported")}
          total={totalSent}
          color="#6b7280"
          label="Email Reported"
        /> */}
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
              {/* <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center" }}>Reported</th> */}
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
                              : r.status === "Email Opened"
                                ? "#ffc107"
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
                  {/* <td style={{ padding: 10, border: "1px solid #ddd" }}>{r.reported ? "✅" : "❌"}</td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: 20, border: "1px solid #ddd", textAlign: 'center', color: '#666' }}>
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