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
const pink = localStorage.getItem("primaryColor");

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

  // 🔄 Load existing config on dialog open
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
            resetForm(); // no config
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
      const res = await fetch(`${API_BASE_URL}/check`, {
        method: "GET",
        credentials: "include",
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
          border: `2px solid ${localStorage.getItem("primaryColor")}`,
          boxShadow: `0 8px 24px ${localStorage.getItem("primaryColor")}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: pink,
          borderBottom: `1px solid ${localStorage.getItem("primaryColor")}`,
          backgroundColor: "#f5f5f5",
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
            background: `linear-gradient(to right,${localStorage.getItem("primaryColor")}, ${localStorage.getItem('secondaryColor')})`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 1,
            textTransform: "none",
            boxShadow: 1,
            "&:hover": {
              background: `linear-gradient(to right,${localStorage.getItem("primaryColor")}, ${localStorage.getItem('secondaryColor')})`,
            },
          }}
        >
          TEST CONNECTION
        </Button>

        <Button
          onClick={handleSaveConfiguration}
          variant="contained"
          sx={{
            background: `linear-gradient(to right,${localStorage.getItem("primaryColor")}, ${localStorage.getItem('secondaryColor')})`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 1,
            textTransform: "none",
            boxShadow: 1,
            "&:hover": {
              background: `linear-gradient(to right,${localStorage.getItem("primaryColor")}, ${localStorage.getItem('secondaryColor')})`,
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
