
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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
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

const NewUserModel = ({ open, onClose, user, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [permission, setPermission] = useState("Read Only");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPassword("");
      setRole(user.role || "User");
      setPermission(user.permission || "Read Only");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("User");
      setPermission("Read Only");
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || (!user && !password.trim())) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        role,
        permission,
        ...(password && { password }),
      };

      const isEditing = !!user;
      const endpoint = isEditing
        ? `${API_BASE_URL}/auth/users/${user.id}`
        : `${API_BASE_URL}/auth/register`;

      const method = isEditing ? "PUT" : "POST";

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

  const dropdownStyles = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#d1d5db",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: pink,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: pink,
    },
    "& .MuiSelect-icon": {
      color: pink,
    },
  };

  const menuItemStyles = {
    "& .MuiMenuItem-root": {
      backgroundColor: "transparent",
      "&.Mui-selected": {
        backgroundColor: "#fce4f6 !important",
        color: pink,
        fontWeight: "bold",
      },
      "&:hover": {
        backgroundColor: "transparent",
      },
    },
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
          border: `2px solid ${localStorage.getItem("primaryColor")}`,
          boxShadow: "0 8px 24px rgba(236, 0, 140, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: localStorage.getItem("primaryColor"),
          borderBottom: `1px solid ${localStorage.getItem("primaryColor")}`,
          backgroundColor: "#f5f5f5",
        }}
      >
        👤 {user ? "Edit User" : "Add User"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        {/* Name Field */}
        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Name <span style={{ color: "#ef4444" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            margin="dense"
            sx={pinkTextFieldSx}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </Box>

        {/* Email Field */}
        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Email <span style={{ color: "#ef4444" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            type="email"
            variant="outlined"
            margin="dense"
            sx={pinkTextFieldSx}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
        </Box>

        {/* Password Field */}
        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Password {user ? <i>(leave blank to keep unchanged)</i> : <span style={{ color: "#ef4444" }}>*</span>}
          </Typography>
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            margin="dense"
            sx={pinkTextFieldSx}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={user ? "Enter new password (optional)" : "Enter password"}
          />
        </Box>

        {/* Role Selection */}
        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Role {user ? <i>(leave blank to keep unchanged)</i> : <span style={{ color: "#ef4444" }}>*</span>}
          </Typography>

          <FormControl fullWidth margin="dense">
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={dropdownStyles}
              MenuProps={{
                PaperProps: {
                  sx: menuItemStyles,
                },
              }}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Maintenance User">Maintenance User</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Permission Selection */}
        <Box mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Permission {user ? <i>(leave blank to keep unchanged)</i> : <span style={{ color: "#ef4444" }}>*</span>}
          </Typography>
          <FormControl fullWidth margin="dense">
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              sx={dropdownStyles}
              MenuProps={{
                PaperProps: {
                  sx: menuItemStyles,
                },
              }}
            >
              <MenuItem value="Launch">Launch</MenuItem>
              <MenuItem value="Read Only">Read Only</MenuItem>
            </Select>
          </FormControl>
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
            background: `linear-gradient(to right,${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 1,
            textTransform: "none",
            boxShadow: 1,
            "&:hover": {
              background: `linear-gradient(to right,${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`
            },
          }}
        >
          {user ? "UPDATE USER" : "SAVE USER"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserModel;
