import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
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

const NewUserModel = ({ open, onClose, userData, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [readOnly, setReadOnly] = useState(false); // 🆕 checkbox state

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
      setPassword("");
      setReadOnly(userData.readOnly || false); // Load readOnly from userData if editing
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setReadOnly(false);
    }
  }, [userData, open]);

  const handleSave = async () => {
    try {
      const payload = {
        name,
        email,
        readOnly, // 🆕 send this in the request
        ...(password && { password }),
      };

      const isEditing = !!userData;
      const endpoint = isEditing
        ? `${API_BASE_URL}/auth/users/${userData.id}`
        : `${API_BASE_URL}/auth/register`;

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Something went wrong.");
      }

      toast.success(isEditing ? "User updated successfully!" : "User created successfully!");
      onSave();
    } catch (error) {
      console.error(error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          width: "600px",
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
        👤 {userData ? "Edit User Client" : "New User Client"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        {/* Name Field */}
        <Box mb={2}>
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
        </Box>

        {/* Email Field */}
        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Email
          </Typography>
          <TextField
            fullWidth
            type="email"
            variant="outlined"
            margin="dense"
            sx={pinkTextFieldSx}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>

        {/* Password Field */}
        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Password {userData && <i>(leave blank to keep unchanged)</i>}
          </Typography>
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            margin="dense"
            sx={pinkTextFieldSx}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        {/* Read Only Checkbox */}
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={readOnly}
                onChange={(e) => setReadOnly(e.target.checked)}
                sx={{
                  color: pink,
                  "&.Mui-checked": { color: pink },
                }}
              />
            }
            label="Prevent this user from saving changes?"
          />
        </Box>
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
          {userData ? "UPDATE USER" : "SAVE USER"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserModel;
