import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

const PINK = localStorage.getItem('primaryColor');
const GRADIENT = `linear-gradient(to right, ${PINK}, ${localStorage.getItem('secondaryColor')})`;

const inputStyle = {
  transition: "all 0.3s ease",
  "& label.Mui-focused": { color: PINK },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused fieldset": {
      borderColor: PINK,
      boxShadow: "0 0 0 0.15rem rgba(236, 0, 140, 0.25)",
    },
    "&:hover fieldset": { borderColor: PINK },
  },
};

const NewLandingPageModal = ({ open, onClose, onSave, pageToEdit = null }) => {
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [captureData, setCaptureData] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const editorRef = useRef(null);

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

  const handleSave = useCallback(() => {
    const content = editorRef.current?.getContent?.() || html;

    if (!name.trim() || !content.trim()) {
      toast.warning("⚠️ Please fill in both Name and HTML content.");
      return;
    }

    const pageData = {
      name,
      html: content,
      capture_credentials: captureData,
      redirect_url: redirectUrl,
    };

    try {
      if (pageToEdit?.id) {
        onSave({ ...pageData, id: pageToEdit.id }, "edit");
        toast.success("Landing page updated successfully!");
      } else {
        onSave(pageData, "create");
        toast.success("Landing page created successfully!");
      }
      onClose();
    } catch (err) {
      console.error("Landing Page Save Error:", err);
      toast.error("❌ Failed to save landing page.");
    }
  }, [name, html, captureData, redirectUrl, onSave, onClose, pageToEdit]);

  const handleImportSite = () => {
    toast.info("🚧 Import Site functionality is under development.");
  };

  const handleOpenFullscreenEditor = () => {
    localStorage.setItem("landingPageHtml", html);

    const editorWindow = window.open("/fullscreen-editor", "_blank");

    const interval = setInterval(() => {
      if (editorWindow.closed) {
        clearInterval(interval);
        const updatedHtml = localStorage.getItem("landingPageHtml") || "";
        setHtml(updatedHtml);
        localStorage.removeItem("landingPageHtml");
        toast.success("✅ HTML updated from fullscreen editor.");
      }
    }, 500);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: PINK, backgroundColor: "#f5f5f5" }}>
        {pageToEdit ? "✏️ Edit Landing Page" : "🌐 New Landing Page"}
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter landing page name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={inputStyle}
              aria-label="Landing Page Name"
            />
          </Box>

          {/* <Button
            variant="contained"
            onClick={handleImportSite}
            sx={{ backgroundColor: PINK }}
          >
            IMPORT SITE
          </Button> */}

          <Box>
            <Typography variant="body2" fontWeight={500} mb={1}>
              HTML Content
            </Typography>

            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FullscreenIcon />}
                onClick={handleOpenFullscreenEditor}
                aria-label="Open Fullscreen Editor"
              >
                Full Screen Editor
              </Button>
            </Box>

            <Editor
              onInit={(evt, editor) => (editorRef.current = editor)}
              apiKey="o8z0kqre5x0f3nnn3x68nryugconi6gdd9ql2sc12r0wj5ok"
              value={html}
              onEditorChange={(newValue) => setHtml(newValue)}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "anchor", "autolink", "charmap", "codesample", "emoticons",
                  "image", "link", "lists", "media", "searchreplace",
                  "table", "visualblocks", "wordcount",
                ],
                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                  "link image media table mergetags | addcomment showcomments | " +
                  "spellcheckdialog a11ycheck typography | align lineheight | " +
                  "checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                branding: false,
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={captureData}
                onChange={(e) => setCaptureData(e.target.checked)}
                sx={{
                  "& .Mui-checked": { color: PINK },
                  "& .Mui-checked + .MuiSwitch-track": {
                    backgroundColor: PINK,
                  },
                }}
                aria-label="Toggle capture credentials"
              />
            }
            label="Capture Submitted Data"
          />

          <Box>
            <Typography variant="body2" fontWeight={500}>
              Redirect URL
            </Typography>
            <TextField
              fullWidth
              placeholder="http://example.com"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              sx={inputStyle}
              aria-label="Redirect URL"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          CANCEL
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ background: GRADIENT }}
        >
          {pageToEdit ? "UPDATE PAGE" : "SAVE PAGE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewLandingPageModal;