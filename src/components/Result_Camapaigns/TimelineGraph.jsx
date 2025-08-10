import React, { useState, useRef, useMemo } from "react";
import { Box, Typography, Paper, alpha, Chip } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";

const TimelineGraph = ({ timeline }) => {
  const { darkMode } = useTheme();
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [clickedEvent, setClickedEvent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const graphRef = useRef(null);
  const tooltipRef = useRef(null);

  const sortedTimeline = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];
    return [...timeline].sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [timeline]);

  if (!timeline || timeline.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '12px',
          background: darkMode 
            ? alpha("#1a1a2e", 0.4) 
            : alpha("#f5f5f5", 0.8),
          border: `1px dashed ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: darkMode ? '#ccc' : '#666',
            mb: 1,
          }}
        >
          📅 No Timeline Events
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: darkMode ? '#999' : '#888',
          }}
        >
          Timeline events will appear here as the campaign progresses
        </Typography>
      </Paper>
    );
  }

  const earliestEventTime = new Date(sortedTimeline[0].time);
  const latestEventTime = new Date(sortedTimeline[sortedTimeline.length - 1].time);

  const graphStartTime = new Date(earliestEventTime);
  graphStartTime.setMinutes(graphStartTime.getMinutes() - 5);
  
  const graphEndTime = new Date(latestEventTime);
  graphEndTime.setMinutes(graphEndTime.getMinutes() + 5);

  const totalGraphDuration = graphEndTime - graphStartTime;

  const getEventColor = (message) => {
    const eventColors = {
      "Campaign Created": "#10b981",
      "Email Sent": "#2196f3", 
      "Email Opened": "#ff9800",
      "Clicked Link": "#f97316",
      "Submitted Data": "#ef4444",
      "Email Reported": "#6b7280",
    };
    return eventColors[message] || "#6b7280";
  };

  // ✅ FIXED: Compact time formatting
  const formatCompactTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPositionPercentage = (time) => {
    const timeAsDate = new Date(time);
    if (totalGraphDuration === 0) return 50;
    return Math.max(5, Math.min(95, ((timeAsDate - graphStartTime) / totalGraphDuration) * 100));
  };

  // ✅ FIXED: Smart tooltip positioning
  const getTooltipPosition = (dotPosition, containerWidth) => {
    const tooltipWidth = 180; // Compact tooltip width
    let x = dotPosition;
    
    // Keep tooltip within container bounds
    if (x - tooltipWidth/2 < 10) {
      x = tooltipWidth/2 + 10; // Left edge
    } else if (x + tooltipWidth/2 > containerWidth - 10) {
      x = containerWidth - tooltipWidth/2 - 10; // Right edge
    }
    
    return { x: x - tooltipWidth/2, y: -100 }; // Position above the timeline
  };

  const handleMouseEnter = (timelineEvent) => {
    setHoveredEvent(timelineEvent);
    if (graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const position = getPositionPercentage(timelineEvent.time);
      const dotX = (position / 100) * rect.width;
      
      const tooltipPos = getTooltipPosition(dotX, rect.width);
      setHoverPosition(tooltipPos);
    }
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!isHoveringTooltip && !clickedEvent) {
        setHoveredEvent(null);
      }
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    setIsHoveringTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false);
    if (!clickedEvent) {
      setTimeout(() => {
        if (!isHoveringTooltip) {
          setHoveredEvent(null);
        }
      }, 100);
    }
  };

  const handleClick = (timelineEvent, event) => {
    event.stopPropagation();
    if (clickedEvent === timelineEvent) {
      setClickedEvent(null);
      setHoveredEvent(null);
    } else {
      setClickedEvent(timelineEvent);
      setHoveredEvent(timelineEvent);
      handleMouseEnter(timelineEvent);
    }
  };

  const handleBackgroundClick = () => {
    setClickedEvent(null);
    if (!isHoveringTooltip) {
      setHoveredEvent(null);
    }
  };

  const createTimeLabels = () => {
    const labels = [];
    const timePoints = [0, 25, 50, 75, 100];
    
    timePoints.forEach((percentage) => {
      const time = new Date(graphStartTime.getTime() + (totalGraphDuration * percentage / 100));
      labels.push(
        <Box
          key={percentage}
          sx={{
            position: "absolute",
            left: `${percentage}%`,
            bottom: "-25px",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: darkMode ? '#ccc' : '#666',
              fontWeight: 'medium',
            }}
          >
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Typography>
        </Box>
      );
    });
    
    return labels;
  };

  return (
    <Box 
      sx={{ 
        position: "relative", 
        width: "100%", 
        minHeight: "140px", // ✅ FIXED: Reduced height
        pb: 3,
      }}
      onClick={handleBackgroundClick}
    >
      {/* ✅ Timeline Graph Container */}
      <Box
        ref={graphRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "70px", // ✅ FIXED: Reduced height
          backgroundColor: darkMode ? alpha('#1a1a2e', 0.3) : alpha('#f8f9fa', 0.5),
          borderRadius: '16px',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
          overflow: 'visible',
          mb: 2,
        }}
      >
        {/* Timeline Line */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "5%",
            right: "5%",
            height: "4px",
            background: `linear-gradient(90deg, ${alpha('#ec008c', 0.2)}, ${alpha('#ec008c', 0.8)}, ${alpha('#fc6767', 0.8)}, ${alpha('#ec008c', 0.2)})`,
            transform: "translateY(-50%)",
            borderRadius: '3px',
            boxShadow: `0 2px 8px ${alpha('#ec008c', 0.3)}`,
          }}
        />

        {/* Event Dots */}
        {sortedTimeline.map((event, index) => {
          const leftPosition = getPositionPercentage(event.time);
          const color = getEventColor(event.message);
          const isActive = hoveredEvent === event || clickedEvent === event;

          return (
            <Box
              key={`${event.time}-${index}`}
              sx={{
                position: "absolute",
                left: `${leftPosition}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                padding: '8px',
                cursor: "pointer",
                zIndex: 10,
              }}
              onMouseEnter={() => handleMouseEnter(event)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleClick(event, e)}
            >
              <Box
                sx={{
                  width: isActive ? "18px" : "14px", // ✅ FIXED: Smaller dots
                  height: isActive ? "18px" : "14px",
                  backgroundColor: color,
                  borderRadius: "50%",
                  border: `2px solid ${darkMode ? '#1a1a2e' : '#ffffff'}`,
                  transition: 'all 0.3s ease',
                  boxShadow: isActive 
                    ? `0 3px 12px ${alpha(color, 0.6)}, 0 0 0 3px ${alpha(color, 0.2)}` 
                    : `0 2px 6px ${alpha(color, 0.4)}`,
                  '&:hover': {
                    transform: "scale(1.2)",
                  },
                }}
              />
            </Box>
          );
        })}

        {/* Time Labels */}
        {createTimeLabels()}
      </Box>

      {/* ✅ FIXED: Compact Tooltip */}
      {(hoveredEvent || clickedEvent) && hoverPosition && (
        <Paper
          ref={tooltipRef}
          elevation={8}
          sx={{
            position: "absolute",
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            p: 1.5, // ✅ FIXED: Reduced padding
            borderRadius: '12px',
            background: darkMode 
              ? `linear-gradient(135deg, ${alpha('#1a1a2e', 0.95)}, ${alpha('#2d2d3e', 0.9)})` 
              : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8f9fa', 0.9)})`,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.1)}`,
            boxShadow: darkMode 
              ? '0 8px 24px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(236, 0, 140, 0.3)' 
              : '0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(236, 0, 140, 0.2)',
            zIndex: 1000,
            width: '180px', // ✅ FIXED: Fixed compact width
            maxWidth: '180px',
            // ✅ FIXED: Smaller arrow
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${darkMode ? '#1a1a2e' : '#ffffff'}`,
            },
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ FIXED: Compact content */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: darkMode ? '#e1e1e1' : '#333',
              mb: 1,
              fontSize: '0.75rem',
              display: 'block',
            }}
          >
            {formatCompactTime(hoveredEvent?.time || clickedEvent?.time)}
          </Typography>
          
          <Chip
            label={hoveredEvent?.message || clickedEvent?.message}
            size="small"
            sx={{
              backgroundColor: alpha(getEventColor(hoveredEvent?.message || clickedEvent?.message), 0.15),
              color: getEventColor(hoveredEvent?.message || clickedEvent?.message),
              border: `1px solid ${alpha(getEventColor(hoveredEvent?.message || clickedEvent?.message), 0.3)}`,
              fontWeight: 'medium',
              fontSize: '0.65rem',
              height: '22px',
              width: '100%',
              justifyContent: 'center',
            }}
          />
          
          {/* ✅ FIXED: Compact email display */}
          {(hoveredEvent?.email || clickedEvent?.email) && (
            <Typography
              variant="caption"
              sx={{
                color: darkMode ? '#ccc' : '#666',
                display: 'block',
                fontSize: '0.65rem',
                mt: 0.5,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              📧 {hoveredEvent?.email || clickedEvent?.email}
            </Typography>
          )}
        </Paper>
      )}

      {/* ✅ FIXED: Compact Legend */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        justifyContent: 'center',
        mt: 2,
        pt: 1.5,
        borderTop: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
      }}>
        {["Campaign Created", "Email Sent", "Email Opened", "Clicked Link", "Submitted Data", "Email Reported"].map((eventType) => {
          const color = getEventColor(eventType);
          const hasEvent = sortedTimeline.some(event => event.message === eventType);
          
          return (
            <Chip
              key={eventType}
              label={eventType}
              size="small"
              sx={{
                backgroundColor: hasEvent ? alpha(color, 0.15) : alpha(color, 0.05),
                color: hasEvent ? color : alpha(color, 0.6),
                border: `1px solid ${alpha(color, hasEvent ? 0.4 : 0.2)}`,
                fontWeight: hasEvent ? 'medium' : 'normal',
                fontSize: '0.7rem',
                height: '24px',
                opacity: hasEvent ? 1 : 0.7,
                '&:before': {
                  content: '""',
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  marginRight: '4px',
                  opacity: hasEvent ? 1 : 0.5,
                },
              }}
            />
          );
        })}
      </Box>

      {/* ✅ FIXED: Compact Timeline Stats */}
      <Box sx={{ 
        mt: 2,
        p: 1.5,
        borderRadius: '8px',
        background: darkMode ? alpha('#1a1a2e', 0.3) : alpha('#f8f9fa', 0.5),
        border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
      }}>
        <Typography
          variant="caption"
          sx={{
            color: darkMode ? '#ccc' : '#666',
            display: 'block',
            textAlign: 'center',
            fontSize: '0.7rem',
          }}
        >
          📈 {sortedTimeline.length} events • {Math.ceil((latestEventTime - earliestEventTime) / (1000 * 60))} min duration
        </Typography>
      </Box>
    </Box>
  );
};

export default TimelineGraph;
