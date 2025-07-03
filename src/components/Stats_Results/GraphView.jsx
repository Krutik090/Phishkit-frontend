import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

const dummyHourlyData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 500));
const dummyHourlyLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
const dummyDailyLabels = ["03-06-2025", "04-06-2025", "05-06-2025", "06-06-2025"];
const dummyDailyData = [100, 210, 160, 130];
const departments = ["Accounts", "HR", "IT", "Finance", "Marketing", "Sales", "Operations"];
const userCounts = [120, 95, 300, 180, 260, 340, 220];
const maxUserCount = 400;

const metrics = [
  { label: "Phished Users", value: 27 },
  { label: "Total Departments", value: 40 },
  { label: "Delivered Emails", value: 27 },
  { label: "Opned Emails", value: 27 },
  { label: "Data Submitted", value: 10 },
  { label: "Report Phishing Email", value: <strong>Account</strong> },
  { label: "Phished Ratio", value: "64%" },
  { label: "Click Ratio", value: "86%" },
  { label: "Knowledge Gain", value: "+34%" },
  { label: "Most Location", value: <strong>Ahmedabad</strong> },
  { label: "Most Department", value: <strong>Account</strong> },
  { label: "Day of Highest Phished", value: <strong>30-5-2025</strong> },
];

const GraphView = () => {
  const hourlyChartRef = useRef(null);
  const dailyChartRef = useRef(null);
  const deptChartRef = useRef(null);
  const [filterValue, setFilterValue] = useState("all");

  const filteredUserCounts = () =>
    userCounts.map((val) => {
      const percent = (val / maxUserCount) * 100;
      switch (filterValue) {
        case "100":
          return percent === 100 ? val : 0;
        case "50-99":
          return percent >= 50 && percent < 100 ? val : 0;
        case "10-49":
          return percent >= 10 && percent < 50 ? val : 0;
        case "lt10":
          return percent < 10 ? val : 0;
        default:
          return val;
      }
    });

  useEffect(() => {
    const hourlyChart = new Chart(hourlyChartRef.current, {
      type: "line",
      data: {
        labels: dummyHourlyLabels,
        datasets: [
          {
            label: "Users Phished (Hourly)",
            data: dummyHourlyData,
            borderColor: "#EC008C",
            backgroundColor: "#EC008C",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { usePointStyle: true } },
        },
        elements: { point: { radius: 3 } },
        scales: {
          x: { ticks: { maxRotation: 45, minRotation: 45 }, grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    });

    const dailyChart = new Chart(dailyChartRef.current, {
      type: "line",
      data: {
        labels: dummyDailyLabels,
        datasets: [
          {
            label: "Users Phished (Daily)",
            data: dummyDailyData,
            borderColor: "#EC008C",
            backgroundColor: "#EC008C",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { usePointStyle: true } },
        },
        elements: { point: { radius: 3 } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    });

    const deptChart = new Chart(deptChartRef.current, {
      type: "bar",
      data: {
        labels: departments,
        datasets: [
          {
            data: Array(departments.length).fill(maxUserCount),
            backgroundColor: "rgba(0, 123, 255, 0.2)",
            borderRadius: 50,
            barThickness: 28,
            categoryPercentage: 0.9,
            barPercentage: 0.9,
            borderSkipped: false,
          },
          {
            label: "User Count",
            data: filteredUserCounts(),
            backgroundColor: "rgba(0, 123, 255, 0.9)",
            borderRadius: 50,
            barThickness: 28,
            categoryPercentage: 0.9,
            barPercentage: 0.9,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Users: ${ctx.raw}`,
            },
          },
          datalabels: {
            anchor: "end",
            align: "end",
            formatter: (val) => (val > 0 ? val : ""),
            font: { weight: "bold" },
          },
        },
        scales: {
          y: { beginAtZero: true, max: maxUserCount, ticks: { stepSize: 50 } },
          x: { grid: { display: false }, stacked: true },
        },
      },
      plugins: [ChartDataLabels],
    });

    return () => {
      hourlyChart.destroy();
      dailyChart.destroy();
      deptChart.destroy();
    };
  }, []);

  useEffect(() => {
    const chart = Chart.getChart(deptChartRef.current);
    if (chart) {
      chart.data.datasets[1].data = filteredUserCounts();
      chart.update();
    }
  }, [filterValue]);

  return (
    <Box p={2}>
      {/* Metrics */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3} justifyContent="space-between">
        {metrics.map((item, idx) => (
          <Paper
            key={idx}
            elevation={1}
            sx={{
              flex: "1 1 calc(14% - 16px)",
              minWidth: 140,
              padding: 2,
              minHeight: 100,
              backgroundColor: "#fff0f5",
              borderRadius: "12px",
              border: "2px solid #EC008C",
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {item.label}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Charts */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Hourly + Daily */}
        <Box flex="1 1 48%" display="flex" flexDirection="column" gap={3}>
          <Paper sx={{ borderRadius: "12px", border: "2px solid #EC008C", p: 1, height: 280 }}>
            <canvas ref={hourlyChartRef} style={{ width: "100%", height: "100%" }} />
          </Paper>

          <Paper sx={{ borderRadius: "12px", border: "2px solid #EC008C", p: 1, height: 280 }}>
            <canvas ref={dailyChartRef} style={{ width: "100%", height: "100%" }} />
          </Paper>
        </Box>

        {/* Department-wise */}
        <Box flex="1 1 48%" display="flex" flexDirection="column">
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="100">100%</MenuItem>
                <MenuItem value="50-99">50–99%</MenuItem>
                <MenuItem value="10-49">10–49%</MenuItem>
                <MenuItem value="lt10">&lt;10%</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Paper sx={{ borderRadius: "12px", border: "2px solid #EC008C", p: 1, height: 500 }}>
            <canvas ref={deptChartRef} style={{ width: "100%", height: "100%" }} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default GraphView;
