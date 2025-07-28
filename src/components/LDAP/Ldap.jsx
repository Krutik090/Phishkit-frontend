import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const pink = localStorage.getItem("primaryColor") || '#EC008C';
const secondaryColor = localStorage.getItem("secondaryColor") || '#FC6767';

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

// Enhanced field definitions with placeholders and helper text
const ldapFields = [
  { 
    label: "LDAP URL", 
    key: "url", 
    placeholder: "ldaps://your-domain-controller:636",
    helperText: "The full URL to your LDAP or LDAPS server."
  },
  { 
    label: "Bind DN", 
    key: "bindDN", 
    placeholder: "CN=ServiceUser,OU=Users,DC=example,DC=com",
    helperText: "The Distinguished Name of the user account used to connect and search LDAP."
  },
  { 
    label: "Bind Credentials", 
    key: "bindCredentials", 
    type: "password",
    placeholder: "Enter password for the Bind DN user",
    helperText: "The password for the Bind DN user account."
  },
  { 
    label: "Search Base", 
    key: "searchBase",
    placeholder: "OU=Users,DC=example,DC=com",
    helperText: "The Distinguished Name of the container where users will be searched."
  },
  { 
    label: "Search Filter", 
    key: "searchFilter",
    placeholder: "(&(objectClass=user)(mail=*))",
    helperText: "The LDAP filter to find user objects. The default usually works well."
  },
];

const LdapConfigDialog = ({ open, onClose }) => {
  const [config, setConfig] = useState({
    url: "",
    bindDN: "",
    bindCredentials: "",
    searchBase: "",
    searchFilter: "",
  });

  const [configExists, setConfigExists] = useState(false);

  const resetForm = () => {
    setConfig({
      url: "",
      bindDN: "",
      bindCredentials: "",
      searchBase: "",
      searchFilter: "",
    });
    setConfigExists(false);
  };

  // Load existing config on dialog open
  useEffect(() => {
    if (open) {
      fetch(`${API_BASE_URL}/ldap`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setConfig(data);
            setConfigExists(true);
          } else {
            resetForm();
          }
        })
        .catch((err) => {
          console.error("❌ Failed to fetch LDAP config:", err);
          toast.error("Could not load LDAP config.");
        });
    } else {
      resetForm();
    }
  }, [open]);

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    try {
      // We send the current config to the backend to test with, even if not saved.
      const res = await fetch(`${API_BASE_URL}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("LDAP connection successful!");
    } catch (err) {
      console.error("❌ LDAP Test Error:", err.message);
      toast.error(err.message || "Failed to test LDAP connection.");
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      const method = configExists ? "PUT" : "POST";
      const response = await fetch(`${API_BASE_URL}/ldap`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success("LDAP configuration saved!");
      onClose();
    } catch (err) {
      console.error("❌ Save Config Error:", err.message);
      toast.error(err.message || "Failed to save LDAP configuration.");
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
          border: `2px solid ${pink}`,
          boxShadow: `0 8px 24px ${pink}33`,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: pink,
          borderBottom: `1px solid #f0f0f0`,
          backgroundColor: "#f9fafb",
        }}
      >
        🛠️ LDAP Configuration
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Configure the settings to connect to your Active Directory server via LDAP. This will enable fetching users directly into groups.
        </Typography>
        {ldapFields.map((field) => (
          <Box key={field.key} sx={{ mb: 2 }}>
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
              placeholder={field.placeholder}
              helperText={field.helperText}
            />
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={onClose} variant="outlined">
          CANCEL
        </Button>

        <Button
          onClick={handleTestConnection}
          variant="outlined"
          color="secondary"
        >
          TEST CONNECTION
        </Button>

        <Button
          onClick={handleSaveConfiguration}
          variant="contained"
          sx={{
            background: `linear-gradient(to right, ${pink}, ${secondaryColor})`,
            color: "#fff",
          }}
        >
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LdapConfigDialog;
