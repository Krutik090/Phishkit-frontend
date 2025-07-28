import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Checkbox, FormControlLabel,
  Typography, IconButton
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { toast } from "react-toastify";


const pink = localStorage.getItem("primaryColor");

const pinkTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: pink,
      boxShadow: "0 0 0 0.15rem rgba(236, 0, 140, 0.25)",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f3f4f6",
    }
  },
};

// Helper function to get a cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};


function getCurrentDateTime() {
  const d = new Date();
  const pad = (n, z = 2) => n.toString().padStart(z, '0');
  const ms = d.getMilliseconds().toString().padStart(3, '0') + '0000'; // pad to 7 digits
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const oh = pad(Math.floor(Math.abs(offset) / 60));
  const om = pad(Math.abs(offset) % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}${sign}${oh}:${om}`;
}

const NewSendingProfileModal = ({ open, handleClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    name: "",
    from_address: "",
    interface_type: "SMTP",
    host: "",
    username: "",
    password: "",
    ignore_cert_errors: false,
    headers: [{ key: "", value: "" }],
  });
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (open) {
      // Check user role from cookies when the dialog opens
      try {
        const authUserCookie = getCookie('auth_user');
        if (authUserCookie) {
          const userData = JSON.parse(decodeURIComponent(authUserCookie));
          setIsSuperAdmin(userData.role === 'superadmin');
        } else {
          setIsSuperAdmin(false);
        }
      } catch (error) {
        console.error("Failed to parse user auth cookie:", error);
        setIsSuperAdmin(false);
      }

      if (initialData) {
        setForm({
          name: initialData.name || "",
          from_address: initialData.from_address || "",
          interface_type: initialData.interface_type || "SMTP",
          host: initialData.host || "",
          username: initialData.username || "",
          password: initialData.password || "",
          ignore_cert_errors: initialData.ignore_cert_errors || false,
          headers: initialData.headers?.length > 0 ? initialData.headers : [{ key: "", value: "" }],
        });
      } else {
        setForm({
          name: "",
          from_address: "",
          interface_type: "SMTP",
          host: "",
          username: "",
          password: "",
          ignore_cert_errors: false,
          headers: [{ key: "", value: "" }],
        });
      }
    }
  }, [initialData, open]);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleHeaderChange = (index, keyOrValue, value) => {
    const newHeaders = [...form.headers];
    newHeaders[index][keyOrValue] = value;
    setForm(prev => ({ ...prev, headers: newHeaders }));
  };

  const addHeader = () => {
    setForm(prev => ({ ...prev, headers: [...prev.headers, { key: "", value: "" }] }));
  };

  const removeHeader = (index) => {
    const newHeaders = form.headers.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, headers: newHeaders.length > 0 ? newHeaders : [{key: '', value: ''}] }));
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    if (!isSuperAdmin) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

    const isEdit = !!initialData?.id;
    const url = isEdit
      ? `${API_BASE_URL}/sending-profiles/${initialData.id}`
      : `${API_BASE_URL}/sending-profiles`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const payload = {
        ...form,
        headers: form.headers.filter(h => h.key && h.value), // Filter out empty headers
        modified_date: getCurrentDateTime(),
        ...(isEdit && { id: initialData.id })
      };

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save profile");
      }

      const data = await res.json();
      toast.success(isEdit ? "Sending profile updated successfully!" : "New sending profile created!");
      onSave?.(data);
      handleClose();
    } catch (err) {
      console.error("Error saving sending profile:", err);
      toast.error(err.message || "Failed to save the sending profile.");
    }
  };
  
  const dialogTitle = isSuperAdmin 
    ? (initialData ? "Edit Sending Profile" : "New Sending Profile")
    : "View Sending Profile";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: "bold", color: pink, borderBottom: "1px solid #f0f0f0" }}>
        📧 {dialogTitle}
      </DialogTitle>

      <DialogContent dividers sx={{ px: 4, py: 2, backgroundColor: '#f9fafb' }}>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Name"
            size="small"
            fullWidth
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            sx={pinkTextFieldSx}
            disabled={!isSuperAdmin}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="From Address"
            size="small"
            fullWidth
            value={form.from_address}
            onChange={(e) => handleInputChange("from_address", e.target.value)}
            sx={pinkTextFieldSx}
            disabled={!isSuperAdmin}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <TextField
          label="Interface Type"
          value="SMTP"
          fullWidth
          disabled
          size="small"
          variant="outlined"
          sx={{ mb: 2, ...pinkTextFieldSx }}
          InputLabelProps={{ shrink: true }}
        />

        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="SMTP Host (host:port)"
            size="small"
            fullWidth
            value={form.host}
            onChange={(e) => handleInputChange("host", e.target.value)}
            sx={pinkTextFieldSx}
            disabled={!isSuperAdmin}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Username"
            size="small"
            fullWidth
            value={form.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            sx={pinkTextFieldSx}
            disabled={!isSuperAdmin}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box display="flex" gap={2} mb={2} alignItems="center">
          <TextField
            label="Password"
            type="password"
            size="small"
            fullWidth
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            sx={pinkTextFieldSx}
            disabled={!isSuperAdmin}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.ignore_cert_errors}
                onChange={(e) => handleInputChange("ignore_cert_errors", e.target.checked)}
                size="small"
                sx={{ color: pink, "&.Mui-checked": { color: pink } }}
                disabled={!isSuperAdmin}
              />
            }
            label="Ignore Certificate Errors"
          />
        </Box>

        <Box mt={2}>
          <Typography fontWeight="bold" fontSize={14} mb={1}>
            Custom Headers
          </Typography>

          {form.headers.map((header, index) => (
            <Box key={index} display="flex" gap={1} mb={1} alignItems="center">
              <TextField
                label="Header Key"
                value={header.key}
                onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                fullWidth
                size="small"
                sx={pinkTextFieldSx}
                disabled={!isSuperAdmin}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Header Value"
                value={header.value}
                onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                fullWidth
                size="small"
                sx={pinkTextFieldSx}
                disabled={!isSuperAdmin}
                InputLabelProps={{ shrink: true }}
              />
              {isSuperAdmin && (
                <IconButton onClick={() => removeHeader(index)} sx={{ color: "red" }}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          ))}

          {isSuperAdmin && (
            <Button onClick={addHeader} startIcon={<AddIcon />} variant="outlined" size="small"
              sx={{ textTransform: "none", mt: 1, borderColor: pink, color: pink }}
            >
              Add Header
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2 }}>
        <Button variant="outlined" onClick={handleClose}>
          {isSuperAdmin ? "Cancel" : "Close"}
        </Button>
        {isSuperAdmin && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              background: `linear-gradient(to right,${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`,
              color: "white",
            }}
          >
            Save Profile
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewSendingProfileModal;
