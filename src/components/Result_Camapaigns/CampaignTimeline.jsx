import React from "react";
import {
  Box,
  Typography,
  Button,
  Collapse,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LinkIcon from "@mui/icons-material/Link";
import SecurityIcon from "@mui/icons-material/Security";
import ReportIcon from "@mui/icons-material/Report"; // Assuming you have an icon for reported

const CampaignTimeline = ({
  email,
  firstName,
  lastName,
  resultId,
  reported,
  timeline, // The full campaign timeline array
  detailsExpanded,
  setDetailsExpanded,
}) => {
  // Filter timeline events for this specific email
  let userTimeline = timeline.filter(event =>
    event.email === email ||
    (event.message === "Campaign Created" && event.email === "") // Include campaign creation
  );

  // Add "Email Reported" event if the user is reported
  if (reported) {
    // Find the latest event time to add the reported event after
    const latestEventTime = userTimeline.length > 0
      ? Math.max(...userTimeline.map(event => new Date(event.time).getTime()))
      : new Date().getTime();

    const reportedEvent = {
      message: "Email Reported",
      email: email,
      time: new Date(latestEventTime + 60000).toISOString(), // Add 1 minute to latest event
      details: null
    };

    userTimeline.push(reportedEvent);
  }

  // Sort timeline by time
  userTimeline.sort((a, b) => new Date(a.time) - new Date(b.time));

  const toggleDetails = (key) => {
    const newDetailsExpanded = new Set(detailsExpanded);
    if (newDetailsExpanded.has(key)) {
      newDetailsExpanded.delete(key);
    } else {
      newDetailsExpanded.add(key);
    }
    setDetailsExpanded(newDetailsExpanded);
  };

  const getEventConfig = (message) => {
    switch (message) {
      case "Campaign Created":
        return {
          icon: <RocketLaunchIcon sx={{ fontSize: "18px" }} />,
          color: "#10b981",
          bgColor: "#10b981"
        };
      case "Email Sent":
        return {
          icon: <EmailIcon sx={{ fontSize: "18px" }} />,
          color: "#3b82f6",
          bgColor: "#3b82f6"
        };
      case "Email Opened":
        return {
          icon: <VisibilityIcon sx={{ fontSize: "18px" }} />,
          color: "#8b5cf6",
          bgColor: "#8b5cf6"
        };
      case "Clicked Link":
        return {
          icon: <LinkIcon sx={{ fontSize: "18px" }} />,
          color: "#f59e0b",
          bgColor: "#f59e0b"
        };
      case "Submitted Data":
        return {
          icon: <SecurityIcon sx={{ fontSize: "18px" }} />,
          color: "#ef4444",
          bgColor: "#ef4444"
        };
      case "Email Reported":
        return {
          icon: <ReportIcon sx={{ fontSize: "18px" }} />,
          color: "#06b6d4",
          bgColor: "#06b6d4"
        };
      default:
        return {
          icon: <RocketLaunchIcon sx={{ fontSize: "18px" }} />,
          color: "#6b7280",
          bgColor: "#6b7280"
        };
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ fontWeight: "600", textTransform: "capitalize" }}>
          Timeline for {firstName?.toLowerCase()} {lastName?.toLowerCase()}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Email: {email}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Result ID: {resultId}
        </Typography>
      </Box>

      {userTimeline.length > 0 ? (
        <Box sx={{ position: "relative", maxWidth: "800px", mx: "auto" }}>
          {/* Central Vertical Line */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "20px",
              bottom: "20px",
              width: "3px",
              backgroundColor: "#e5e7eb",
              transform: "translateX(-50%)",
              borderRadius: "2px",
            }}
          />

          {userTimeline.map((event, eventIndex) => {
            const isEven = eventIndex % 2 === 0;

            // Parse details if it's a JSON string
            let parsedDetails = null;
            if (event.details) {
              try {
                parsedDetails = JSON.parse(event.details);
              } catch (e) {
                // If parsing fails, use the original details
              }
            }

            const eventConfig = getEventConfig(event.message);
            const detailsKey = `${email}-${eventIndex}`;
            const showDetails = detailsExpanded.has(detailsKey);

            return (
              <Box
                key={eventIndex}
                sx={{
                  display: "flex",
                  mb: 4,
                  position: "relative",
                  justifyContent: isEven ? "flex-start" : "flex-end",
                }}
              >
                {/* Event Content */}
                <Box
                  sx={{
                    width: "45%",
                    mr: isEven ? 2 : 0,
                    ml: isEven ? 0 : 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      p: 3,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "20px",
                        [isEven ? "right" : "left"]: "-8px",
                        width: 0,
                        height: 0,
                        borderTop: "8px solid transparent",
                        borderBottom: "8px solid transparent",
                        [isEven ? "borderLeft" : "borderRight"]: "8px solid #e5e7eb",
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: "20px",
                        [isEven ? "right" : "left"]: "-7px",
                        width: 0,
                        height: 0,
                        borderTop: "8px solid transparent",
                        borderBottom: "8px solid transparent",
                        [isEven ? "borderLeft" : "borderRight"]: "8px solid #fff",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: "600", color: "#1f2937" }}>
                        {event.message}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        mb: 2,
                      }}
                    >
                      {new Date(event.time).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </Typography>

                    {/* Browser/OS Info */}
                    {parsedDetails && parsedDetails.browser && (
                      <Box sx={{ mb: 2 }}>
                        {parsedDetails.browser["user-agent"] && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Box sx={{ fontSize: "16px" }}>
                              {(() => {
                                const ua = parsedDetails.browser["user-agent"];
                                if (ua.includes("Windows")) return "🖥️";
                                if (ua.includes("Mac")) return "🍎";
                                if (ua.includes("Linux")) return "🐧";
                                if (ua.includes("Android")) return "📱";
                                if (ua.includes("iOS")) return "📱";
                                return "💻";
                              })()}
                            </Box>
                            <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                              {(() => {
                                const ua = parsedDetails.browser["user-agent"];
                                let os = "";
                                if (ua.includes("Windows NT 10.0")) os = "Windows 10";
                                else if (ua.includes("Windows")) os = "Windows";
                                else if (ua.includes("Mac")) os = "macOS";
                                else if (ua.includes("X11; Linux x86_64")) os = "Linux x86_64";
                                else if (ua.includes("Linux")) os = "Linux";
                                else if (ua.includes("Android")) {
                                  const androidMatch = ua.match(/Android ([^;]+)/);
                                  os = androidMatch ? `Android ${androidMatch[1]}` : "Android";
                                }
                                else if (ua.includes("iOS")) os = "iOS";
                                else os = "Unknown OS";
                                return os;
                              })()}
                            </Typography>
                          </Box>
                        )}
                        {parsedDetails.browser["user-agent"] && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ fontSize: "16px" }}>🌐</Box>
                            <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                              {(() => {
                                const ua = parsedDetails.browser["user-agent"];
                                let browser = "";
                                const chromeMatch = ua.match(/Chrome\/([^\s]+)/);
                                const firefoxMatch = ua.match(/Firefox\/([^\s]+)/);
                                const safariMatch = ua.match(/Safari\/([^\s]+)/);
                                const edgeMatch = ua.match(/Edge\/([^\s]+)/);

                                if (chromeMatch && !ua.includes("Edge")) browser = `Chrome ${chromeMatch[1]}`;
                                else if (firefoxMatch) browser = `Firefox ${firefoxMatch[1]}`;
                                else if (safariMatch && !ua.includes("Chrome")) browser = `Safari ${safariMatch[1]}`;
                                else if (edgeMatch) browser = `Edge ${edgeMatch[1]}`;
                                else browser = "Unknown Browser";

                                return browser;
                              })()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Action Buttons for Submitted Data */}
                    {event.message === "Submitted Data" && (
                      <Box sx={{ mt: 2, display: "flex", gap: 1, flexDirection: "column" }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => toggleDetails(detailsKey)}
                          sx={{
                            color: "#6b7280",
                            textTransform: "none",
                            fontSize: "0.8rem",
                            py: 0.5,
                            px: 1,
                            alignSelf: "flex-start",
                            justifyContent: "flex-start",
                            "&:hover": {
                              backgroundColor: "rgba(107, 114, 128, 0.1)",
                              color: "#4b5563",
                            },
                          }}
                          startIcon={
                            <Box sx={{ fontSize: "14px" }}>
                              {showDetails ? "▼" : "▶"}
                            </Box>
                          }
                        >
                          View Details
                        </Button>

                        {/* Details Table */}
                        <Collapse in={showDetails} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2, border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                            <Box
                              sx={{
                                display: "flex",
                                backgroundColor: "#f9fafb",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <Box
                                sx={{
                                  flex: 1,
                                  px: 2,
                                  py: 1.5,
                                  borderRight: "1px solid #e5e7eb",
                                  fontWeight: "600",
                                  fontSize: "0.875rem",
                                  color: "#374151",
                                }}
                              >
                                Parameter
                              </Box>
                              <Box
                                sx={{
                                  flex: 1,
                                  px: 2,
                                  py: 1.5,
                                  fontWeight: "600",
                                  fontSize: "0.875rem",
                                  color: "#374151",
                                }}
                              >
                                Value(s)
                              </Box>
                            </Box>
                            {parsedDetails && parsedDetails.payload && (
                              Object.entries(parsedDetails.payload)
                              .filter(([key]) => key !== "rid") 
                              .map(([key, value], idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: "flex",
                                    borderBottom: idx < Object.entries(parsedDetails.payload).length - 1 ? "1px solid #e5e7eb" : "none",
                                    "&:hover": {
                                      backgroundColor: "#f9fafb",
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      flex: 1,
                                      px: 2,
                                      py: 1.5,
                                      borderRight: "1px solid #e5e7eb",
                                      fontSize: "0.875rem",
                                      backgroundColor: "#fff",
                                      color: "#374151",
                                    }}
                                  >
                                    {key}
                                  </Box>
                                  <Box
                                    sx={{
                                      flex: 1,
                                      px: 2,
                                      py: 1.5,
                                      fontSize: "0.875rem",
                                      backgroundColor: "#fff",
                                      color: "#6b7280",
                                      wordBreak: "break-all",
                                    }}
                                  >
                                    {Array.isArray(value) ? value.join(", ") : String(value)}
                                  </Box>
                                </Box>
                              ))
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Central Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "20px",
                    transform: "translateX(-50%)",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: eventConfig.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    zIndex: 2,
                    border: "4px solid #fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {eventConfig.icon}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ textAlign: "center", py: 4, color: "#6b7280" }}>
          No timeline events for this email.
        </Typography>
      )}
    </Box>
  );
};

export default CampaignTimeline;