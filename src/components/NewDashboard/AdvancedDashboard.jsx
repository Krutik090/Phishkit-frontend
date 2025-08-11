import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  alpha,
  Stack,
  Divider,
  Card,
  CardContent,
  Skeleton,
  IconButton,
  Badge,
} from '@mui/material';
import {
  MailOutline,
  Visibility,
  Link as LinkIcon,
  Description,
  Warning,
  Quiz,
  CheckCircle,
  School,
  People,
  Download,
  BarChart,
  PieChart,
  Timeline,
  Assessment,
  Person,
  Security,
  Speed,
  TrendingUp,
  TrendingDown,
  AccessTime,
  Refresh,
  FilterList,
  ShowChart,
  NotificationsActive,
  Campaign,
  Analytics,
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
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Line, Radar, PolarArea } from 'react-chartjs-2';
import { advancedToast } from '../../utils/toast';

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
  Filler,
  RadialLinearScale
);

const AdvancedDashboard = () => {
  const { darkMode } = useTheme();
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const primaryColor = localStorage.getItem('primaryColor') || '#ec008c';

  const colors = {
    primary: primaryColor,
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3',
    purple: '#9c27b0',
    teal: '#009688',
    indigo: '#3f51b5',
  };

  // ✅ Dummy Data for Dashboard
  const dummyDashboardData = {
    totalCampaigns: 24,
    emailSent: 15420,
    emailOpened: 8932,
    linkClicked: 3456,
    submitted_data: 1234,
    emailReported: 789,
    quizStarted: 6789,
    quizCompleted: 5432,
    quizPassed: 4321,
    trainingStarted: 7890,
    trainingCompleted: 6543,
    securityScore: 78,
    totalUsers: 9876,
    activeCampaigns: 8,
    pendingAlerts: 12,
    timeline: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      emailsSent: [2100, 2400, 2200, 2800, 3200, 2900, 3100],
      linksClicked: [450, 520, 480, 620, 720, 650, 680],
      dataSubmitted: [120, 180, 150, 220, 280, 240, 260],
    },
    risks: {
      phishingSusceptibility: 65,
      passwordSecurity: 78,
      emailSecurity: 82,
      socialEngineering: 58,
      deviceSecurity: 75,
      trainingCompliance: 88,
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    advancedToast.info(
      "Refreshing dashboard data...",
      "Refreshing",
      { icon: "🔄" }
    );
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      advancedToast.success(
        "Dashboard data refreshed successfully!",
        "Dashboard Updated",
        { icon: "✅" }
      );
    }, 2000);
  };

  // ✅ Enhanced KPI Cards with dummy data
  const kpiCards = useMemo(() => [
    {
      title: 'Total Campaigns',
      value: dummyDashboardData.totalCampaigns,
      icon: <Assessment />,
      color: colors.primary,
      trend: '+12%',
      description: 'Active campaigns'
    },
    {
      title: 'Emails Sent',
      value: dummyDashboardData.emailSent.toLocaleString(),
      icon: <MailOutline />,
      color: colors.info,
      trend: '+8%',
      description: 'Total delivered'
    },
    {
      title: 'Engagement Rate',
      value: `${((dummyDashboardData.emailOpened / dummyDashboardData.emailSent) * 100).toFixed(1)}%`,
      icon: <Visibility />,
      color: colors.success,
      trend: '-2%',
      description: 'Email opens'
    },
    {
      title: 'Click-through Rate',
      value: `${((dummyDashboardData.linkClicked / dummyDashboardData.emailOpened) * 100).toFixed(1)}%`,
      icon: <LinkIcon />,
      color: colors.warning,
      trend: '+5%',
      description: 'Link clicks'
    },
    {
      title: 'Susceptibility Rate',
      value: `${((dummyDashboardData.submitted_data / dummyDashboardData.emailSent) * 100).toFixed(1)}%`,
      icon: <Security />,
      color: colors.danger,
      trend: '-15%',
      description: 'Data submitted'
    },
    {
      title: 'Training Completion',
      value: `${((dummyDashboardData.trainingCompleted / dummyDashboardData.trainingStarted) * 100).toFixed(1)}%`,
      icon: <School />,
      color: colors.success,
      trend: '+23%',
      description: 'Training done'
    },
    {
      title: 'Quiz Pass Rate',
      value: `${((dummyDashboardData.quizPassed / dummyDashboardData.quizCompleted) * 100).toFixed(1)}%`,
      icon: <Quiz />,
      color: colors.purple,
      trend: '+18%',
      description: 'Quiz success'
    },
    {
      title: 'Security Score',
      value: dummyDashboardData.securityScore,
      icon: <Speed />,
      color: colors.teal,
      trend: '+7%',
      description: 'Overall rating'
    },
  ], [colors]);

  // ✅ Chart Data with dummy data
  const funnelChartData = {
    labels: ['Emails Sent', 'Emails Opened', 'Links Clicked', 'Data Submitted', 'Reported'],
    datasets: [{
      label: 'Campaign Funnel',
      data: [
        dummyDashboardData.emailSent,
        dummyDashboardData.emailOpened,
        dummyDashboardData.linkClicked,
        dummyDashboardData.submitted_data,
        dummyDashboardData.emailReported
      ],
      backgroundColor: [colors.info, colors.success, colors.warning, colors.danger, colors.purple],
      borderColor: darkMode ? '#1a1a2e' : '#ffffff',
      borderWidth: 2,
    }]
  };

  const timelineChartData = {
    labels: dummyDashboardData.timeline.labels,
    datasets: [
      {
        label: 'Emails Sent',
        data: dummyDashboardData.timeline.emailsSent,
        borderColor: colors.primary,
        backgroundColor: alpha(colors.primary, 0.1),
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
      },
      {
        label: 'Links Clicked',
        data: dummyDashboardData.timeline.linksClicked,
        borderColor: colors.warning,
        backgroundColor: alpha(colors.warning, 0.1),
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.warning,
      },
      {
        label: 'Data Submitted',
        data: dummyDashboardData.timeline.dataSubmitted,
        borderColor: colors.danger,
        backgroundColor: alpha(colors.danger, 0.1),
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.danger,
      }
    ]
  };

  const riskRadarData = {
    labels: ['Phishing Susceptibility', 'Password Security', 'Email Security', 'Social Engineering', 'Device Security', 'Training Compliance'],
    datasets: [{
      label: 'Organization Risk Profile',
      data: [
        dummyDashboardData.risks.phishingSusceptibility,
        dummyDashboardData.risks.passwordSecurity,
        dummyDashboardData.risks.emailSecurity,
        dummyDashboardData.risks.socialEngineering,
        dummyDashboardData.risks.deviceSecurity,
        dummyDashboardData.risks.trainingCompliance,
      ],
      backgroundColor: alpha(colors.danger, 0.2),
      borderColor: colors.danger,
      borderWidth: 2,
      pointBackgroundColor: colors.danger,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colors.danger
    }]
  };

  const completionDonutData = {
    labels: ['Quiz Completed', 'Training Completed', 'Pending'],
    datasets: [{
      data: [
        dummyDashboardData.quizCompleted,
        dummyDashboardData.trainingCompleted,
        dummyDashboardData.totalUsers - dummyDashboardData.quizCompleted - dummyDashboardData.trainingCompleted
      ],
      backgroundColor: [colors.success, colors.info, colors.warning],
      borderColor: darkMode ? '#1a1a2e' : '#ffffff',
      borderWidth: 3,
      hoverOffset: 10,
    }]
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e1e1e1' : '#333',
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: darkMode ? alpha('#1a1a2e', 0.9) : alpha('#ffffff', 0.9),
        titleColor: darkMode ? '#e1e1e1' : '#333',
        bodyColor: darkMode ? '#ccc' : '#666',
        borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? '#ccc' : '#666' },
        grid: { 
          color: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1),
          drawBorder: false,
        }
      },
      y: {
        ticks: { color: darkMode ? '#ccc' : '#666' },
        grid: { 
          color: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1),
          drawBorder: false,
        }
      }
    }
  }), [darkMode]);

  const radarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e1e1e1' : '#333',
          usePointStyle: true,
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)
        },
        grid: {
          color: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)
        },
        pointLabels: {
          color: darkMode ? '#ccc' : '#666',
          font: { size: 12 }
        },
        ticks: {
          color: darkMode ? '#999' : '#888',
          backdropColor: 'transparent'
        },
        min: 0,
        max: 100,
      }
    }
  }), [darkMode]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* ✅ Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '20px',
          backgroundColor: darkMode ? alpha('#1e1e2f', 0.8) : alpha('#ffffff', 0.9),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.info})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              <Assessment sx={{ fontSize: '2rem', color: colors.primary }} />
              Advanced Analytics Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: darkMode ? '#ccc' : '#666' }}
            >
              Comprehensive security awareness analytics and insights
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="24h">Last 24 hours</MenuItem>
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                  <MenuItem value="90d">Last 3 months</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Project"
                >
                  <MenuItem value="All">All Projects</MenuItem>
                  <MenuItem value="Project Alpha">Project Alpha</MenuItem>
                  <MenuItem value="Project Beta">Project Beta</MenuItem>
                  <MenuItem value="Project Gamma">Project Gamma</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                startIcon={<Refresh />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.info})`,
                  color: '#fff',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${colors.info}, ${colors.primary})`,
                  },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* ✅ Enhanced KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
                backdropFilter: 'blur(12px)',
                border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                height: '140px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode 
                    ? `0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px ${alpha(kpi.color, 0.3)}` 
                    : `0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px ${alpha(kpi.color, 0.2)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666', mb: 1 }}>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: darkMode ? '#e1e1e1' : '#333' }}>
                    {kpi.value}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(kpi.color, 0.15),
                    color: kpi.color,
                    width: 48,
                    height: 48,
                  }}
                >
                  {kpi.icon}
                </Avatar>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: darkMode ? '#999' : '#777' }}>
                  {kpi.description}
                </Typography>
                <Chip
                  label={kpi.trend}
                  size="small"
                  icon={kpi.trend.startsWith('+') ? <TrendingUp /> : <TrendingDown />}
                  sx={{
                    backgroundColor: kpi.trend.startsWith('+') 
                      ? alpha(colors.success, 0.1) 
                      : alpha(colors.danger, 0.1),
                    color: kpi.trend.startsWith('+') ? colors.success : colors.danger,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ✅ Main Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Campaign Funnel Chart */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              height: 400,
              p: 3,
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: darkMode ? '#e1e1e1' : '#333',
              }}
            >
              <BarChart sx={{ color: colors.primary }} />
              Campaign Funnel Analysis
            </Typography>
            <Bar data={funnelChartData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Timeline Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              height: 400,
              p: 3,
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: darkMode ? '#e1e1e1' : '#333',
              }}
            >
              <Timeline sx={{ color: colors.info }} />
              Campaign Activity Timeline
            </Typography>
            <Line data={timelineChartData} options={chartOptions} />
          </Paper>
        </Grid>
      </Grid>

      {/* ✅ Advanced Analytics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Risk Assessment Radar */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              height: 400,
              p: 3,
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: darkMode ? '#e1e1e1' : '#333',
              }}
            >
              <Security sx={{ color: colors.danger }} />
              Security Risk Assessment
            </Typography>
            <Radar data={riskRadarData} options={radarOptions} />
          </Paper>
        </Grid>

        {/* Completion Rates Doughnut */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              height: 400,
              p: 3,
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: darkMode ? '#e1e1e1' : '#333',
              }}
            >
              <PieChart sx={{ color: colors.success }} />
              Training & Quiz Completion
            </Typography>
            <Doughnut data={completionDonutData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'right',
                  labels: {
                    color: darkMode ? '#e1e1e1' : '#333',
                    usePointStyle: true,
                    padding: 20,
                  }
                }
              },
              scales: {},
            }} />
          </Paper>
        </Grid>
      </Grid>

      {/* ✅ Required Action Widgets Grid - MAINTAINED AS REQUESTED */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              height: 200,
              p: 3,
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 32px ${alpha(colors.danger, 0.2)}`,
              },
            }}
          >
            <Badge badgeContent={12} color="error">
              <Warning sx={{ fontSize: 48, color: colors.danger, mb: 2 }} />
            </Badge>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: darkMode ? '#e1e1e1' : '#333' }}>
              Security Alerts
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666', mb: 2 }}>
              Monitor critical security incidents and threats
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: colors.danger,
                '&:hover': { backgroundColor: alpha(colors.danger, 0.8) },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
              onClick={() => advancedToast.info("Opening security alerts...", "Security Alerts", { icon: "🚨" })}
            >
              View Alerts
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              height: 200,
              p: 3,
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 32px ${alpha(colors.primary, 0.2)}`,
              },
            }}
          >
            <ShowChart sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: darkMode ? '#e1e1e1' : '#333' }}>
              Advanced Reports
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666', mb: 2 }}>
              Generate detailed analytics and compliance reports
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: colors.primary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.8) },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
              onClick={() => advancedToast.info("Generating advanced report...", "Report Generator", { icon: "📊" })}
            >
              Generate Report
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              height: 200,
              p: 3,
              backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.8),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 32px ${alpha(colors.info, 0.2)}`,
              },
            }}
          >
            <People sx={{ fontSize: 48, color: colors.info, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: darkMode ? '#e1e1e1' : '#333' }}>
              User Management
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666', mb: 2 }}>
              Manage users, roles, and training assignments
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: colors.info,
                '&:hover': { backgroundColor: alpha(colors.info, 0.8) },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
              onClick={() => advancedToast.info("Opening user management...", "User Management", { icon: "👥" })}
            >
              Manage Users
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedDashboard;
