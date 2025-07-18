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
  colors,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const pink = localStorage.getItem("primaryColor");

const pinkTextFieldSx = {
  "& label.Mui-focused": { color: pink },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: pink,
      boxShadow: `0 0 0 0.15rem localStorage.getItem("primaryColor")`,
    },
  },
};

const NewTemplateModal = ({ open, onClose, templateData, onSave }) => {
  const [tab, setTab] = useState(0);
  const [files, setFiles] = useState([]);
  const [tracking, setTracking] = useState(true);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [textContent, setTextContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

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
    setTracking(true);
    setTab(0);
  }, [templateData, open]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    toast.success("File(s) added");
  };
  const handleFileDelete = (index) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
    if (confirmed) {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      toast.success("File deleted");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      toast.warning("Name and Subject are required.");
      return;
    }

    try {
      const attachmentPromises = files.map((file) => {
        if (file.content && file.name) return file; // already processed (editing existing)
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(",")[1];
            resolve({
              content: base64,
              type: file.type,
              name: file.name,
            });
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
        body: JSON.stringify(templateData?.id ? { id: templateData._id, ...payload } : payload),
      });

      if (!response.ok) throw new Error("Failed to save template");

      const savedData = await response.json();
      toast.success("Template saved successfully!");
      setTimeout(() => {
        onSave(savedData);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving template. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: "900px",
          height: "900px",
          maxHeight: "90vh",
          borderRadius: "16px",
          border: `2px solid ${localStorage.getItem("primaryColor")}`,
          boxShadow: `0 8px 24px ${localStorage.getItem("primaryColor")}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: localStorage.getItem("primaryColor"),
          borderBottom: "1px solid #f5f5f5",
          backgroundColor: "#f5f5f5",
        }}
      >
        ✉️ {templateData ? "Edit Email Template" : "New Email Template"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        <Typography variant="body2" fontWeight="500" mb={0.5}>
          Name
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          margin="dense"
          sx={pinkTextFieldSx}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* <Button
          variant="contained"
          sx={{
            backgroundColor: pink,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 1,
            px: 2,
            py: 1,
            my: 2,
            textTransform: "none",
            "&:hover": { backgroundColor: "#d6007a" },
          }}
        >
          IMPORT EMAIL
        </Button> */}

  
        <Typography variant="body2" fontWeight="500" mb={0.5}>
          Subject
        </Typography>
        <TextField
          fullWidth 
          variant="outlined"
          margin="dense"
          sx={pinkTextFieldSx}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="HTML Content" />
          <Tab label="Plain Text" />
          <Tab label="Attachments" />
        </Tabs>

        {tab === 0 && (
          <TextField
            label="HTML Body"
            multiline
            rows={10}
            fullWidth
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            sx={pinkTextFieldSx}
          />
        )}
        {tab === 1 && (
          <TextField
            label="Plain Text Body"
            multiline
            rows={10}
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
              <Table>
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
                      <TableCell>{file.type || "Unknown"}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleFileDelete(index)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
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
    background: `linear-gradient(to right, ${localStorage.getItem("primaryColor")}, ${localStorage.getItem("secondaryColor")})`,
    color: "#fff",
    fontWeight: "bold",
    borderRadius: 1,
    textTransform: "none",
    boxShadow: 1,
    "&:hover": {
      background: `linear-gradient(to right, ${localStorage.getItem("primaryColor")}, ${localStorage.getItem("secondaryColor")})`,
    },
  }}
        >
          SAVE TEMPLATE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTemplateModal;
