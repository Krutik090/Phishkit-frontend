import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  MailOutline,
  Visibility,
  Link,
  Description,
  Warning,
  Quiz,
  CheckCircle,
  School,
  People,
  TrendingUp,
  Download,
  Search
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

const AdvancedDashboard = () => {
  const { darkMode } = useTheme();
  
  // State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [trainingModules, setTrainingModules] = useState([]);
  const [quizAnalytics, setQuizAnalytics] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [selectedProject, setSelectedProject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Theme colors based on your existing theme context
  const primaryColor = localStorage.getItem("primaryColor") || "#1976d2";
  const secondaryColor = localStorage.getItem("secondaryColor") || "#dc004e";
  
  const colors = {
    primary: primaryColor,
    success: '#2e7d32',
    warning: '#ed6c02',
    danger: '#d32f2f',
    info: '#0288d1',
    dark: '#424242'
  };

  const theme = {
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#1e1e2f' : '#f5f5f5',
        paper: darkMode ? '#2d2d44' : '#ffffff'
      },
      text: {
        primary: darkMode ? '#ffffff' : '#333333',
        secondary: darkMode ? '#ffffffcc' : '#666666'
      }
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async (projectName = 'All') => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graph/graph-data?projectName=${projectName}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setLoading(false);
  };

  // Fetch user details
  const fetchUserDetails = async (projectName = 'All') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graph/user-details?projectName=${projectName}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setUserDetails(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  // Fetch training analytics
  const fetchTrainingAnalytics = async (projectName = 'All') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graph/training-analytics?projectName=${projectName}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setTrainingModules(data.modules || []);
    } catch (error) {
      console.error('Failed to fetch training analytics:', error);
    }
  };

  // Fetch timeline data
  const fetchTimelineData = async (projectName = 'All') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graph/timeline-data?projectName=${projectName}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setTimelineData(data.timeline || []);
    } catch (error) {
      console.error('Failed to fetch timeline data:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchDashboardData(selectedProject);
    fetchUserDetails(selectedProject);
    fetchTrainingAnalytics(selectedProject);
    fetchTimelineData(selectedProject);
  }, [selectedProject]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = userDetails.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(userDetails);
    }
    setPage(0); // Reset page when filtering
  }, [searchTerm, userDetails]);

  // KPI Cards data
  const getKpiCards = () => {
    if (!dashboardData) return [];
    
    return [
      {
        title: 'Emails Sent',
        value: dashboardData.emailSent || 0,
        icon: <MailOutline />,
        color: colors.primary
      },
      {
        title: 'Emails Opened',
        value: dashboardData.emailOpened || 0,
        icon: <Visibility />,
        color: colors.success,
        percentage: dashboardData.emailSent ? ((dashboardData.emailOpened / dashboardData.emailSent) * 100).toFixed(1) : 0
      },
      {
        title: 'Links Clicked',
        value: dashboardData.linkClicked || 0,
        icon: <Link />,
        color: colors.warning,
        percentage: dashboardData.emailOpened ? ((dashboardData.linkClicked / dashboardData.emailOpened) * 100).toFixed(1) : 0
      },
      {
        title: 'Data Submitted',
        value: dashboardData.submitted_data || 0,
        icon: <Description />,
        color: colors.danger
      },
      {
        title: 'Phished Users',
        value: dashboardData.phishedUsers || 0,
        icon: <Warning />,
        color: colors.danger
      },
      {
        title: 'Quiz Started',
        value: dashboardData.quizStarted || 0,
        icon: <Quiz />,
        color: colors.info
      },
      {
        title: 'Quiz Completed',
        value: dashboardData.quizCompleted || 0,
        icon: <CheckCircle />,
        color: colors.success,
        percentage: dashboardData.quizStarted ? ((dashboardData.quizCompleted / dashboardData.quizStarted) * 100).toFixed(1) : 0
      },
      {
        title: 'Training Completed',
        value: dashboardData.trainingCompleted || 0,
        icon: <School />,
        color: colors.success,
        percentage: dashboardData.trainingStarted ? ((dashboardData.trainingCompleted / dashboardData.trainingStarted) * 100).toFixed(1) : 0
      }
    ];
  };

  // Chart configurations with theme awareness
  const getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary
        }
      },
      title: {
        display: true,
        text: title,
        color: theme.palette.text.primary
      }
    },
    scales: {
      x: {
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: darkMode ? '#444' : '#e0e0e0'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: theme.palette.text.secondary
        },
        grid: {
          color: darkMode ? '#444' : '#e0e0e0'
        }
      }
    }
  });

  // Campaign Funnel Chart
  const getCampaignFunnelChart = () => {
    if (!dashboardData) return null;

    const data = {
      labels: ['Emails Sent', 'Emails Opened', 'Links Clicked', 'Data Submitted'],
      datasets: [{
        label: 'Campaign Funnel',
        data: [
          dashboardData.emailSent || 0,
          dashboardData.emailOpened || 0,
          dashboardData.linkClicked || 0,
          dashboardData.submitted_data || 0
        ],
        backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger],
        borderWidth: 2,
        borderColor: theme.palette.background.paper
      }]
    };

    return <Bar data={data} options={getChartOptions('Campaign Conversion Funnel')} />;
  };

  // Training Progress Chart
  const getTrainingProgressChart = () => {
    if (!trainingModules || trainingModules.length === 0) return null;

    const data = {
      labels: trainingModules.map(module => module.name),
      datasets: [{
        label: 'Completed',
        data: trainingModules.map(module => module.completed),
        backgroundColor: colors.success,
      }, {
        label: 'Total',
        data: trainingModules.map(module => module.total),
        backgroundColor: colors.primary,
      }]
    };

    return <Bar data={data} options={getChartOptions('Training Module Progress')} />;
  };

  // Quiz Performance Doughnut Chart
  const getQuizPerformanceChart = () => {
    if (!dashboardData) return null;

    const data = {
      labels: ['Completed', 'Started but not completed'],
      datasets: [{
        data: [
          dashboardData.quizCompleted || 0,
          (dashboardData.quizStarted || 0) - (dashboardData.quizCompleted || 0)
        ],
        backgroundColor: [colors.success, colors.warning],
        borderWidth: 2,
        borderColor: theme.palette.background.paper
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme.palette.text.primary
          }
        },
        title: {
          display: true,
          text: 'Quiz Completion Status',
          color: theme.palette.text.primary
        }
      }
    };

    return <Doughnut data={data} options={options} />;
  };

  // Activity Timeline Chart
  const getActivityTimelineChart = () => {
    if (!timelineData || timelineData.length === 0) return null;

    const data = {
      labels: timelineData.map(item => item.date),
      datasets: [{
        label: 'Emails Sent',
        data: timelineData.map(item => item.emailsSent || 0),
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
        fill: false
      }, {
        label: 'Emails Opened',
        data: timelineData.map(item => item.emailsOpened || 0),
        borderColor: colors.success,
        backgroundColor: colors.success + '20',
        fill: false
      }, {
        label: 'Links Clicked',
        data: timelineData.map(item => item.linksClicked || 0),
        borderColor: colors.warning,
        backgroundColor: colors.warning + '20',
        fill: false
      }]
    };

    return <Line data={data} options={getChartOptions('Activity Timeline')} />;
  };

  // Export data
  const exportData = (format) => {
    if (format === 'csv') {
      const headers = ['Email', 'Email Opened', 'Link Clicked', 'Data Submitted', 'Quiz Score', 'Training Progress', 'Risk Level'];
      const csvContent = [
        headers.join(','),
        ...filteredUsers.map(user => [
          user.email,
          user.emailOpened ? 'Yes' : 'No',
          user.linkClicked ? 'Yes' : 'No',
          user.dataSubmitted ? 'Yes' : 'No',
          user.quizScore || 'N/A',
          `${user.trainingModules || 0}/${user.totalModules || 3}`,
          user.riskLevel || 'Low'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `phishing-campaign-data-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get risk level color
  const getRiskLevelColor = (risk) => {
    switch (risk) {
      case 'High': return colors.danger;
      case 'Medium': return colors.warning;
      case 'Low': return colors.success;
      default: return colors.info;
    }
  };

  return (
    <Box 
      sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        color: theme.palette.text.primary
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1" sx={{ color: primaryColor, fontWeight: 'bold' }}>
              Phishing Campaign Analytics Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
              Comprehensive security awareness training analytics
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Project"
                  sx={{ 
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary
                  }}
                >
                  <MenuItem value="All">All Projects</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportData('csv')}
                sx={{ 
                  borderColor: primaryColor, 
                  color: primaryColor,
                  '&:hover': {
                    borderColor: primaryColor,
                    backgroundColor: primaryColor + '10'
                  }
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {getKpiCards().map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 'bold' }}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {kpi.title}
                    </Typography>
                    {kpi.percentage && (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {kpi.percentage}%
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ color: kpi.color }}>
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ height: '350px' }}>
                {getCampaignFunnelChart()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ height: '350px' }}>
                {getQuizPerformanceChart()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ height: '350px' }}>
                {getTrainingProgressChart()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ height: '350px' }}>
                {getActivityTimelineChart()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Toggle */}
      <Card sx={{ backgroundColor: theme.palette.background.paper, mb: showTable ? 3 : 0 }}>
        <CardContent>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">Detailed User Activity</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Individual user performance and risk assessment
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {showTable && (
                  <TextField
                    size="small"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    }}
                    sx={{ width: 250 }}
                  />
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={showTable}
                      onChange={(e) => setShowTable(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: primaryColor,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: primaryColor,
                        },
                      }}
                    />
                  }
                  label="Show Details"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Details Table */}
      {showTable && (
        <Card sx={{ backgroundColor: theme.palette.background.paper }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: darkMode ? '#333' : '#f5f5f5' }}>
                  <TableCell>User</TableCell>
                  <TableCell>Email Status</TableCell>
                  <TableCell>Link Clicked</TableCell>
                  <TableCell>Data Submitted</TableCell>
                  <TableCell>Quiz Score</TableCell>
                  <TableCell>Training Progress</TableCell>
                  <TableCell>Risk Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <People />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user.email}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.emailOpened ? 'Opened' : 'Not Opened'}
                          color={user.emailOpened ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.linkClicked ? 'Yes' : 'No'}
                          color={user.linkClicked ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.dataSubmitted ? 'Yes' : 'No'}
                          color={user.dataSubmitted ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.quizScore ? `${user.quizScore}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={user.trainingModules && user.totalModules 
                              ? (user.trainingModules / user.totalModules) * 100 
                              : 0}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              backgroundColor: darkMode ? '#555' : '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: colors.success
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {user.trainingModules || 0} / {user.totalModules || 3} modules
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.riskLevel || 'Low'}
                          sx={{
                            backgroundColor: getRiskLevelColor(user.riskLevel) + '20',
                            color: getRiskLevelColor(user.riskLevel),
                            fontWeight: 'bold'
                          }}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
              '& .MuiTablePagination-toolbar': {
                color: theme.palette.text.primary
              }
            }}
          />
        </Card>
      )}
    </Box>
  );
};

export default AdvancedDashboard;