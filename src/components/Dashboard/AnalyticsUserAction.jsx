import { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';
import React from 'react';
const margin = { right: 24 };
const uData = [0, 1, 2, 3, 4, 5, 6];
const pData = [0, 3, 1, 2, 4, 5, 2];
const xLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'];

export default function AnalyticsUserAction({ darkMode = false }) {
  const [qData, setQData] = useState([0, 200, 400, 600, 898, 1800, 2500]);
  let ymin = 0, ymax = 6;

  const chartTheme = {
    axis: {
      tickLabel: {
        color: darkMode ? '#ffffff' : '#000000',
      },
      line: {
        color: darkMode ? '#ffffff' : '#333333',
      },
    },
    grid: {
      line: {
        color: darkMode ? '#ffffff33' : '#cccccc',
      },
    },
  };

  <LineChart
    height={300}
    series={[
      { data: pData, label: 'Mails Sent', color: localStorage.getItem('primaryColor') },
      { data: uData, label: 'Trainings Done', color: localStorage.getItem('secondaryColor') },
      { data: qData, label: 'Quizzes Completed', color: '#ffc0cb' },
    ]}
    xAxis={[{ scaleType: 'point', data: xLabels }]}
    yAxis={[{ width: 50, min: ymin, max: ymax }]}
    margin={margin}
    theme={chartTheme}
  />

  return (
    <div
      style={{
        backgroundColor: darkMode ? '#1e1e1e' : '#fff',
        color: darkMode ? '#f5f5f5' : '#000',
        padding: '1rem',
        borderRadius: '8px',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >

      {/* Inline style fixes for MUI X Charts */}
      <style>{`
        .dark .MuiChartsAxis-tickLabel {
          fill: #ffffff !important;
        }
        .dark .MuiChartsAxis-line {
          stroke: #ffffff !important;
        }
        .dark .MuiChartsGrid-line {
          stroke: #ffffff33 !important;
        }
      `}</style>

      
      <div>
        <h2 style={{ color: darkMode ? '#fff' : '#000' }}>Quiz and Training Tracking</h2>
        <h3 style={{ color: darkMode ? '#ccc' : '#333' }}>(+43%) than last year</h3>
      </div>

      <LineChart
        height={300}
        series={[
          { data: pData, label: 'Mails Sent', color: localStorage.getItem('primaryColor'),  },
          { data: uData, label: 'Trainings Done', color: localStorage.getItem('secondaryColor') },
          { data: qData, label: 'Quizzes Completed', color: '#ffc0cb' },
        ]}
        xAxis={[{ scaleType: 'point', data: xLabels }]}
        yAxis={[{ width: 50, min: ymin, max: ymax }]}
        margin={margin}
        theme={chartTheme}
      />
    </div>
  );
}
