import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, Paper, alpha } from "@mui/material";
import { Save as SaveIcon, Code as CodeIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

const FullScreenEditor = () => {
  const [content, setContent] = useState("");
  const [lineCount, setLineCount] = useState(1);
  const { darkMode } = useTheme();
  const lineNumbersRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    const savedContent = localStorage.getItem("landingPageHtml");
    setContent(savedContent || "");
  }, []);

  useEffect(() => {
    const lines = content.split('\n').length;
    setLineCount(lines);
  }, [content]);

  const handleSaveAndClose = () => {
    localStorage.setItem("landingPageHtml", content);
    toast.success("✅ Content saved successfully!");
    window.close();
  };

  // Sync scrolling between line numbers and textarea
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundColor: darkMode ? '#101021' : '#f7f7f9',
        display: "flex",
        flexDirection: "column",
        p: 2,
        boxSizing: 'border-box'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: '16px',
          backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.7),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: darkMode ? 'grey.100' : 'grey.900' // Fixed color for dark mode
          }}
        >
          <CodeIcon /> Full Screen HTML Editor
        </Typography>
        <Button
          onClick={handleSaveAndClose}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{
            background: `linear-gradient(135deg, #ec008c, #fc6767)`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "12px",
          }}
        >
          Save & Close
        </Button>
      </Paper>

      <Box
        sx={{
            flexGrow: 1,
            display: 'flex',
            backgroundColor: darkMode ? '#0f0f1a' : '#ffffff',
            borderRadius: '16px',
            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            overflow: 'hidden',
            fontFamily: 'monospace',
        }}
      >
        {/* Line Numbers */}
        <Box
            ref={lineNumbersRef}
            component="div"
            sx={{
                p: 2,
                textAlign: 'right',
                color: darkMode ? 'grey.600' : 'grey.400',
                backgroundColor: darkMode ? alpha('#1e1e2f', 0.5) : alpha('#000', 0.02),
                userSelect: 'none',
                overflowY: 'hidden',
                lineHeight: '1.5em',
            }}
        >
            {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
            ))}
        </Box>
        
        {/* Text Area */}
        <Box
            component="textarea"
            ref={textAreaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onScroll={handleScroll}
            placeholder="Paste or edit your HTML here..."
            sx={{
                flexGrow: 1,
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                p: 2,
                fontFamily: "monospace",
                fontSize: '1em',
                lineHeight: '1.5em',
                color: darkMode ? 'grey.200' : 'grey.900',
                backgroundColor: 'transparent',
                caretColor: darkMode ? '#ec008c' : '#ec008c',
                '&::placeholder': {
                    color: darkMode ? 'grey.700' : 'grey.500',
                },
                // Custom Scrollbar Styling
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: darkMode ? '#2e2e42' : '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: darkMode ? '#555' : '#888',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: darkMode ? '#777' : '#555',
                },
            }}
        />
      </Box>
    </Box>
  );
};

export default FullScreenEditor;
