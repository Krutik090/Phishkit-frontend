import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Visibility as VisibilityIcon,
  FileUpload as FileUploadIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// A dedicated component for the Import Email Dialog
const ImportEmailDialog = ({ open, onClose, onImport }) => {
  const { darkMode } = useTheme();
  const [rawContent, setRawContent] = useState("");
  const [convertLinks, setConvertLinks] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportClick = async () => {
    if (!rawContent.trim()) {
      advancedToast.warning(
        "Please paste the raw email content to continue.",
        "Content Required",
        { icon: "📥" }
      );
      return;
    }

    setIsImporting(true);

    try {
      const loadingId = advancedToast.info(
        "Processing raw email content...",
        "Importing Email",
        { icon: "⏳", autoClose: false }
      );

      const response = await fetch(`${API_BASE_URL}/templates/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ content: rawContent, convert_links: convertLinks }),
      });

      const data = await response.json();

      advancedToast.dismissById(loadingId);

      if (!response.ok) {
        throw new Error(data.error || "Failed to import email.");
      }

      advancedToast.success(
        "Email imported successfully!",
        "Import Complete",
        { icon: "📧" }
      );

      onImport(data);
      onClose();
    } catch (error) {
      console.error("Import Error:", error);
      advancedToast.error(
        error.message || "Failed to import email. Please check the format and try again.",
        "Import Failed",
        { icon: "❌" }
      );
    } finally {
      setIsImporting(false);
    }
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
      // ✅ Advanced scrollbar for textarea in import dialog
      '& textarea': {
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
          borderRadius: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, #ec008c, #fc6767)',
          borderRadius: '6px',
          border: '1px solid transparent',
          backgroundClip: 'content-box',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #d6007a, #e55555)',
            transform: 'scale(1.1)',
          },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: darkMode
          ? '#ec008c rgba(255, 255, 255, 0.05)'
          : '#ec008c rgba(0, 0, 0, 0.05)',
      },
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666',
      '&.Mui-focused': {
        color: '#ec008c',
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background: darkMode ? alpha("#1a1a2e", 0.95) : alpha("#ffffff", 0.95),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
          // ✅ Advanced scrollbar for import dialog
          '& .MuiDialogContent-root': {
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
              borderRadius: '8px',
              margin: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(135deg, #ec008c, #fc6767)',
              borderRadius: '8px',
              border: '2px solid transparent',
              backgroundClip: 'content-box',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: darkMode
                ? '0 2px 8px rgba(236, 0, 140, 0.3)'
                : '0 2px 8px rgba(236, 0, 140, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d6007a, #e55555)',
                transform: 'scale(1.05)',
                boxShadow: darkMode
                  ? '0 4px 16px rgba(236, 0, 140, 0.5)'
                  : '0 4px 16px rgba(236, 0, 140, 0.3)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode
              ? '#ec008c rgba(30, 30, 47, 0.8)'
              : '#ec008c rgba(0, 0, 0, 0.05)',
          },
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
          borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <FileUploadIcon sx={{ color: '#ec008c' }} />
        Import Raw Email
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 2 }}
        >
          💡 Paste the full raw email source (including headers) into the text box below. You can usually find this using the "Show Original" or "View Source" feature in your email client.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Raw Email Content (RFC 2045 Format)"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={15}
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
          placeholder="From: example@example.com&#10;To: you@example.com&#10;Subject: Hello..."
          disabled={isImporting}
          sx={textFieldStyle}
        />
        <FormControlLabel
          control={
            <Switch
              checked={convertLinks}
              onChange={(e) => setConvertLinks(e.target.checked)}
              disabled={isImporting}
              sx={{
                "& .Mui-checked": { color: '#ec008c' },
                "& .Mui-checked + .MuiSwitch-track": { backgroundColor: '#ec008c' }
              }}
            />
          }
          label="Automatically convert links for tracking"
          sx={{ mt: 2, color: darkMode ? '#e1e1e1' : '#333' }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isImporting}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            color: darkMode ? '#ccc' : '#666',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleImportClick}
          variant="contained"
          disabled={isImporting}
          sx={{
            background: isImporting ?
              (darkMode ? 'rgba(236, 0, 140, 0.3)' : 'rgba(236, 0, 140, 0.3)') :
              'linear-gradient(135deg, #ec008c, #fc6767)',
            color: 'white',
            borderRadius: '12px',
            textTransform: 'none',
            minWidth: '120px',
          }}
        >
          {isImporting ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} color="inherit" />
              Importing...
            </Box>
          ) : (
            "Import Email"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const NewTemplateModal = ({ open, onClose, templateData, onSave }) => {
  const { darkMode } = useTheme();
  const [tab, setTab] = useState(0);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [textContent, setTextContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (templateData) {
      setName(templateData.name || "");
      setSubject(templateData.subject || "");
      setTextContent(templateData.text || "");
      setHtmlContent(templateData.html || "");
      setFiles(templateData.attachments || []);
    } else {
      setName("");
      setSubject("");
      setTextContent("");
      setHtmlContent("");
      setFiles([]);
    }
    setTab(0);
  }, [templateData, open]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    advancedToast.success(
      `${selectedFiles.length} file(s) added to template.`,
      "Files Added",
      { icon: "📎" }
    );
  };

  const handleFileDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    advancedToast.success(
      "Attachment removed successfully.",
      "File Deleted",
      { icon: "🗑️" }
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      advancedToast.warning(
        "Please enter a template name to continue.",
        "Name Required",
        { icon: "📝" }
      );
      return;
    }

    if (!subject.trim()) {
      advancedToast.warning(
        "Please enter an email subject to continue.",
        "Subject Required",
        { icon: "✉️" }
      );
      return;
    }

    setIsSaving(true);

    try {
      const loadingId = advancedToast.info(
        `${templateData ? 'Updating' : 'Creating'} template "${name}"...`,
        "Saving Template",
        { icon: "⏳", autoClose: false }
      );

      const attachmentPromises = files.map((file) => {
        if (file.content && file.name) return file;
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(",")[1];
            resolve({ content: base64, type: file.type, name: file.name });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const processedAttachments = await Promise.all(attachmentPromises);

      const payload = {
        name,
        subject,
        text: textContent,
        html: htmlContent,
        attachments: processedAttachments,
      };

      const method = templateData?._id ? "PUT" : "POST";
      const url = `${API_BASE_URL}/templates${templateData?._id ? `/${templateData._id}` : ""}`;

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      advancedToast.dismissById(loadingId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save template");
      }

      const savedData = await response.json();

      advancedToast.success(
        `Template "${name}" ${templateData ? 'updated' : 'created'} successfully!`,
        `Template ${templateData ? 'Updated' : 'Created'}`,
        { icon: "✅" }
      );

      onSave(savedData);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      advancedToast.error(
        error.message || "Failed to save template. Please try again.",
        "Save Failed",
        { icon: "❌" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!htmlContent) {
      advancedToast.warning(
        "There is no HTML content to preview.",
        "No Content",
        { icon: "👁️" }
      );
      return;
    }

    try {
      const previewWindow = window.open("", "_blank");
      const previewHtml = htmlContent.replace(/{{.URL}}/g, '#');
      previewWindow.document.write(previewHtml);
      previewWindow.document.close();

      advancedToast.success(
        "Template preview opened in new window.",
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
      "AI is generating your email template...",
      "Generating Content",
      { icon: "✨", autoClose: false }
    );

    try {
      const prompt = `
        You are an expert email developer creating a template for the GoPhish phishing framework.
        
        **CRITICAL INSTRUCTIONS:**
        1.  **ONLY output the raw HTML code.** Do NOT include any explanations or markdown formatting.
        2.  The entire response MUST start with \`<!DOCTYPE html>\` and end with \`</html>\`.
        3.  The HTML must be a single, self-contained file. Use inline CSS and table-based layouts for maximum email client compatibility.
        4.  **MANDATORY:** All hyperlinks (\`<a>\` tags) in the email body MUST use \`{{.URL}}\` as their \`href\` attribute. For example: \`<a href="{{.URL}}">Click Here</a>\`. This is non-negotiable.
        5.  Do not include any external CSS, JavaScript, or image files.

        User's Description: "${description}"
      `;

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

      if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0) {
        let generatedText = result.candidates[0].content.parts[0].text;
        generatedText = generatedText.replace(/^``````$/g, '').trim();

        setHtmlContent(generatedText);

        advancedToast.dismissById(loadingId);
        advancedToast.success(
          "AI-generated email template is ready!",
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
        error.message || "Failed to generate email template with AI.",
        "Generation Failed",
        { icon: "🤖" }
      );
    } finally {
      setIsGenerating(false);
      setDescription("");
    }
  };

  const handleImportedData = (data) => {
    setSubject(data.subject || "");
    setHtmlContent(data.html || "");
    setTextContent(data.text || "");
    setTab(0);
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
      // ✅ Advanced scrollbar styling for all textareas
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
        scrollbarWidth: 'thin',
      },
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666',
      '&.Mui-focused': {
        color: '#ec008c',
      },
    },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
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
            borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <EmailIcon sx={{ color: '#ec008c' }} />
            {templateData ? "Edit Email Template" : "New Email Template"}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => setImportOpen(true)}
              disabled={isSaving || isGenerating}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                color: darkMode ? '#ccc' : '#666',
                '&:hover': {
                  borderColor: '#ec008c',
                  backgroundColor: alpha('#ec008c', 0.1),
                },
              }}
            >
              Import Email
            </Button>

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
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="body2"
            fontWeight="500"
            mb={1}
            color={darkMode ? '#e1e1e1' : '#333'}
          >
            Template Name *
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter a descriptive template name..."
            variant="outlined"
            margin="dense"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
            sx={textFieldStyle}
          />

          <Typography
            variant="body2"
            fontWeight="500"
            mt={2}
            mb={1}
            color={darkMode ? '#e1e1e1' : '#333'}
          >
            Email Subject *
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter email subject line..."
            variant="outlined"
            margin="dense"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSaving}
            sx={textFieldStyle}
          />

          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            sx={{
              my: 3,
              borderBottom: 1,
              borderColor: darkMode ? alpha('#fff', 0.1) : 'divider',
              '& .MuiTab-root': {
                color: darkMode ? '#ccc' : '#666',
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: '#ec008c',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#ec008c',
              },
            }}
          >
            <Tab label="HTML Content" />
            <Tab label="Plain Text" />
            <Tab label="Attachments" />
          </Tabs>

          {tab === 0 && (
            <Box>
              <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2} gap={1}>
                <Tooltip title="Preview HTML Email">
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
              </Box>
              <TextField
                label="HTML Body"
                multiline
                rows={12}
                fullWidth
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                disabled={isSaving}
                sx={textFieldStyle}
                placeholder="Type or paste your email HTML here, or generate it with AI."
              />
            </Box>
          )}

          {tab === 1 && (
            <TextField
              label="Plain Text Body (optional)"
              multiline
              rows={12}
              fullWidth
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={isSaving}
              sx={textFieldStyle}
            />
          )}

          {tab === 2 && (
            <Box>
              <Button
                component="label"
                variant="outlined"
                disabled={isSaving}
                sx={{
                  mb: 2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                  color: darkMode ? '#ccc' : '#666',
                }}
              >
                Upload Files
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>
              {files.length > 0 && (
                <Box
                  sx={{
                    borderRadius: '12px',
                    border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    overflow: 'hidden',
                    // ✅ Advanced scrollbar for file table
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'linear-gradient(90deg, #ec008c, #fc6767)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #d6007a, #e55555)',
                      },
                    },
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02) }}>
                        <TableCell sx={{ color: darkMode ? '#e1e1e1' : '#333', fontWeight: 'bold' }}>
                          File Name
                        </TableCell>
                        <TableCell sx={{ color: darkMode ? '#e1e1e1' : '#333', fontWeight: 'bold' }}>
                          Type
                        </TableCell>
                        <TableCell align="right" sx={{ color: darkMode ? '#e1e1e1' : '#333', fontWeight: 'bold' }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {files.map((file, index) => (
                        <TableRow key={file.name + index}>
                          <TableCell sx={{ color: darkMode ? '#ccc' : '#555' }}>
                            {file.name}
                          </TableCell>
                          <TableCell sx={{ color: darkMode ? '#ccc' : '#555' }}>
                            {file.type || "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Delete Attachment">
                              <IconButton
                                size="small"
                                onClick={() => handleFileDelete(index)}
                                disabled={isSaving}
                                sx={{
                                  color: '#f44336',
                                  '&:hover': {
                                    backgroundColor: alpha('#f44336', 0.1),
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 3 }, borderTop: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`, gap: 2 }}>
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
            disabled={isSaving || isGenerating || !name.trim() || !subject.trim()}
            sx={{
              background: (isSaving || !name.trim() || !subject.trim()) ?
                'rgba(236, 0, 140, 0.3)' :
                'linear-gradient(135deg, #ec008c, #fc6767)',
              color: "#fff",
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
              "Save Template"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ImportEmailDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportedData}
      />

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
            // ✅ Advanced scrollbar for AI dialog
            '& .MuiDialogContent-root': {
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
          Generate Email with AI
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            💡 Describe the email you want to create and AI will generate HTML content for you.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., a professional welcome email for new subscribers with a call-to-action button..."
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

export default NewTemplateModal;
