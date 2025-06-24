import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Checkbox, FormControlLabel,
  Typography, IconButton
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { toast } from "react-toastify";


const pink = "#ec008c";

const pinkTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: pink,
      boxShadow: "0 0 0 0.15rem rgba(236, 0, 140, 0.25)",
    },
  },
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
    modified_date: getCurrentDateTime()
  });

  useEffect(() => {
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
        modified_date: getCurrentDateTime()
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
        modified_date: getCurrentDateTime()
      });
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
    const newHeaders = [...form.headers];
    newHeaders.splice(index, 1);
    setForm(prev => ({ ...prev, headers: newHeaders }));
  };

  const handleSubmit = async () => {
    const isEdit = !!initialData?.id;
    const url = isEdit
      ? `http://localhost:5000/api/sending-profiles/${initialData.id}`
      : "http://localhost:5000/api/sending-profiles";

    const method = isEdit ? "PUT" : "POST";

    try {
      const payload = {
        ...form,
        modified_date: getCurrentDateTime(),
        ...(isEdit && { id: initialData.id })
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Payload sent:", payload);

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await res.json();

      toast.success(
        isEdit
          ? "Sending profile updated successfully!"
          : "New sending profile created!"
      );

      onSave?.(data);
      handleClose();
    } catch (err) {
      console.error("Error saving sending profile:", err);
      toast.error("Failed to save the sending profile.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={false}
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
        📧 {initialData ? "Edit Sending Profile" : "New Sending Profile"}
      </DialogTitle>

      <DialogContent dividers sx={{ px: 4, py: 2 }}>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            placeholder="Name"
            size="small"
            fullWidth
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            sx={pinkTextFieldSx}
          />
          <TextField
            placeholder="From Address"
            size="small"
            fullWidth
            value={form.from_address}
            onChange={(e) => handleInputChange("from_address", e.target.value)}
            sx={pinkTextFieldSx}
          />
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <TextField
            placeholder="Interface"
            value="SMTP"
            fullWidth
            disabled
            size="small"
            variant="filled"
            sx={{
              backgroundColor: "#f1f5f9",
              fontWeight: "bold",
              "& .MuiInputBase-root": { fontWeight: "bold" },
            }}
          />
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <TextField
            placeholder="SMTP Host (host:port)"
            size="small"
            fullWidth
            value={form.host}
            onChange={(e) => handleInputChange("host", e.target.value)}
            sx={pinkTextFieldSx}
          />
          <TextField
            placeholder="Username"
            size="small"
            fullWidth
            value={form.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            sx={pinkTextFieldSx}
          />
        </Box>

        <Box display="flex" gap={2} mb={2} alignItems="center">
          <TextField
            placeholder="Password"
            type="password"
            size="small"
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            sx={{ width: "300px", ...pinkTextFieldSx }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.ignore_cert_errors}
                onChange={(e) => handleInputChange("ignore_cert_errors", e.target.checked)}
                size="small"
                sx={{
                  color: pink,
                  "&.Mui-checked": {
                    color: pink,
                  },
                }}
              />
            }
            label="Ignore Certificate Errors"
          />
        </Box>

        <Box>
          <Typography fontWeight="bold" fontSize={14} mb={1}>
            Custom Headers
          </Typography>

          {form.headers.map((header, index) => (
            <Box key={index} display="flex" gap={1} mb={1}>
              <TextField
                placeholder="Header Key"
                value={header.key}
                onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                fullWidth
                size="small"
                sx={pinkTextFieldSx}
              />
              <TextField
                placeholder="Header Value"
                value={header.value}
                onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                fullWidth
                size="small"
                sx={pinkTextFieldSx}
              />
              <IconButton onClick={() => removeHeader(index)} sx={{ color: "red" }}>
                <CloseIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            onClick={addHeader}
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
              mt: 1,
              borderColor: "#ec4899",
              color: "#ec4899",
              "&:hover": {
                borderColor: "#db2777",
                backgroundColor: "rgba(236, 72, 153, 0.04)",
              },
            }}
          >
            Add Header
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            color: "#374151",
            borderColor: "#d1d5db",
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "none",
            mr: 1,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: "linear-gradient(to right, #ec4899, #d946ef)",
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: 1,
            "&:hover": {
              background: "linear-gradient(to right, #db2777, #c026d3)",
            },
          }}
        >
          Save Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewSendingProfileModal;
