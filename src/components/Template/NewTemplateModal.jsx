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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const pink = localStorage.getItem("primaryColor") || '#EC008C';
const GRADIENT = `linear-gradient(to right, ${pink}, ${localStorage.getItem('secondaryColor') || '#FC6767'})`;

const pinkTextFieldSx = {
  "& label.Mui-focused": { color: pink },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: pink,
      boxShadow: `0 0 0 0.15rem ${pink}40`,
    },
     "&:hover fieldset": { borderColor: pink },
  },
};

// A dedicated component for the Import Email Dialog
const ImportEmailDialog = ({ open, onClose, onImport }) => {
    const [rawContent, setRawContent] = useState("");
    const [convertLinks, setConvertLinks] = useState(true);
    const [isImporting, setIsImporting] = useState(false);

    const handleImportClick = async () => {
        if (!rawContent.trim()) {
            toast.warn("Please paste the raw email content.");
            return;
        }
        setIsImporting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/templates/import`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({ content: rawContent, convert_links: convertLinks }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to import email.");
            }
            
            toast.success("Email imported successfully!");
            onImport(data);
            onClose();
        } catch (error) {
            console.error("Import Error:", error);
            toast.error(error.message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', color: pink }}>📥 Import Raw Email</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Paste the full raw email source (including headers) into the text box below. You can usually find this using the "Show Original" or "View Source" feature in your email client.
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
                    sx={pinkTextFieldSx}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={convertLinks}
                            onChange={(e) => setConvertLinks(e.target.checked)}
                            sx={{ "& .Mui-checked": { color: pink }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: pink } }}
                        />
                    }
                    label="Automatically convert links for tracking"
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button onClick={handleImportClick} variant="contained" sx={{ background: GRADIENT, color: 'white' }} disabled={isImporting}>
                    {isImporting ? <CircularProgress size={24} color="inherit" /> : "Import Email"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


const NewTemplateModal = ({ open, onClose, templateData, onSave }) => {
  const [tab, setTab] = useState(0);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [textContent, setTextContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
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
    toast.success(`${selectedFiles.length} file(s) added`);
  };

  const handleFileDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("File deleted");
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      toast.warning("Name and Subject are required.");
      return;
    }

    try {
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

      if (!response.ok) throw new Error("Failed to save template");

      const savedData = await response.json();
      toast.success("Template saved successfully!");
      onSave(savedData);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving template. Please try again.");
    }
  };

  const handlePreview = () => {
    if (!htmlContent) {
      toast.warn("There is no HTML content to preview.");
      return;
    }
    const previewWindow = window.open("", "_blank");
    // Replace the GoPhish URL for previewing purposes
    const previewHtml = htmlContent.replace(/{{.URL}}/g, '#');
    previewWindow.document.write(previewHtml);
    previewWindow.document.close();
  };

  const handleGenerateFromDescription = async () => {
    if (!description) {
      toast.warn("Please enter a description for the AI.");
      return;
    }
    setPromptOpen(false);
    setIsGenerating(true);
    toast.info("✨ Generating email template with AI...");
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
      if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
      const result = await response.json();
      if (result.candidates && result.candidates.length > 0) {
        let generatedText = result.candidates[0].content.parts[0].text;
        generatedText = generatedText.replace(/^```html\s*|```$/g, '').trim();
        setHtmlContent(generatedText);
        toast.success("✨ Email template generated successfully!");
      } else {
        throw new Error("No content generated by the API.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      toast.error("❌ Failed to generate email template.");
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

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ fontWeight: "bold", color: pink, borderBottom: "1px solid #f0f0f0", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          ✉️ {templateData ? "Edit Email Template" : "New Email Template"}
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={() => setImportOpen(true)}
          >
            Import Email
          </Button>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>Name</Typography>
          <TextField
            fullWidth
            placeholder="Enter template name"
            variant="outlined"
            margin="dense"
            sx={pinkTextFieldSx}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Typography variant="body2" fontWeight="500" mt={2} mb={0.5}>Subject</Typography>
          <TextField
            fullWidth
            placeholder="Enter email subject"
            variant="outlined"
            margin="dense"
            sx={pinkTextFieldSx}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ my: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="HTML Content" />
            <Tab label="Plain Text" />
            <Tab label="Attachments" />
          </Tabs>

          {tab === 0 && (
            <Box>
              <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} gap={1}>
                 <Tooltip title="Preview HTML Email">
                    <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={handlePreview}>
                        Preview
                    </Button>
                </Tooltip>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                    onClick={() => setPromptOpen(true)}
                    disabled={isGenerating}
                    sx={{ background: GRADIENT, color: 'white' }}
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
                sx={pinkTextFieldSx}
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
              sx={pinkTextFieldSx}
            />
          )}
          {tab === 2 && (
            <Box>
              <Button component="label" variant="outlined" sx={{ mb: 2 }}>
                Upload Files
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>
              {files.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file, index) => (
                      <TableRow key={file.name + index}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{file.type || "N/A"}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete Attachment">
                            <IconButton size="small" onClick={() => handleFileDelete(index)}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 3 }, borderTop: "1px solid #f0f0f0" }}>
          <Button onClick={onClose} variant="outlined">CANCEL</Button>
          <Button onClick={handleSave} variant="contained" sx={{ background: GRADIENT, color: "#fff" }}>
            SAVE TEMPLATE
          </Button>
        </DialogActions>
      </Dialog>
      
      <ImportEmailDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportedData} />
      
      <Dialog open={promptOpen} onClose={() => setPromptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: pink }}>✨ Generate Email with AI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Describe the email you want to create.
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
            placeholder="e.g., a welcome email for new subscribers..."
            sx={pinkTextFieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPromptOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleGenerateFromDescription} variant="contained" sx={{ background: GRADIENT, color: 'white' }}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewTemplateModal;
