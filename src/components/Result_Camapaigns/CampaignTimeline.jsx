import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Collapse,
  Paper,
  alpha,
  Chip,
} from "@mui/material";
import {
  RocketLaunch as RocketLaunchIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  Security as SecurityIcon,
  Report as ReportIcon,
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";

const CampaignTimeline = ({
  email,
  firstName,
  lastName,
  resultId,
  reported,
  timeline,
  detailsExpanded,
  setDetailsExpanded,
}) => {
  const { darkMode } = useTheme();

  // ✅ Process timeline data
  const processedTimeline = useMemo(() => {
    let userTimeline = timeline.filter(event =>
      event.email === email ||
      (event.message === "Campaign Created" && event.email === "")
    );

    // Add reported event if applicable
    if (reported) {
      const latestEventTime = userTimeline.length > 0
        ? Math.max(...userTimeline.map(event => new Date(event.time).getTime()))
        : new Date().getTime();

      const reportedEvent = {
        message: "Email Reported",
        email: email,
        time: new Date(latestEventTime + 60000).toISOString(),
        details: null
      };

      userTimeline.push(reportedEvent);
    }

    return userTimeline.sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [timeline, email, reported]);

  const toggleDetails = (key) => {
    const newDetailsExpanded = new Set(detailsExpanded);
    if (newDetailsExpanded.has(key)) {
      newDetailsExpanded.delete(key);
      advancedToast.info("Details collapsed", "Details Hidden", { icon: "📋" });
    } else {
      newDetailsExpanded.add(key);
      advancedToast.info("Details expanded", "Details Shown", { icon: "📊" });
    }
    setDetailsExpanded(newDetailsExpanded);
  };

  // ✅ Enhanced event configuration
  const getEventConfig = (message) => {
    const configs = {
      "Campaign Created": { 
        icon: <RocketLaunchIcon />, 
        color: "#10b981", 
        description: "Campaign was launched and emails prepared"
      },
      "Email Sent": { 
        icon: <EmailIcon />, 
        color: "#3b82f6", 
        description: "Phishing email was successfully delivered"
      },
      "Email Opened": { 
        icon: <VisibilityIcon />, 
        color: "#8b5cf6", 
        description: "Recipient opened the phishing email"
      },
      "Clicked Link": { 
        icon: <LinkIcon />, 
        color: "#f59e0b", 
        description: "Recipient clicked the malicious link"
      },
      "Submitted Data": { 
        icon: <SecurityIcon />, 
        color: "#ef4444", 
        description: "Recipient submitted sensitive information"
      },
      "Email Reported": { 
        icon: <ReportIcon />, 
        color: "#06b6d4", 
        description: "Recipient reported email as suspicious"
      },
    };

    return configs[message] || { 
      icon: <EmailIcon />, 
      color: "#6b7280", 
      description: "Timeline event occurred"
    };
  };

  // ✅ Device detection utility
  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return { os: "Unknown", browser: "Unknown", osIcon: <ComputerIcon /> };

    let os = "Unknown";
    let browser = "Unknown";
    let osIcon = <ComputerIcon />;

    // OS Detection
    if (userAgent.includes("Windows")) {
      os = "Windows";
      osIcon = <ComputerIcon sx={{ color: '#0078d4' }} />;
    } else if (userAgent.includes("Mac")) {
      os = "macOS";
      osIcon = <ComputerIcon sx={{ color: '#000000' }} />;
    } else if (userAgent.includes("Android")) {
      os = "Android";
      osIcon = <SmartphoneIcon sx={{ color: '#3ddc84' }} />;
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      os = "iOS";
      osIcon = <SmartphoneIcon sx={{ color: '#007aff' }} />;
    } else if (userAgent.includes("Linux")) {
      os = "Linux";
      osIcon = <ComputerIcon sx={{ color: '#fcc624' }} />;
    }

    // Browser Detection
    if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
      browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browser = "Safari";
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
    }

    return { os, browser, osIcon };
  };

  return (
    <Box 
      className="campaign-timeline-container"
      sx={{ 
        width: '100%',
        maxHeight: '500px', // ✅ Fixed height for scrolling
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1, // Space for scrollbar
      }}
    >
      {processedTimeline.length > 0 ? (
        <Box sx={{ position: 'relative', pl: 5, pr: 2, py: 2 }}>
          {/* ✅ ENHANCED: Vertical Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: '20px',
              top: '16px',
              bottom: '16px',
              width: '4px',
              background: `linear-gradient(180deg, 
                ${alpha('#ec008c', 0.9)} 0%, 
                ${alpha('#fc6767', 0.8)} 50%, 
                ${alpha('#ec008c', 0.9)} 100%)`,
              borderRadius: '3px',
              boxShadow: `0 0 12px ${alpha('#ec008c', 0.4)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-8px',
                left: '-4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, #ec008c, #fc6767)`,
                boxShadow: `0 0 8px ${alpha('#ec008c', 0.6)}`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '-4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, #ec008c, #fc6767)`,
                boxShadow: `0 0 8px ${alpha('#ec008c', 0.6)}`,
              },
            }}
          />

          {/* ✅ Timeline Events */}
          {processedTimeline.map((event, eventIndex) => {
            let parsedDetails = null;
            
            if (event.details) {
              try {
                parsedDetails = JSON.parse(event.details);
              } catch (e) {
                parsedDetails = event.details;
              }
            }

            const eventConfig = getEventConfig(event.message);
            const detailsKey = `${email}-${eventIndex}`;
            const showDetails = detailsExpanded.has(detailsKey);
            const { os, browser, osIcon } = parsedDetails?.browser?.["user-agent"]
              ? getDeviceInfo(parsedDetails.browser["user-agent"])
              : { os: "N/A", browser: "N/A", osIcon: <ComputerIcon /> };

            return (
              <Box
                key={eventIndex}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 4,
                  position: 'relative',
                  animation: `fadeInUp 0.6s ease forwards`,
                  animationDelay: `${eventIndex * 0.1}s`,
                  '@keyframes fadeInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                {/* ✅ ENHANCED: Timeline Event Dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '-29px',
                    top: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${eventConfig.color}, ${alpha(eventConfig.color, 0.8)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: `0 4px 16px ${alpha(eventConfig.color, 0.4)}, 0 0 0 4px ${darkMode ? '#1a1a2e' : '#ffffff'}, 0 0 0 6px ${alpha(eventConfig.color, 0.2)}`,
                    border: `3px solid ${darkMode ? '#1a1a2e' : '#ffffff'}`,
                    zIndex: 10,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 6px 20px ${alpha(eventConfig.color, 0.6)}, 0 0 0 4px ${darkMode ? '#1a1a2e' : '#ffffff'}, 0 0 0 8px ${alpha(eventConfig.color, 0.3)}`,
                    },
                  }}
                >
                  {React.cloneElement(eventConfig.icon, { fontSize: 'medium' })}
                </Box>

                {/* ✅ ENHANCED: Timeline Content Card */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 3,
                    ml: 3,
                    borderRadius: '16px',
                    background: darkMode 
                      ? `linear-gradient(135deg, ${alpha('#2d2d3e', 0.8)}, ${alpha('#1a1a2e', 0.6)})` 
                      : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8f9fa', 0.9)})`,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
                    boxShadow: darkMode 
                      ? `0 8px 32px ${alpha('#000', 0.4)}, 0 2px 8px ${alpha(eventConfig.color, 0.2)}` 
                      : `0 8px 32px ${alpha('#000', 0.1)}, 0 2px 8px ${alpha(eventConfig.color, 0.15)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px) translateY(-2px)',
                      boxShadow: darkMode 
                        ? `0 12px 40px ${alpha('#000', 0.5)}, 0 4px 16px ${alpha(eventConfig.color, 0.3)}` 
                        : `0 12px 40px ${alpha('#000', 0.15)}, 0 4px 16px ${alpha(eventConfig.color, 0.2)}`,
                    },
                  }}
                >
                  {/* Event Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: 2 
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          color: darkMode ? '#e1e1e1' : '#333',
                          fontSize: '1.1rem',
                          mb: 0.5,
                        }}
                      >
                        {event.message}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: darkMode ? '#ccc' : '#666',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {eventConfig.description}
                      </Typography>
                    </Box>
                    
                    <Chip
                      label={new Date(event.time).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                      size="small"
                      sx={{
                        backgroundColor: alpha(eventConfig.color, 0.15),
                        color: eventConfig.color,
                        border: `1px solid ${alpha(eventConfig.color, 0.3)}`,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        ml: 2,
                      }}
                    />
                  </Box>

                  {/* ✅ Enhanced Device Information */}
                  {(event.message === "Clicked Link" || event.message === "Submitted Data") && 
                   parsedDetails?.browser && os !== "N/A" && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          color: darkMode ? '#e1e1e1' : '#333',
                          mb: 1.5,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        🖥️ Device Information
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          p: 1.5,
                          borderRadius: '12px',
                          background: darkMode 
                            ? `linear-gradient(135deg, ${alpha('#fff', 0.08)}, ${alpha('#fff', 0.04)})` 
                            : `linear-gradient(135deg, ${alpha('#000', 0.04)}, ${alpha('#000', 0.02)})`,
                          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                        }}>
                          {React.cloneElement(osIcon, { fontSize: 'small' })}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'medium',
                              color: darkMode ? '#e1e1e1' : '#333',
                              fontSize: '0.85rem',
                            }}
                          >
                            {os}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          p: 1.5,
                          borderRadius: '12px',
                          background: darkMode 
                            ? `linear-gradient(135deg, ${alpha('#fff', 0.08)}, ${alpha('#fff', 0.04)})` 
                            : `linear-gradient(135deg, ${alpha('#000', 0.04)}, ${alpha('#000', 0.02)})`,
                          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                        }}>
                          <ComputerIcon fontSize="small" sx={{ color: '#2196f3' }} />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'medium',
                              color: darkMode ? '#e1e1e1' : '#333',
                              fontSize: '0.85rem',
                            }}
                          >
                            {browser}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* ✅ Enhanced Submitted Data Details */}
                  {event.message === "Submitted Data" && (
                    <Box>
                      <Button
                        onClick={() => toggleDetails(detailsKey)}
                        size="small"
                        sx={{
                          color: darkMode ? '#ccc' : '#666',
                          textTransform: "none",
                          fontSize: "0.85rem",
                          py: 1,
                          px: 2,
                          borderRadius: '12px',
                          backgroundColor: darkMode 
                            ? alpha('#fff', 0.08) 
                            : alpha('#000', 0.04),
                          border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
                          transition: 'all 0.3s ease',
                          "&:hover": {
                            backgroundColor: alpha(eventConfig.color, 0.1),
                            color: eventConfig.color,
                            borderColor: eventConfig.color,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${alpha(eventConfig.color, 0.3)}`,
                          },
                        }}
                        startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      >
                        {showDetails ? "Hide Submitted Data" : "View Submitted Data"}
                      </Button>

                      <Collapse in={showDetails}>
                        <Paper
                          elevation={0}
                          sx={{ 
                            mt: 2,
                            p: 2.5,
                            borderRadius: '12px',
                            background: darkMode 
                              ? `linear-gradient(135deg, ${alpha('#1a1a2e', 0.8)}, ${alpha('#2d2d3e', 0.4)})` 
                              : `linear-gradient(135deg, ${alpha('#f8f9fa', 0.9)}, ${alpha('#ffffff', 0.7)})`,
                            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 'bold',
                              color: darkMode ? '#e1e1e1' : '#333',
                              mb: 2,
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            🔒 Submitted Information
                          </Typography>

                          <Box sx={{ display: 'grid', gap: 1 }}>
                            {parsedDetails?.payload && 
                              Object.entries(parsedDetails.payload)
                                .filter(([key]) => key !== "rid")
                                .map(([key, value], idx) => (
                                  <Box 
                                    key={idx}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      p: 1.5,
                                      borderRadius: '8px',
                                      background: darkMode 
                                        ? alpha('#fff', 0.05) 
                                        : alpha('#000', 0.03),
                                      border: `1px solid ${darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 'medium',
                                        color: darkMode ? '#ccc' : '#666',
                                        textTransform: 'capitalize',
                                        fontSize: '0.85rem',
                                      }}
                                    >
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 'bold',
                                        color: darkMode ? '#e1e1e1' : '#333',
                                        fontSize: '0.85rem',
                                        maxWidth: '60%',
                                        textAlign: 'right',
                                        wordBreak: 'break-word',
                                      }}
                                    >
                                      {Array.isArray(value) ? value.join(", ") : String(value)}
                                    </Typography>
                                  </Box>
                                ))
                            }
                          </Box>
                        </Paper>
                      </Collapse>
                    </Box>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            m: 2,
            borderRadius: '16px',
            background: darkMode 
              ? alpha("#1a1a2e", 0.4) 
              : alpha("#f5f5f5", 0.8),
            border: `2px dashed ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
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
            variant="body1" 
            sx={{ 
              color: darkMode ? '#999' : '#888',
            }}
          >
            No timeline events found for this participant.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CampaignTimeline;
