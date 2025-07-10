import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;
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

const LdapConfigDialog = ({ open, onClose }) => {
  const [config, setConfig] = useState({
    url: "",
    bindDN: "",
    bindCredentials: "",
    searchBase: "",
    searchFilter: "",
  });

  useEffect(() => {
    if (!open) {
      setConfig({
        url: "",
        bindDN: "",
        bindCredentials: "",
        searchBase: "",
        searchFilter: "",
      });
    }
  }, [open]);

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      toast.success("LDAP connection successful!");
    } catch (err) {
      toast.error(err.message || "Failed to connect to LDAP");
      console.error(err);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ldap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        credentials: "include",
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      toast.success("LDAP configuration saved!");
      onClose(); // Close dialog on success
    } catch (err) {
      toast.error(err.message || "Failed to save configuration");
      console.error(err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          width: "700px",
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
        🛠️ LDAP Configuration
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        {[
          { label: "LDAP URL", key: "url" },
          { label: "Bind DN", key: "bindDN" },
          { label: "Bind Credentials", key: "bindCredentials", type: "password" },
          { label: "Search Base", key: "searchBase" },
          { label: "Search Filter", key: "searchFilter" },
        ].map((field) => (
          <div key={field.key} style={{ marginBottom: 16 }}>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              {field.label}
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              type={field.type || "text"}
              margin="dense"
              sx={pinkTextFieldSx}
              value={config[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </div>
        ))}
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
          onClick={handleTestConnection}
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #3b82f6, #6366f1)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 1,
            textTransform: "none",
            boxShadow: 1,
            "&:hover": {
              background: "linear-gradient(to right, #2563eb, #4f46e5)",
            },
          }}
        >
          TEST CONNECTION
        </Button>

        <Button
          onClick={handleSaveConfiguration}
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
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LdapConfigDialog;
