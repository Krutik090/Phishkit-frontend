import React, { useState, useEffect } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { toast } from "react-toastify";

const pink = "#ec008c";

const FullScreenEditor = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const savedContent = localStorage.getItem("landingPageHtml");
    setContent(savedContent || "");
  }, []);

  const handleSaveAndClose = () => {
    localStorage.setItem("landingPageHtml", content);
    toast.success("✅ Content saved successfully!");
    window.close();
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "90vh",
        backgroundColor: "#f5f5fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ color: pink, mb: 2, textAlign: "center" }}
      >
        📝 Full Screen Landing Page Editor
      </Typography>

      <TextField
        fullWidth
        multiline
        minRows={20}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste or edit your HTML here"
        variant="outlined"
        sx={{
          flexGrow: 1,
          fontFamily: "monospace",
          backgroundColor: "#fff",
          borderRadius: 1,
          "& .MuiOutlinedInput-root": {
            height: "100%",
          },
        }}
      />

      <Box mt={2} textAlign="center">
        <Button
          onClick={handleSaveAndClose}
          variant="contained"
          sx={{
            px: 4,
            background: `linear-gradient(to right, ${pink}, #d946ef)`,
          }}
        >
          Save & Close
        </Button>
      </Box>
    </Box>
  );
};

export default FullScreenEditor;
