import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { toast } from "react-toastify";

const pink = "#ec008c";

const inputStyle = {
  transition: "all 0.3s ease",
  "& label.Mui-focused": { color: pink },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused fieldset": {
      borderColor: pink,
      boxShadow: "0 0 0 0.15rem rgba(236, 0, 140, 0.25)",
    },
    "&:hover fieldset": { borderColor: pink },
  },
};

const NewLandingPageModal = ({ open, onClose, onSave, pageToEdit = null }) => {
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [captureData, setCaptureData] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    if (pageToEdit) {
      setName(pageToEdit.name || "");
      setHtml(pageToEdit.html || "");
      setCaptureData(pageToEdit.capture_credentials || false);
      setRedirectUrl(pageToEdit.redirect_url || "");
    } else {
      setName("");
      setHtml("");
      setCaptureData(false);
      setRedirectUrl("");
    }
  }, [pageToEdit, open]);

  const handleSave = () => {
    if (!name.trim() || !html.trim()) {
      toast.warning("⚠️ Please fill in both Name and HTML content.");
      return;
    }

    const pageData = {
      name,
      html,
      capture_credentials: captureData,
      redirect_url: redirectUrl,
    };

    try {
      if (pageToEdit && pageToEdit.id) {
        onSave({ ...pageData, id: pageToEdit.id }, "edit");
        toast.success("✅ Landing page updated successfully!");
      } else {
        onSave(pageData, "create");
        toast.success("✅ Landing page created successfully!");
      }
      onClose();
    } catch (err) {
      console.error("Landing Page Save Error:", err);
      toast.error("❌ Failed to save landing page.");
    }
  };

  const handleImportSite = () => {
    toast.info("🚧 Import Site functionality is under development.");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "900px",
          height: "900px",
          maxHeight: "90vh",
          borderRadius: "16px",
          border: "2px solid #ec008c30",
          boxShadow: "0 8px 24px rgba(236, 0, 140, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: pink,
          borderBottom: "1px solid #f8c6dd",
          backgroundColor: "#fff0f7",
        }}
      >
        {pageToEdit ? "✏️ Edit Landing Page" : "🌐 New Landing Page"}
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter landing page name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={inputStyle}
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleImportSite}
            sx={{
              backgroundColor: pink,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 1,
              px: 2,
              py: 1,
              textTransform: "none",
              alignSelf: "flex-start",
              "&:hover": {
                backgroundColor: "#d6007a",
              },
            }}
          >
            IMPORT SITE
          </Button>

          <Box>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              HTML Content
            </Typography>
            <TextField
              multiline
              minRows={6}
              placeholder="Paste your HTML content here..."
              fullWidth
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              sx={{
                ...inputStyle,
                "& .MuiOutlinedInput-root": {
                  ...inputStyle["& .MuiOutlinedInput-root"],
                  minHeight: "340px",
                  alignItems: "flex-start",
                },
                "& textarea": { height: "100% !important" },
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={captureData}
                onChange={(e) => setCaptureData(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: pink },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: pink,
                  },
                }}
              />
            }
            label="Capture Submitted Data"
          />

          <Box>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              Redirect URL
            </Typography>
            <TextField
              fullWidth
              placeholder="http://example.com"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              sx={inputStyle}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#374151",
            borderColor: "#d1d5db",
            fontWeight: "bold",
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #ec4899, #d946ef)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 1,
            textTransform: "none",
            boxShadow: 1,
            "&:hover": {
              background: "linear-gradient(to right, #db2777, #c026d3)",
            },
          }}
        >
          {pageToEdit ? "UPDATE PAGE" : "SAVE PAGE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewLandingPageModal;
