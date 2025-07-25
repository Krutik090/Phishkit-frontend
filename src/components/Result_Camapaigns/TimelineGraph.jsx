import React, { useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import LaptopIcon from "@mui/icons-material/Laptop";
import BrowserUpdated from "@mui/icons-material/BrowserUpdated";

const TimelineGraph = ({ timeline }) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const graphRef = useRef(null);

  if (!timeline || timeline.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No timeline events available.
        </Typography>
      </Box>
    );
  }

  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.time) - new Date(b.time));
  const earliestEventTime = new Date(sortedTimeline[0].time);
  const latestEventTime = new Date(sortedTimeline[sortedTimeline.length - 1].time);

  const graphStartTime = new Date(earliestEventTime);
  graphStartTime.setSeconds(0);
  graphStartTime.setMilliseconds(0);

  const graphEndTime = new Date(latestEventTime);
  if (graphEndTime.getSeconds() > 0 || graphEndTime.getMilliseconds() > 0) {
    graphEndTime.setMinutes(graphEndTime.getMinutes() + 1);
    graphEndTime.setSeconds(0);
    graphEndTime.setMilliseconds(0);
  }
  graphEndTime.setSeconds(graphEndTime.getSeconds() + 30);

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
      case "Email Reported":
        return "#6b7280"; // Original Gray
      default:
        return "#6b7280"; // Original Gray
    }
  };

  const formatDetailedTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getPositionPercentage = (time) => {
    const timeAsDate = new Date(time);
    if (totalGraphDuration === 0) return 0;
    return ((timeAsDate - graphStartTime) / totalGraphDuration) * 100;
  };

  const handleMouseEnter = (timelineEvent) => {
    setHoveredEvent(timelineEvent);
    if (graphRef.current) {
      const graphRect = graphRef.current.getBoundingClientRect();
      const parentContainer = graphRef.current.parentElement;
      const parentRect = parentContainer.getBoundingClientRect();

      const dotPositionXPercentage = getPositionPercentage(timelineEvent.time);
      const dotCenterYRelativeToGraph = 30;

      const dotPixelXRelativeToGraph = (dotPositionXPercentage / 100) * graphRect.width;

      const tooltipX = dotPixelXRelativeToGraph + (graphRect.left - parentRect.left);
      const tooltipY = dotCenterYRelativeToGraph + (graphRect.top - parentRect.top);

      setHoverPosition({
        x: tooltipX,
        y: tooltipY,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null);
  };

  const createTimeMarkers = () => {
    const markers = [];
    const ONE_MINUTE = 60 * 1000;
    const TWENTY_MINUTES = 20 * ONE_MINUTE;
    const ONE_HOUR = 60 * ONE_MINUTE;
    const THREE_HOURS = 3 * ONE_HOUR;

    let markerInterval = ONE_MINUTE;

    if (totalGraphDuration <= 15 * ONE_MINUTE) {
      markerInterval = ONE_MINUTE;
    } else if (totalGraphDuration <= 2 * ONE_HOUR) {
      markerInterval = TWENTY_MINUTES;
    } else if (totalGraphDuration <= 12 * ONE_HOUR) {
      markerInterval = ONE_HOUR;
    } else {
      markerInterval = THREE_HOURS;
    }

    let currentTime = new Date(graphStartTime);
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    const intervalMinutes = markerInterval / ONE_MINUTE;
    const currentMinutes = currentTime.getMinutes();
    const adjustedMinutes = currentMinutes - (currentMinutes % intervalMinutes);
    currentTime.setMinutes(adjustedMinutes);

    if (currentTime.getTime() > graphStartTime.getTime() && totalGraphDuration > 0) {
      currentTime.setTime(currentTime.getTime() - markerInterval);
    }

    while (currentTime <= graphEndTime) {
      const position = getPositionPercentage(currentTime);

      markers.push(
        <Box
          key={currentTime.toISOString()}
          sx={{
            position: "absolute",
            left: `${position}%`,
            transform: "translateX(-50%)",
            top: "0px",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              width: "1px",
              height: "8px",
              backgroundColor: "#d1d5db",
              mx: "auto",
              mb: 0.5,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: "11px",
              color: "#111827", // Darker color
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </Typography>

        </Box>
      );
      currentTime.setTime(currentTime.getTime() + markerInterval);
    }
    return markers;
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Timeline Graph */}
      <Box
        ref={graphRef}
        sx={{
          position: "relative",
          height: "100px",
          mb: 2,
        }}
      >
        {/* Main Timeline Line (Dashed) */}
        <Box
          sx={{
            position: "absolute",
            top: "30px",
            left: 0,
            right: 0,
            height: "1px",
            backgroundColor: "transparent",
            backgroundImage: "repeating-linear-gradient(to right, #ccc 0, #ccc 2px, transparent 2px, transparent 6px)",
            backgroundSize: "8px 1px",
            zIndex: 1,
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
                position: "absolute",
                left: `${leftPosition}%`,
                top: "30px",
                transform: "translate(-50%, -50%)",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: color,
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                zIndex: 3,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translate(-50%, -50%) scale(1.5)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                },
              }}
              onMouseEnter={() => handleMouseEnter(event)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {/* Time Markers container - placed below the main line */}
        <Box
          sx={{
            position: "absolute",
            top: "50px",
            left: 0,
            right: 0,
            height: "50px",
          }}
        >
          {createTimeMarkers()}
        </Box>
      </Box>

      {/* Hover Tooltip */}
      {hoveredEvent && hoverPosition && (
        <Box
          sx={{
            position: "absolute",
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: "translate(-50%, -100%) translateY(-15px)",
            backgroundColor: "#fff",
            color: "#333",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            zIndex: 1000,
            pointerEvents: "none",
            maxWidth: "250px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "15px",
              height: "15px",
              backgroundColor: "#fff",
              borderRight: "1px solid #ddd",
              borderBottom: "1px solid #ddd",
              zIndex: -1,
            },
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", color: "#333" }}>
            {formatDetailedTime(hoveredEvent.time)}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "#555" }}>
            Event: {hoveredEvent.message}
          </Typography>
          {hoveredEvent.email && (
            <Typography variant="caption" sx={{ display: "block", color: "#555" }}>
              Email: {hoveredEvent.email}
            </Typography>
          )}
          {(hoveredEvent.os || hoveredEvent.browser) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              {hoveredEvent.os && (
                <Box sx={{ display: "flex", alignItems: "center", color: "#6b7280" }}>
                  <LaptopIcon sx={{ fontSize: "0.8rem", mr: 0.5 }} />
                  <Typography variant="caption">{hoveredEvent.os}</Typography>
                </Box>
              )}
              {hoveredEvent.browser && (
                <Box sx={{ display: "flex", alignItems: "center", color: "#6b7280" }}>
                  <BrowserUpdated sx={{ fontSize: "0.8rem", mr: 0.5 }} />
                  <Typography variant="caption">{hoveredEvent.browser}</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Legend */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mt: 2 }}>
        {["Email Sent", "Clicked Link", "Submitted Data"].map((eventType) => (
          <Box key={eventType} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: getEventColor(eventType),
              }}
            />
            <Typography variant="caption" sx={{ fontSize: "11px", color: "#374151" }}>
              {eventType}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TimelineGraph;