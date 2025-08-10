import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";

const CircularProgressWithLabel = ({ value, total, color, label }) => {
  const { darkMode } = useTheme();
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={120} height={120}>
        {/* Background circle */}
        <circle
          cx={60}
          cy={60}
          r={radius}
          stroke={darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          strokeWidth={8}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={60}
          cy={60}
          r={radius}
          stroke={color}
          strokeWidth={8}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '60px 60px',
            transition: 'stroke-dashoffset 0.3s ease',
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            color: darkMode ? '#e1e1e1' : '#333',
            fontWeight: 'bold',
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: darkMode ? '#ccc' : '#666',
            fontSize: '0.7rem',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {Math.round(percentage)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;
