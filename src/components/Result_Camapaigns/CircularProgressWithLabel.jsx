import React from "react";
import { Box, Typography } from "@mui/material";

const CircularProgressWithLabel = ({ value, total, color, label }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ position: "relative", width: 96, height: 96 }}>
        <svg style={{ width: 96, height: 96, transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "all 0.3s ease-in-out" }}
          />
        </svg>
        {/* Center text */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {value}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;