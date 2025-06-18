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

const pink = "#ec008c";

const pinkTextFieldSx = {
  "& label.Mui-focused": {
    color: pink,
  },
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

  // Load templateData when modal opens or changes
  useEffect(() => {
    if (templateData) {
      setName(templateData.name || "");
      setSubject(templateData.subject || "");
      setTextContent(templateData.text || "");
      setHtmlContent(templateData.html || "");
      setFiles(templateData.attachments || []);
      // envelopeSender is not in your sample data, so optional or keep empty
      setEnvelopeSender(""); 
      setTracking(true); // you can modify if needed based on data
      setTab(0);
    } else {
      // Reset for new template
      setName("");
      setSubject("");
      setTextContent("");
      setHtmlContent("");
      setFiles([]);
      setEnvelopeSender("");
      setTracking(true);
      setTab(0);
    }
  }, [templateData, open]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const handleFileDelete = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSave = async () => {
    const payload = {
      name,
      subject,
      text: textContent,
      html: htmlContent,
      attachments: files,
      // envelopeSender and tracking can be added here if your backend supports it
    };

    try {
      let response;
      if (templateData?.id) {
        // PUT update
        response = await fetch(`http://localhost:5000/api/templates/${templateData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: templateData.id, ...payload }),
        });
      } else {
        // POST create
        response = await fetch("http://localhost:5000/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      const savedData = await response.json();
      onSave(savedData);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving template. Please try again.");
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

        {/* Import Button */}
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
            "&:hover": {
              backgroundColor: "#d6007a",
            },
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

        {/* Tabs */}
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
          <Tab
            label="Text"
            sx={{
              color: tab === 0 ? pink : "#000",
              fontWeight: tab === 0 ? "bold" : "normal",
              textTransform: "none",
            }}
          />
          <Tab
            label="HTML"
            sx={{
              color: tab === 1 ? pink : "#000",
              fontWeight: tab === 1 ? "bold" : "normal",
              textTransform: "none",
            }}
          />
        </Tabs>

        {/* Body */}
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
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: pink,
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: pink,
                },
              }}
            />
          }
          label="Add Tracking Image"
          sx={{ mt: 2 }}
        />

        {/* Files */}
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
