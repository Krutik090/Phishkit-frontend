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
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Constants for styling, using localStorage values
const PINK = localStorage.getItem('primaryColor') || '#EC008C'; // Fallback color
const GRADIENT = `linear-gradient(to right, ${PINK}, ${localStorage.getItem('secondaryColor') || '#FC6767'})`;
const TRAINING_REDIRECT_URL = '/api/training/start?uid={{.UID}}';

// Reusable style object for TextFields
const pinkTextFieldSx = {
  transition: "all 0.3s ease",
  "& label.Mui-focused": { color: PINK },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused fieldset": {
      borderColor: PINK,
      boxShadow: `0 0 0 0.15rem ${PINK}40`,
    },
    "&:hover fieldset": { borderColor: PINK },
    "&.Mui-disabled": { backgroundColor: "#f3f4f6" }
  },
};

const NewLandingPageModal = ({ open, onClose, onSave, pageToEdit = null }) => {
  // State for form fields
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [captureData, setCaptureData] = useState(true); // Default to true
  const [capturePassword, setCapturePassword] = useState(true); // Default to true
  const [redirectUrl, setRedirectUrl] = useState("");
  const [redirectToTraining, setRedirectToTraining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const editorRef = useRef(null);

  // State for the custom AI prompt dialog
  const [promptOpen, setPromptOpen] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (pageToEdit) {
      const isTrainingRedirect = pageToEdit.redirect_url === TRAINING_REDIRECT_URL;
      setName(pageToEdit.name || "");
      setHtml(pageToEdit.html || "");
      setCaptureData(pageToEdit.capture_credentials !== false);
      setCapturePassword(pageToEdit.capture_passwords || false);
      setRedirectUrl(pageToEdit.redirect_url || "");
      setRedirectToTraining(isTrainingRedirect);
    } else {
      // Reset all fields for a new page
      setName("");
      setHtml("");
      setCaptureData(true);
      setCapturePassword(true);
      setRedirectUrl("");
      setRedirectToTraining(false);
    }
  }, [pageToEdit, open]);

  // Effect to manage the redirect URL when the training switch is toggled
  useEffect(() => {
    if (redirectToTraining) {
      setRedirectUrl(TRAINING_REDIRECT_URL);
    } else {
      if (redirectUrl === TRAINING_REDIRECT_URL) {
        setRedirectUrl("");
      }
    }
  }, [redirectToTraining]);


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
      capture_passwords: captureData && capturePassword,
      redirect_url: redirectUrl,
    };
    try {
      if (pageToEdit?._id) {
        onSave(pageData, "edit", pageToEdit._id);
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
  }, [name, html, captureData, capturePassword, redirectUrl, onSave, onClose, pageToEdit]);
  
  const handleOpenFullscreenEditor = () => {
    localStorage.setItem("landingPageHtml", html);
    const editorWindow = window.open("/fullscreen-editor", "_blank");
    const interval = setInterval(() => {
      if (editorWindow.closed) {
        clearInterval(interval);
        const updatedHtml = localStorage.getItem("landingPageHtml") || "";
        setHtml(updatedHtml);
        localStorage.removeItem("landingPageHtml");
        toast.info("✅ HTML content updated from fullscreen editor.");
      }
    }, 500);
  };

  const handleGenerateFromDescription = async () => {
    if (!description) {
      toast.warn("Please enter a description for the AI.");
      return;
    }
    setPromptOpen(false);
    setIsGenerating(true);
    toast.info("✨ Generating HTML with AI... Please wait.");

    try {
      // Conditionally create the prompt based on the redirectToTraining switch
      let prompt;
      if (redirectToTraining) {
        prompt = `
          You are an expert web developer creating a phishing landing page for the GoPhish framework.
          
          **CRITICAL INSTRUCTIONS:**
          1.  **ONLY output the raw HTML code.** Do NOT include any explanations or markdown formatting.
          2.  The response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.
          3.  The HTML must be a single, self-contained file with all CSS in a \`<style>\` tag.
          4.  The page must include a form with input fields for credentials.
          5.  **DO NOT** add \`method\` or \`action\` attributes directly to the \`<form>\` tag in the HTML.
          6.  **MANDATORY JAVASCRIPT LOGIC:** You MUST include the following JavaScript in a \`<script>\` tag at the end of the \`<body>\`. This script is essential for capturing credentials and then redirecting the user to the training module.
              \`\`\`javascript
              document.addEventListener("DOMContentLoaded", function () {
                const form = document.querySelector("form");
                if (form) {
                  const iframe = document.createElement("iframe");
                  iframe.name = "hidden-target";
                  iframe.style.display = "none";
                  document.body.appendChild(iframe);

                  form.setAttribute("target", "hidden-target");
                  form.setAttribute("method", "POST");
                  form.setAttribute("action", "");

                  form.addEventListener("submit", function () {
                    setTimeout(() => {
                      window.location.href = "/api/training/start?uid={{.UID}}";
                    }, 500);
                  });
                }
              });
              \`\`\`

          User's Description: "${description}"
        `;
      } else {
        prompt = `
          You are an expert web developer. Your task is to generate a complete, single-file HTML document for a phishing landing page based on the user's description.
          
          **CRITICAL INSTRUCTIONS:**
          1.  **ONLY output the raw HTML code.** Do NOT include any explanations or markdown formatting.
          2.  The entire response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.
          3.  The HTML must be a single, self-contained file. All CSS MUST be included within a \`<style>\` tag.
          4.  The HTML must be visually appealing, modern, and fully responsive.
          5.  The page MUST include a form for data capture. The form element must NOT have a \`method\` or \`action\` attribute.
          6.  **DO NOT INCLUDE any \`<script>\` tags or JavaScript code.** The form should submit naturally to be captured by GoPhish.

          User's Description: "${description}"
        `;
      }

      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        toast.error("❌ Gemini API key is not configured.");
        setIsGenerating(false);
        return;
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorBody = await response.json();
        console.error("API Error Body:", errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0) {
        let generatedText = result.candidates[0].content.parts[0].text;
        generatedText = generatedText.replace(/^```html\s*|```$/g, '').trim();
        const startIndex = generatedText.indexOf('<!DOCTYPE html>');
        const endIndex = generatedText.lastIndexOf('</html>');
        if (startIndex !== -1 && endIndex !== -1) {
            setHtml(generatedText.substring(startIndex, endIndex + '</html>'.length));
        } else {
            setHtml(generatedText);
        }
        toast.success("✨ HTML generated successfully!");
      } else {
        throw new Error("No content generated by the API.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      toast.error("❌ Failed to generate HTML. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!html) {
        toast.warn("There is no HTML content to preview.");
        return;
    }
    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: PINK, backgroundColor: "#f5f5f5" }}>
          {pageToEdit ? "✏️ Edit Landing Page" : "🌐 New Landing Page"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} py={2}>
            <Box>
              <Typography variant="body2" fontWeight={500} gutterBottom>Name</Typography>
              <TextField fullWidth placeholder="Enter landing page name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} sx={pinkTextFieldSx} />
            </Box>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={500}>HTML Content</Typography>
                <Box>
                   <Tooltip title="Preview HTML"><Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={handlePreview} sx={{ mr: 1 }}>Preview</Button></Tooltip>
                  <Button variant="contained" size="small" startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />} onClick={() => setPromptOpen(true)} disabled={isGenerating} sx={{ mr: 1, background: GRADIENT, color: 'white' }}>
                    {isGenerating ? "Generating..." : "✨ Generate with AI"}
                  </Button>
                  <Tooltip title="Fullscreen Editor"><Button variant="outlined" size="small" startIcon={<FullscreenIcon />} onClick={handleOpenFullscreenEditor}>Full Screen</Button></Tooltip>
                </Box>
              </Box>
              <TextField fullWidth multiline minRows={10} placeholder="Paste or type your HTML here, or generate it with AI!" variant="outlined" value={html} onChange={(e) => setHtml(e.target.value)} sx={pinkTextFieldSx} />
            </Box>
            <Box>
              <FormControlLabel control={<Switch checked={captureData} onChange={(e) => { const isChecked = e.target.checked; setCaptureData(isChecked); if (!isChecked) { setCapturePassword(false); } }} sx={{ "& .Mui-checked": { color: PINK }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: PINK } }} />} label="Capture Submitted Data" />
              {captureData && (<Box pl={4} mt={1}><FormControlLabel control={<Switch checked={capturePassword} onChange={(e) => setCapturePassword(e.target.checked)} sx={{ "& .Mui-checked": { color: PINK }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: PINK } }} />} label="Capture Passwords" /></Box>)}
            </Box>
             <Box>
                <FormControlLabel control={<Switch checked={redirectToTraining} onChange={(e) => setRedirectToTraining(e.target.checked)} sx={{ "& .Mui-checked": { color: PINK }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: PINK } }} />} label="Redirect to Training on Submission" />
                <TextField fullWidth placeholder="http://example.com" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} sx={pinkTextFieldSx} disabled={redirectToTraining} helperText={redirectToTraining ? "Redirect is automatically set to the training module." : "Enter a custom URL to redirect to after submission."} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ background: GRADIENT, color: 'white' }}>{pageToEdit ? "Update Page" : "Save Page"}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={promptOpen} onClose={() => setPromptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: PINK }}>✨ Generate Landing Page with AI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>Describe the landing page you want to create. Select the 'Redirect to Training' option before generating if you want the AI to add the redirect logic.</Typography>
          <TextField autoFocus margin="dense" label="Landing Page Description" type="text" fullWidth variant="outlined" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., a modern login page for 'FinBank' with a blue and white theme." sx={pinkTextFieldSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPromptOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleGenerateFromDescription} variant="contained" sx={{ background: GRADIENT, color: 'white' }}>Generate</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewLandingPageModal;
