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
  const isEdit = Boolean(user?._id);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/superadmin/users-under-admin/${user._id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch user info.");
        }
        const userData = await res.json();
        setName(userData.name || "");
        setEmail(userData.email || "");
      } catch (error) {
        console.error("Error loading user details:", error.message);
        toast.error("Unable to load user details.");
      }
    };

    if (user?._id && open) {
      fetchUserDetails();
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [user, open]);


  const handleSave = async () => {
    if (!name.trim()) {
      return toast.error("Name is required");
    }

    try {
      if (isEdit) {
        // Update flow
        const payload = {
          name: name.trim(),
          ...(currentPassword && {
            currentPassword: currentPassword.trim(),
            newPassword: newPassword.trim(),
            confirmPassword: confirmPassword.trim(),
          }),
        };

        if (newPassword || confirmPassword) {
          if (newPassword !== confirmPassword) {
            return toast.error("New password and confirm password do not match");
          }
        }

        const res = await fetch(`${API_BASE_URL}/superadmin/${user._id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to update user");
        }

        toast.success("User updated successfully!");
      } else {
        // Create flow
        if (!email.trim() || !password.trim()) {
          return toast.error("Email and password are required");
        }

        const res = await fetch(`${API_BASE_URL}/superadmin/create-user`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "User creation failed");
        }

        toast.success("User created successfully!");
      }

      onSave();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "✏️ Edit User" : "👤 Add User"}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 4 }}>
        {/* Name */}
        <TextField
          fullWidth
          label="Name"
          margin="dense"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={pinkTextFieldSx}
        />

        {/* Email - only in create mode */}
        {!isEdit && (
          <TextField
            fullWidth
            type="email"
            label="Email"
            margin="dense"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={pinkTextFieldSx}
          />
        )}

        {/* Password (create) */}
        {!isEdit && (
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="dense"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={pinkTextFieldSx}
          />
        )}

        {/* Password fields in edit */}
        {isEdit && (
          <>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              margin="dense"
              variant="outlined"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={pinkTextFieldSx}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              margin="dense"
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={pinkTextFieldSx}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              margin="dense"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={pinkTextFieldSx}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          {isEdit ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default NewUserModel;
