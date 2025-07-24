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

const TimelineEvent = ({ event, isLast }) => {
  const getEventColor = (message) => {
    switch (message) {
      case "Campaign Created":
        return "#10b981"; // green
      case "Email Sent":
        return "#10b981"; // green
      case "Email Opened":
        return "#f59e0b"; // yellow
      case "Clicked Link":
        return "#f97316"; // orange
      case "Submitted Data":
        return "#ef4444"; // red
      case "Email Reported":
        return "#6b7280"; // gray
      default:
        return "#6b7280";
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const color = getEventColor(event.message);

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      {/* Timeline dot */}
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: color,
          marginTop: '6px',
          marginRight: 2,
          flexShrink: 0,
          zIndex: 2
        }}
      />

      {/* Timeline line */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: '5px',
            top: '18px',
            width: '2px',
            height: '60px',
            backgroundColor: '#e5e7eb',
            zIndex: 1
          }}
        />
      )}

      {/* Event details */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>
          {formatTime(event.time)}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
          Event: {event.message}
        </Typography>
        {event.email && (
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Email: {event.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const CampaignTimelineGraph = ({ timeline }) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const graphRef = useRef(null); // Ref for the main graph container

  if (!timeline || timeline.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No timeline events available
        </Typography>
      </Box>
    );
  }

  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.time) - new Date(b.time));
  const earliestEventTime = new Date(sortedTimeline[0].time);
  const latestEventTime = new Date(sortedTimeline[sortedTimeline.length - 1].time);

  // Determine the start of the graph's time range (rounded down to the minute of the earliest event)
  const graphStartTime = new Date(earliestEventTime);
  graphStartTime.setSeconds(0);
  graphStartTime.setMilliseconds(0);

  // Determine the end of the graph's time range (rounded up to the minute of the latest event, plus a small buffer)
  const graphEndTime = new Date(latestEventTime);
  if (graphEndTime.getSeconds() > 0 || graphEndTime.getMilliseconds() > 0) {
    graphEndTime.setMinutes(graphEndTime.getMinutes() + 1);
    graphEndTime.setSeconds(0);
    graphEndTime.setMilliseconds(0);
  }
  // Add a small buffer to the end to ensure the last marker has space
  graphEndTime.setSeconds(graphEndTime.getSeconds() + 30); // 30 seconds buffer

  const totalGraphDuration = graphEndTime - graphStartTime;

  const getEventColor = (message) => {
    switch (message) {
      case "Campaign Created":
      case "Email Sent":
        return "#10b981"; // Original Green
      case "Email Opened":
        return "#f59e0b"; // Original Yellow/Amber
      case "Clicked Link":
        return "#f97316"; // Original Orange
      case "Submitted Data":
        return "#ef4444"; // Original Red
      default:
        return "#6b7280"; // Original Gray
    }
  };

  const formatDetailedTime = (timeString) => {
    const date = new Date(timeString);
    // Format to "Wednesday, Jul 23 4:02:45 pm" as per image
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getPositionPercentage = (time) => {
    const timeAsDate = new Date(time);
    if (totalGraphDuration === 0) return 0; // Avoid division by zero
    return ((timeAsDate - graphStartTime) / totalGraphDuration) * 100;
  };

  const handleMouseEnter = (event) => {
    setHoveredEvent(event);
    // Calculate tooltip position relative to the graph container
    if (graphRef.current) {
      const graphRect = graphRef.current.getBoundingClientRect();
      const dotPositionX = graphRect.left + (getPositionPercentage(event.time) / 100) * graphRect.width;
      // Tooltip should appear above the timeline line (which is at '30px' now)
      // We want it to be above the dot, let's say 20px above the dot's center
      const dotCenterY = graphRect.top + 30; // 30px is the vertical center of the main line
      setHoverPosition({
        x: dotPositionX,
        y: dotCenterY,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null);
  };


  const createTimeMarkers = () => {
    const markers = [];
    const currentTime = new Date(graphStartTime);

    while (currentTime <= graphEndTime) {
      const position = getPositionPercentage(currentTime);

      markers.push(
        <Box
          key={currentTime.toISOString()}
          sx={{
            position: 'absolute',
            left: `${position}%`,
            transform: 'translateX(-50%)', // Center the marker over its position
            // Top position relative to its parent container (which is positioned at the bottom of graph)
            top: '10px', // Pushes markers 10px below the dashed line
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              width: '1px',
              height: '8px', // Keep the tick mark height
              backgroundColor: '#d1d5db',
              mx: 'auto',
              mb: 0.5, // Margin-bottom to separate tick from text
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: '9px',
              color: '#6b7280', // Darker gray for time text
              whiteSpace: 'nowrap',
            }}
          >
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false // 24-hour format
            })}
          </Typography>
        </Box>
      );
      currentTime.setMinutes(currentTime.getMinutes() + 1); // Increment by one minute
    }
    return markers;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Timeline Graph */}
      <Box
        ref={graphRef}
        sx={{
          position: 'relative',
          height: '100px', // Adjusted height to accommodate markers below
          mb: 2,
          // Removed padding so dashed line and markers can extend to edge
        }}
      >
        {/* Main Timeline Line (Dashed) */}
        <Box
          sx={{
            position: 'absolute',
            top: '30px', // Main line position (changed from 60px)
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'transparent',
            backgroundImage: 'repeating-linear-gradient(to right, #ccc 0, #ccc 2px, transparent 2px, transparent 6px)',
            backgroundSize: '8px 1px',
            zIndex: 1
          }}
        />

        {/* Event Dots */}
        {sortedTimeline.map((event, index) => {
          const leftPosition = getPositionPercentage(event.time);
          const color = getEventColor(event.message);
          return (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: `${leftPosition}%`,
                top: '30px', // Event dots remain on the main timeline line (changed from 60px)
                transform: 'translate(-50%, -50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: color,
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                zIndex: 3,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.5)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }
              }}
              onMouseEnter={handleMouseEnter} // Pass event directly, not mouseEvent
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {/* Time Markers container - placed below the main line */}
        <Box sx={{
          position: 'absolute',
          top: '50px', // Start this container below the main line (30px + some gap)
          left: 0,
          right: 0,
          height: '50px', // Give it enough height for markers
        }}>
          {createTimeMarkers()}
        </Box>
      </Box>

      {/* Hover Tooltip */}
      {hoveredEvent && hoverPosition && (
        <Box
          sx={{
            position: 'absolute', // Position relative to nearest positioned ancestor (the outer Box of ResultCampaign)
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: 'translate(-50%, -100%) translateY(-15px)', // Adjust transform to lift it above the dot
            backgroundColor: '#fff',
            color: '#333',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 1000,
            pointerEvents: 'none',
            maxWidth: '250px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #ddd',
            '&::after': { // Tooltip pointer
              content: '""',
              position: 'absolute',
              bottom: '-8px', // Position below the tooltip
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '15px', // Size of the triangle
              height: '15px', // Size of the triangle
              backgroundColor: '#fff',
              borderRight: '1px solid #ddd',
              borderBottom: '1px solid #ddd',
              zIndex: -1, // Behind the tooltip content
            }
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: '#333' }}>
            {formatDetailedTime(hoveredEvent.time)}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#555' }}>
            Event: {hoveredEvent.message}
          </Typography>
          {hoveredEvent.email && (
            <Typography variant="caption" sx={{ display: 'block', color: '#555' }}>
              Email: {hoveredEvent.email}
            </Typography>
          )}
        </Box>
      )}

      {/* Legend - unchanged for now, but colors might need tweaking based on image */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
        {['Email Sent', 'Clicked Link', 'Submitted Data'].map((eventType) => (
          <Box key={eventType} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: getEventColor(eventType)
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '11px', color: '#374151' }}>
              {eventType}
            </Typography>
          </Box>
        ))}
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
        case "Email Sent":
          return ["Email Sent", "Clicked Link", "Submitted Data"].includes(r.status);
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

      {/* Campaign Timeline */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 , textAlign: "center" }}>
          Campaign Timeline {/* This heading is outside the graph component */}
        </Typography>

        <Box
          sx={{
            backgroundColor: '#f9fafb',
            borderRadius: 2,
            p: 3,
            border: '1px solid #e5e7eb',
            position: 'relative', // Ensure position for absolute tooltip
          }}
        >
          <CampaignTimelineGraph timeline={campaign.timeline} />
        </Box>
      </Box>

      {/* Progress Circles */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mb: 4, flexWrap: 'wrap' }}>
        <CustomCircularProgress
          value={countByMilestone("Email Sent")}
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
                                ? "#6c757d"
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