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
  IconButton,
  alpha,
} from "@mui/material";
import {
  Fullscreen as FullscreenIcon,
  AutoAwesome as AutoAwesomeIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Web as WebIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast"; // ✅ Use advanced toast

// --- UPDATED URL ---
const TRAINING_REDIRECT_URL = 'https://srv634401.hstgr.cloud/api/training/start?uid={{.UID}}';

const NewLandingPageModal = ({ open, onClose, onSave, pageToEdit = null }) => {
  const { darkMode } = useTheme();
  
  // State for form fields
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [captureData, setCaptureData] = useState(true);
  const [capturePassword, setCapturePassword] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [redirectToTraining, setRedirectToTraining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSave = useCallback(async () => {
    const content = editorRef.current?.getContent?.() || html;
    
    if (!name.trim()) {
      advancedToast.warning(
        "Please enter a landing page name to continue.",
        "Name Required",
        { icon: "📝" }
      );
      return;
    }

    if (!content.trim()) {
      advancedToast.warning(
        "Please add HTML content to your landing page.",
        "Content Required",
        { icon: "🌐" }
      );
      return;
    }

    setIsSaving(true);

    const pageData = {
      name,
      html: content,
      capture_credentials: captureData,
      capture_passwords: captureData && capturePassword,
      redirect_url: redirectUrl,
    };

    try {
      const loadingId = advancedToast.info(
        `${pageToEdit ? 'Updating' : 'Creating'} landing page "${name}"...`,
        "Saving Page",
        { icon: "⏳", autoClose: false }
      );

      if (pageToEdit?._id) {
        await onSave(pageData, "edit", pageToEdit._id);
        advancedToast.dismissById(loadingId);
        advancedToast.success(
          `Landing page "${name}" updated successfully!`,
          "Page Updated",
          { icon: "✅" }
        );
      } else {
        await onSave(pageData, "create");
        advancedToast.dismissById(loadingId);
        advancedToast.success(
          `Landing page "${name}" created successfully!`,
          "Page Created",
          { icon: "🎉" }
        );
      }
      onClose();
    } catch (err) {
      console.error("Landing Page Save Error:", err);
      advancedToast.error(
        err.message || "Failed to save landing page. Please try again.",
        "Save Failed",
        { icon: "❌" }
      );
    } finally {
      setIsSaving(false);
    }
  }, [name, html, captureData, capturePassword, redirectUrl, onSave, onClose, pageToEdit]);
  
  const handleOpenFullscreenEditor = () => {
    try {
      localStorage.setItem("landingPageHtml", html);
      const editorWindow = window.open("/fullscreen-editor", "_blank");
      
      const interval = setInterval(() => {
        if (editorWindow.closed) {
          clearInterval(interval);
          const updatedHtml = localStorage.getItem("landingPageHtml") || "";
          setHtml(updatedHtml);
          localStorage.removeItem("landingPageHtml");
          advancedToast.success(
            "HTML content updated from fullscreen editor.",
            "Editor Closed",
            { icon: "📝" }
          );
        }
      }, 500);

      advancedToast.info(
        "Fullscreen editor opened in new window.",
        "Editor Launched",
        { icon: "🖥️" }
      );
    } catch (error) {
      advancedToast.error(
        "Failed to open fullscreen editor.",
        "Editor Error",
        { icon: "❌" }
      );
    }
  };

  const handleGenerateFromDescription = async () => {
    if (!description.trim()) {
      advancedToast.warning(
        "Please enter a description for the AI to continue.",
        "Description Required",
        { icon: "🤖" }
      );
      return;
    }
    
    setPromptOpen(false);
    setIsGenerating(true);
    
    const loadingId = advancedToast.info(
      "AI is generating your landing page...",
      "Generating Content",
      { icon: "✨", autoClose: false }
    );

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
                      window.location.href = "${TRAINING_REDIRECT_URL}";
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
        advancedToast.dismissById(loadingId);
        advancedToast.error(
          "Gemini API key is not configured in environment variables.",
          "API Configuration Error",
          { icon: "🔑" }
        );
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
        generatedText = generatedText.replace(/^``````$/g, '').trim();
        
        const startIndex = generatedText.indexOf('<!DOCTYPE html>');
        const endIndex = generatedText.lastIndexOf('</html>');
        
        if (startIndex !== -1 && endIndex !== -1) {
          setHtml(generatedText.substring(startIndex, endIndex + '</html>'.length));
        } else {
          setHtml(generatedText);
        }
        
        advancedToast.dismissById(loadingId);
        advancedToast.success(
          "AI-generated landing page is ready!",
          "Generation Complete",
          { icon: "🎉" }
        );
      } else {
        throw new Error("No content generated by the API.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      advancedToast.dismissById(loadingId);
      advancedToast.error(
        error.message || "Failed to generate landing page with AI.",
        "Generation Failed",
        { icon: "🤖" }
      );
    } finally {
      setIsGenerating(false);
      setDescription("");
    }
  };

  const handlePreview = () => {
    if (!html) {
      advancedToast.warning(
        "There is no HTML content to preview.",
        "No Content",
        { icon: "👁️" }
      );
      return;
    }
    
    try {
      const previewWindow = window.open("", "_blank");
      previewWindow.document.write(html);
      previewWindow.document.close();
      
      advancedToast.success(
        "Landing page preview opened in new window.",
        "Preview Ready",
        { icon: "👁️" }
      );
    } catch (error) {
      advancedToast.error(
        "Failed to open preview window.",
        "Preview Failed",
        { icon: "❌" }
      );
    }
  };

  const handleClose = () => {
    if (isSaving || isGenerating) {
      advancedToast.info(
        "Please wait for the current operation to complete.",
        "Operation in Progress",
        { icon: "⏳" }
      );
      return;
    }
    onClose();
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
      borderRadius: '12px',
      color: darkMode ? '#e1e1e1' : '#333',
      '& fieldset': {
        borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
      },
      '&:hover fieldset': {
        borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ec008c',
        borderWidth: '2px',
      },
      '&.Mui-disabled': {
        backgroundColor: darkMode ? alpha('#fff', 0.02) : '#f3f4f6',
        color: darkMode ? '#666' : '#999',
      },
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666',
      '&.Mui-focused': {
        color: '#ec008c',
      },
    },
    '& .MuiFormHelperText-root': {
      color: darkMode ? '#999' : '#666',
    },
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: darkMode ? alpha("#1a1a2e", 0.95) : alpha("#ffffff", 0.95),
            backdropFilter: 'blur(16px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
            boxShadow: darkMode ? 
              '0 8px 32px rgba(0, 0, 0, 0.5)' : 
              '0 8px 32px rgba(0, 0, 0, 0.1)',
            // ✅ Advanced scrollbar styling
            '& .MuiDialogContent-root': {
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                borderRadius: '4px',
                '&:hover': {
                  background: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                },
              },
            },
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: "bold", 
            color: darkMode ? '#e1e1e1' : '#333',
            background: `linear-gradient(135deg, ${alpha('#ec008c', 0.1)}, ${alpha('#fc6767', 0.05)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <WebIcon sx={{ color: '#ec008c' }} />
            {pageToEdit ? "Edit Landing Page" : "New Landing Page"}
          </Box>
          
          <IconButton 
            onClick={handleClose} 
            size="small"
            disabled={isSaving || isGenerating}
            sx={{
              color: darkMode ? 'grey.400' : 'grey.600',
              '&:hover': {
                backgroundColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.05),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ px: 3, py: 3 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Name Field */}
            <Box>
              <Typography 
                variant="body2" 
                fontWeight={500} 
                gutterBottom
                color={darkMode ? '#e1e1e1' : '#333'}
              >
                Landing Page Name *
              </Typography>
              <TextField 
                fullWidth 
                placeholder="Enter a descriptive landing page name..." 
                variant="outlined" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={isSaving}
                sx={textFieldStyle}
              />
            </Box>

            {/* HTML Content */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="body2" 
                  fontWeight={500}
                  color={darkMode ? '#e1e1e1' : '#333'}
                >
                  HTML Content
                </Typography>
                <Box display="flex" gap={1}>
                  <Tooltip title="Preview HTML">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<VisibilityIcon />} 
                      onClick={handlePreview}
                      disabled={isSaving}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                        color: darkMode ? '#ccc' : '#666',
                      }}
                    >
                      Preview
                    </Button>
                  </Tooltip>
                  
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />} 
                    onClick={() => setPromptOpen(true)} 
                    disabled={isGenerating || isSaving}
                    sx={{ 
                      background: (isGenerating || isSaving) ? 
                        'rgba(236, 0, 140, 0.5)' : 
                        'linear-gradient(135deg, #ec008c, #fc6767)',
                      color: 'white',
                      borderRadius: '8px',
                      textTransform: 'none',
                    }}
                  >
                    {isGenerating ? "Generating..." : "✨ Generate with AI"}
                  </Button>
                  
                  <Tooltip title="Fullscreen Editor">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<FullscreenIcon />} 
                      onClick={handleOpenFullscreenEditor}
                      disabled={isSaving}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                        color: darkMode ? '#ccc' : '#666',
                      }}
                    >
                      Full Screen
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              
              <TextField 
                fullWidth 
                multiline 
                minRows={10} 
                placeholder="Paste or type your HTML here, or generate it with AI!" 
                variant="outlined" 
                value={html} 
                onChange={(e) => setHtml(e.target.value)} 
                disabled={isSaving}
                sx={{
                  ...textFieldStyle,
                  '& .MuiOutlinedInput-root': {
                    ...textFieldStyle['& .MuiOutlinedInput-root'],
                    // Custom scrollbar for the textarea
                    '& textarea': {
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(135deg, #ec008c, #fc6767)',
                        borderRadius: '4px',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d6007a, #e55555)',
                        },
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Capture Data Settings */}
            <Box>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={captureData} 
                    onChange={(e) => { 
                      const isChecked = e.target.checked; 
                      setCaptureData(isChecked); 
                      if (!isChecked) { 
                        setCapturePassword(false); 
                      } 
                    }} 
                    disabled={isSaving}
                    sx={{ 
                      "& .Mui-checked": { color: '#ec008c' }, 
                      "& .Mui-checked + .MuiSwitch-track": { backgroundColor: '#ec008c' } 
                    }} 
                  />
                } 
                label={
                  <Typography color={darkMode ? '#e1e1e1' : '#333'}>
                    Capture Submitted Data
                  </Typography>
                }
              />
              
              {captureData && (
                <Box pl={4} mt={1}>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={capturePassword} 
                        onChange={(e) => setCapturePassword(e.target.checked)} 
                        disabled={isSaving}
                        sx={{ 
                          "& .Mui-checked": { color: '#ec008c' }, 
                          "& .Mui-checked + .MuiSwitch-track": { backgroundColor: '#ec008c' } 
                        }} 
                      />
                    } 
                    label={
                      <Typography color={darkMode ? '#ccc' : '#555'}>
                        Capture Passwords
                      </Typography>
                    }
                  />
                </Box>
              )}
            </Box>

            {/* Redirect Settings */}
            <Box>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={redirectToTraining} 
                    onChange={(e) => setRedirectToTraining(e.target.checked)} 
                    disabled={isSaving}
                    sx={{ 
                      "& .Mui-checked": { color: '#ec008c' }, 
                      "& .Mui-checked + .MuiSwitch-track": { backgroundColor: '#ec008c' } 
                    }} 
                  />
                } 
                label={
                  <Typography color={darkMode ? '#e1e1e1' : '#333'}>
                    Redirect to Training on Submission
                  </Typography>
                }
              />
              
              <TextField 
                fullWidth 
                placeholder="http://example.com" 
                value={redirectUrl} 
                onChange={(e) => setRedirectUrl(e.target.value)} 
                disabled={redirectToTraining || isSaving}
                helperText={
                  redirectToTraining ? 
                    "Redirect is automatically set to the training module." : 
                    "Enter a custom URL to redirect to after submission."
                }
                sx={{
                  ...textFieldStyle,
                  mt: 1,
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 2 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            disabled={isSaving || isGenerating}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: darkMode ? '#ccc' : '#666',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={isSaving ? null : <SaveIcon />}
            disabled={isSaving || isGenerating || !name.trim() || !html.trim()}
            sx={{ 
              background: (isSaving || !name.trim() || !html.trim()) ? 
                'rgba(236, 0, 140, 0.3)' : 
                'linear-gradient(135deg, #ec008c, #fc6767)',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              minWidth: '140px',
            }}
          >
            {isSaving ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} color="inherit" />
                Saving...
              </Box>
            ) : (
              pageToEdit ? "Update Page" : "Save Page"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog 
        open={promptOpen} 
        onClose={() => setPromptOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: darkMode ? alpha("#1a1a2e", 0.95) : alpha("#ffffff", 0.95),
            backdropFilter: 'blur(16px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: 'bold', 
            color: darkMode ? '#e1e1e1' : '#333',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <AutoAwesomeIcon sx={{ color: '#ec008c' }} />
          Generate Landing Page with AI
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ mb: 2 }}
          >
            💡 Describe the landing page you want to create. Select the 'Redirect to Training' option before generating if you want the AI to add the redirect logic.
          </Typography>
          <TextField 
            autoFocus 
            margin="dense" 
            label="Landing Page Description" 
            type="text" 
            fullWidth 
            variant="outlined" 
            multiline 
            rows={4} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="e.g., a modern login page for 'FinBank' with a blue and white theme." 
            sx={textFieldStyle}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button 
            onClick={() => setPromptOpen(false)} 
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: darkMode ? '#ccc' : '#666',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateFromDescription} 
            variant="contained" 
            sx={{ 
              background: 'linear-gradient(135deg, #ec008c, #fc6767)',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
            }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewLandingPageModal;
