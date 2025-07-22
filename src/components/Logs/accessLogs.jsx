import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

const AccessLogs = () => {
  const [search, setSearch] = useState("");

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2} sx={{ color: "#EC008C", letterSpacing: 1, borderBottom: "2px solid #EC008C", pb: 1, mb: 3 }}>
        Access Logs
      </Typography>
      <TextField
        label="Search logs"
        variant="outlined"
        fullWidth
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />
      <Button variant="contained" color="primary" sx={{ mb: 2, mr: 2 }}>Add Demo Click Log</Button>
      <Button variant="outlined" color="secondary" sx={{ mb: 2 }}>Clear Logs</Button>
      <Box sx={{
        backgroundColor: '#181818',
        color: '#00FF00',
        fontFamily: 'monospace',
        borderRadius: 2,
        boxShadow: 2,
        p: 2,
        minHeight: 300,
        mt: 2,
        maxHeight: 500,
        overflowY: 'auto',
      }}>
        {/* Only keep the style, no log rendering or functionality */}
      </Box>
    </Box>
  );
};

export default AccessLogs;
