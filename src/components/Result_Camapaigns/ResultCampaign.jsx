import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Paper,
  alpha,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  FileDownload as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  ReportProblem as ReportIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";
import useCampaignData from "./useCampaignData";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { stableSort, getComparator } from "./utils";
import CampaignTable from "./CampaignTable";
import TimelineGraph from "./TimelineGraph";

const CampaignResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { campaign, loading, error, deleteCampaign, refreshCampaign, isReadOnly } = useCampaignData(id);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("first_name");
  const [searchText, setSearchText] = useState("");
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [detailsExpanded, setDetailsExpanded] = useState(new Set());

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setPage(0);
  };

 const exportToCSV = () => {
  if (!campaign?.results || campaign.results.length === 0) {
    advancedToast.warning(
      "No data available to export.",
      "Export Failed",
      { icon: "⚠️" }
    );
    return;
  }

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toLocaleString();
  };

  // Build sequence headers dynamically using the longest timeline found
  let maxEvents = 0;
  const allEventSequences = {};

  campaign.results.forEach((r) => {
    // Filter and sort timeline for this user
    const userTimeline = (campaign.timeline || [])
      .filter(t => t.email === r.email || (!t.email && t.message === "Campaign Created"))
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    // Save user's ordered events
    allEventSequences[r.email] = userTimeline.map(ev => ev.message?.trim() || "");

    // Track the longest sequence among all
    if (userTimeline.length > maxEvents) {
      maxEvents = userTimeline.length;
    }
  });

  // Build headers: static participant info + dynamic event headers
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Position",
    "Status",
    "Reported",
    ...Array.from({ length: maxEvents }, (_, i) => `Event ${i + 1} Name`),
    ...Array.from({ length: maxEvents }, (_, i) => `Event ${i + 1} Time`)
  ];

  // Build rows
  const rows = campaign.results.map((r) => {
    // Get ordered timeline for this user
    const userTimeline = (campaign.timeline || [])
      .filter(t => t.email === r.email || (!t.email && t.message === "Campaign Created"))
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    const eventNames = userTimeline.map(ev => ev.message?.trim() || "");
    const eventTimes = userTimeline.map(ev => formatDate(ev.time));

    // Pad to max length so every row has the same number of columns
    while (eventNames.length < maxEvents) eventNames.push("");
    while (eventTimes.length < maxEvents) eventTimes.push("");

    return [
      r.first_name || "",
      r.last_name || "",
      r.email || "",
      r.position || "",
      r.status || "",
      r.reported ? "Yes" : "No",
      ...eventNames,
      ...eventTimes
    ];
  });

  // Convert to CSV
  const csvContent = [headers, ...rows]
    .map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  // Trigger browser download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${campaign.name.replace(/\s+/g, "_")}_results.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  advancedToast.success(
    "Campaign results exported successfully!",
    "Export Complete",
    { icon: "📊" }
  );
};




  const handleDeleteCampaign = async () => {
    setOpenDeleteConfirm(false);

    if (isReadOnly) {
      advancedToast.error(
        "You don't have permission to delete campaigns.",
        "Access Denied",
        { icon: "🔒" }
      );
      return;
    }

    const loadingId = advancedToast.info(
      "Deleting campaign...",
      "Processing",
      { icon: "🗑️", autoClose: false }
    );

    const success = await deleteCampaign();

    advancedToast.dismissById(loadingId);

    if (success) {
      advancedToast.success(
        "Campaign deleted successfully!",
        "Deleted",
        { icon: "✅" }
      );
      navigate("/");
    }
  };

  const handleRefresh = () => {
    advancedToast.info(
      "Refreshing campaign data...",
      "Refreshing",
      { icon: "🔄" }
    );
    refreshCampaign();
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
        case "Email Reported":
          return r.reported === true;
        default:
          return false;
      }
    }).length;
  };

  const filteredAndSortedResults = useMemo(() => {
    if (!campaign?.results) return [];
    let filtered = campaign.results.filter((result) =>
      Object.values(result).some(
        (value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
    return stableSort(filtered, getComparator(order, orderBy));
  }, [campaign?.results, order, orderBy, searchText]);

  const totalSent = campaign?.results?.length || 1;

  // Progress metrics
  const emailsSent = countByMilestone("Email Sent");
  const clickedLink = countByMilestone("Clicked Link");
  const submittedData = countByMilestone("Submitted Data");
  const emailReported = countByMilestone("Email Reported");

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress
          sx={{ color: '#ec008c' }}
          size={48}
        />
        <Typography
          variant="h6"
          sx={{
            color: darkMode ? '#ccc' : '#666',
          }}
        >
          Loading campaign results...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          m: 3,
          borderRadius: '16px',
          background: darkMode
            ? alpha("#1a1a2e", 0.6)
            : alpha("#ffffff", 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#f44336',
            mb: 2,
            fontWeight: 'bold',
          }}
        >
          ❌ Error Loading Campaign
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: darkMode ? '#ccc' : '#666',
            mb: 3,
          }}
        >
          {error}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            color: '#ec008c',
            borderColor: '#ec008c',
            '&:hover': {
              backgroundColor: alpha('#ec008c', 0.1),
              borderColor: '#ec008c',
            },
          }}
        >
          Try Again
        </Button>
      </Paper>
    );
  }

  if (!campaign) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          m: 3,
          borderRadius: '16px',
          background: darkMode
            ? alpha("#1a1a2e", 0.6)
            : alpha("#ffffff", 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: darkMode ? '#e1e1e1' : '#333',
            mb: 2,
            fontWeight: 'bold',
          }}
        >
          Campaign Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: darkMode ? '#ccc' : '#666',
            mb: 3,
          }}
        >
          The requested campaign could not be found.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            color: '#ec008c',
            borderColor: '#ec008c',
            '&:hover': {
              backgroundColor: alpha('#ec008c', 0.1),
              borderColor: '#ec008c',
            },
          }}
        >
          Go Back
        </Button>
      </Paper>
    );
  }

  return (
    <>
      {/* ✅ Global Styles for Enhanced UI */}
      <style jsx global>{`
        .campaign-results-container {
          background: ${darkMode
          ? 'linear-gradient(135deg, #0c0c0c, #1a1a2e)'
          : 'linear-gradient(135deg, #f8f9fa, #ffffff)'
        };
          min-height: 100vh;
        }
      `}</style>

      <Box className="campaign-results-container" sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* ✅ Enhanced Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '20px',
            background: darkMode
              ? `linear-gradient(135deg, ${alpha('#1a1a2e', 0.9)}, ${alpha('#2d2d3e', 0.7)})`
              : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8f9fa', 0.9)})`,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            boxShadow: darkMode
              ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(236, 0, 140, 0.2)'
              : '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(236, 0, 140, 0.1)',
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2,
          }}>
            {/* Campaign Title Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  color: darkMode ? '#e1e1e1' : '#333',
                  backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                  border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: alpha('#ec008c', 0.1),
                    color: '#ec008c',
                    borderColor: '#ec008c',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #ec008c, #fc6767)',
                      borderRadius: '12px',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CampaignIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: darkMode ? '#e1e1e1' : '#333',
                    }}
                  >
                    {campaign.name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? '#ccc' : '#666',
                    ml: 6,
                  }}
                >
                  Campaign Results • {totalSent} participants
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Tooltip title="Export to CSV">
                <Button
                  onClick={exportToCSV}
                  startIcon={<DownloadIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                    color: '#fff',
                    borderRadius: '12px',
                    fontWeight: 'medium',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #388e3c, #4caf50)',
                      boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                    },
                  }}
                >
                  Export
                </Button>
              </Tooltip>

              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={handleRefresh}
                  sx={{
                    color: darkMode ? '#e1e1e1' : '#333',
                    backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                    border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: alpha('#2196f3', 0.1),
                      color: '#2196f3',
                      borderColor: '#2196f3',
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              {!isReadOnly && (
                <Tooltip title="Delete Campaign">
                  <IconButton
                    onClick={() => setOpenDeleteConfirm(true)}
                    sx={{
                      color: '#f44336',
                      backgroundColor: alpha('#f44336', 0.1),
                      border: `1px solid ${alpha('#f44336', 0.3)}`,
                      borderRadius: '12px',
                      '&:hover': {
                        backgroundColor: alpha('#f44336', 0.2),
                        borderColor: '#f44336',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Paper>

        {/* ✅ Enhanced Timeline Graph */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: '20px',
            background: darkMode
              ? alpha("#1a1a2e", 0.6)
              : alpha("#ffffff", 0.8),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: darkMode ? '#e1e1e1' : '#333',
                fontWeight: 'bold',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              📈 Campaign Timeline
            </Typography>
            <TimelineGraph timeline={campaign?.timeline || []} />
          </Box>
        </Paper>

        {/* ✅ Enhanced Progress Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              label: 'Emails Sent',
              value: emailsSent,
              total: totalSent,
              color: '#2196f3',
              icon: <EmailIcon />,
              description: 'Total emails delivered'
            },
            {
              label: 'Clicked Link',
              value: clickedLink,
              total: totalSent,
              color: '#ff9800',
              icon: <TrendingUpIcon />,
              description: 'Users who clicked the link'
            },
            {
              label: 'Submitted Data',
              value: submittedData,
              total: totalSent,
              color: '#f44336',
              icon: <PeopleIcon />,
              description: 'Users who submitted data'
            },
            {
              label: 'Reported Email',
              value: emailReported,
              total: totalSent,
              color: '#4caf50',
              icon: <ReportIcon />,
              description: 'Users who reported phishing'
            },
          ].map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  background: darkMode
                    ? alpha("#1a1a2e", 0.6)
                    : alpha("#ffffff", 0.8),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: darkMode
                      ? `0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px ${alpha(metric.color, 0.3)}`
                      : `0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px ${alpha(metric.color, 0.2)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <CircularProgressWithLabel
                      value={metric.value}
                      total={metric.total}
                      color={metric.color}
                      label={metric.label}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        color: metric.color,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {metric.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: darkMode ? '#e1e1e1' : '#333',
                      }}
                    >
                      {metric.value}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: '0.8rem',
                    }}
                  >
                    {metric.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ✅ Enhanced Search and Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '16px',
            background: darkMode
              ? alpha("#1a1a2e", 0.6)
              : alpha("#ffffff", 0.8),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2,
          }}>
            <Typography
              variant="h6"
              sx={{
                color: darkMode ? '#e1e1e1' : '#333',
                fontWeight: 'bold',
              }}
            >
              📋 Detailed Results
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search participants..."
                value={searchText}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  minWidth: '250px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                    '& fieldset': {
                      borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: '#ec008c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ec008c',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: darkMode ? '#e1e1e1' : '#333',
                  },
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* ✅ Enhanced Campaign Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            background: darkMode
              ? alpha("#1a1a2e", 0.6)
              : alpha("#ffffff", 0.8),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            overflow: 'hidden',
          }}
        >
          <CampaignTable
            results={filteredAndSortedResults}
            page={page}
            rowsPerPage={rowsPerPage}
            order={order}
            orderBy={orderBy}
            handleRequestSort={handleRequestSort}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            expandedRows={expandedRows}
            setExpandedRows={setExpandedRows}
            detailsExpanded={detailsExpanded}
            setDetailsExpanded={setDetailsExpanded}
            campaignTimeline={campaign?.timeline || []}
          />
        </Paper>

        {/* ✅ Enhanced Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
          onConfirm={handleDeleteCampaign}
          title="Confirm Campaign Deletion"
          description="Are you sure you want to delete this campaign? This action cannot be undone and all associated data will be permanently removed."
        />
      </Box>
    </>
  );
};

export default CampaignResults;
