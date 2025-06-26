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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

const pink = "#ec008c";

const pinkTextFieldSx = {
  "& label.Mui-focused": { color: pink },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: pink,
      boxShadow: "0 0 0 0.15rem rgba(236, 0, 140, 0.25)",
    },
  },
};

const NewTemplateModal = ({ open, onClose, templateData, onSave }) => {
  const [tab, setTab] = useState(0);
  const [files, setFiles] = useState([]);
  const [tracking, setTracking] = useState(true);
  const [name, setName] = useState("");
  const [envelopeSender, setEnvelopeSender] = useState("");
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
    setEnvelopeSender("");
    setTracking(true);
    setTab(0);
  }, [templateData, open]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    toast.success("File(s) added");
    console.log("Toast: File(s) added");
  };

  const handleFileDelete = (index) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
    if (confirmed) {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      toast.success("File deleted");
      console.log("Toast: File deleted");
    } else {
      toast.info("Delete cancelled");
      console.log("Toast: Delete cancelled");
    }
  };

  const handleSave = async () => {
    try {
      const attachmentPromises = files.map((file) => {
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
          reader.onerror = (error) => reject(error);
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

      const url = templateData?.id
        ? `http://localhost:5000/api/templates/${templateData.id}`
        : "http://localhost:5000/api/templates";

      const method = templateData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData?.id ? { id: templateData.id, ...payload } : payload),
      });

      if (!response.ok) throw new Error("Failed to save template");

      const savedData = await response.json();

      toast.success("Template saved successfully!");
      console.log("Toast: Template saved successfully");

      setTimeout(() => {
        onSave(savedData);
        onClose();
      }, 1000); // increased to allow toast to appear before unmount
    } catch (error) {
      console.error(error);
      toast.error("Error saving template. Please try again.");
      console.log("Toast: Error saving template");
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
          border: "2px solid #ec008c30",
          boxShadow: "0 8px 24px rgba(236, 0, 140, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: "#ec008c",
          borderBottom: "1px solid #f8c6dd",
          backgroundColor: "#fff0f7",
        }}
      >
        ✉️ {templateData ? "Edit Email Template" : "New Email Template"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        {/* Name */}
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

        {/* Import Button (Not functional yet) */}
        <Button
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
        </Button>

        {/* Envelope Sender */}
        <Typography variant="body2" fontWeight="500" mb={0.5}>
          Envelope Sender
        </Typography>
        <TextField
          fullWidth
          placeholder="First Last <test@example.com>"
          variant="outlined"
          margin="dense"
          sx={pinkTextFieldSx}
          value={envelopeSender}
          onChange={(e) => setEnvelopeSender(e.target.value)}
        />

        {/* Subject */}
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

        {/* Tabs for Text / HTML */}
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          sx={{
            my: 2,
            "& .MuiTabs-indicator": {
              backgroundColor: pink,
              height: 3,
            },
          }}
          textColor="inherit"
        >
          <Tab label="Text" sx={{ color: tab === 0 ? pink : "#000", fontWeight: "bold" }} />
          <Tab label="HTML" sx={{ color: tab === 1 ? pink : "#000", fontWeight: "bold" }} />
        </Tabs>

        {/* Content Field */}
        <Typography variant="body2" fontWeight="500" mb={0.5}>
          {tab === 0 ? "Text Content" : "HTML Content"}
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder={tab === 0 ? "Plain text content..." : "<html>HTML email...</html>"}
          variant="outlined"
          margin="dense"
          sx={pinkTextFieldSx}
          value={tab === 0 ? textContent : htmlContent}
          onChange={(e) =>
            tab === 0 ? setTextContent(e.target.value) : setHtmlContent(e.target.value)
          }
        />

        {/* Tracking Switch */}
        <FormControlLabel
          control={
            <Switch
              color="primary"
              checked={tracking}
              onChange={(e) => setTracking(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: pink },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: pink,
                },
              }}
            />
          }
          label="Add Tracking Image"
          sx={{ mt: 2 }}
        />

        {/* File Upload */}
        <Box mt={3}>
          <Typography variant="body2" fontWeight="500" mb={1}>
            Add Files
          </Typography>
          <input type="file" multiple onChange={handleFileChange} />
        </Box>

        {/* File Table */}
        {files.length > 0 && (
          <Box mt={2}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#fde2ec" }}>
                  <TableCell>File</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell>{file.name}</TableCell>
                    <TableCell>{(file.size / 1024).toFixed(1)} KB</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleFileDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          SAVE TEMPLATE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTemplateModal;
