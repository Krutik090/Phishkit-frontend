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
} from "@mui/material";
import { toast } from "react-toastify";
import CustomNumberInput from "./CustomNumberInput"; // adjust path as needed

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

const NewUserClientModal = ({ open, onClose, userData, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailLimit, setEmailLimit] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
      setEmailLimit(userData.emailLimit || "");
      setPassword(""); // Clear password on edit for security
    } else {
      setName("");
      setEmail("");
      setEmailLimit("");
      setPassword("");
    }
  }, [userData, open]);

  const handleSave = async () => {
    try {
      const payload = {
        name,
        email,
        emailLimit,
        ...(password && { password }), // Include password only if not empty
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

        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Email Limit
          </Typography>
          <CustomNumberInput
            aria-label="Email Limit Input"
            min={1}
            max={100000}
            value={emailLimit}
            onChange={(e, val) => setEmailLimit(val)}
          />
        </Box>

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

export default NewUserClientModal;
