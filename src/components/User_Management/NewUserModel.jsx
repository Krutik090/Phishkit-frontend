import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  alpha,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { advancedToast } from "../../utils/toast";
import { useTheme } from "../../context/ThemeContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const NewUserModel = ({ open, onClose, user, onSave }) => {
  const { darkMode } = useTheme();
  const isEdit = Boolean(user?._id);

  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Effect to populate form when editing
  useEffect(() => {
    if (isEdit && user) {
      setName(user.name || "");
      setEmail(user.email || "");
    } else {
      // Reset form for create mode or when modal closes
      setName("");
      setEmail("");
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [user, isEdit, open]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (isEdit) {
        // --- UPDATE USER LOGIC ---
        const payload = { name: name.trim() };
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                advancedToast.warning("New passwords do not match.", "Password Mismatch");
                setIsLoading(false);
                return;
            }
            payload.currentPassword = currentPassword;
            payload.newPassword = newPassword;
            payload.confirmPassword = confirmPassword;
        }

        const res = await fetch(`${API_BASE_URL}/superadmin/${user._id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to update user");
        advancedToast.success(`User "${name}" updated successfully.`, "Update Successful", { icon: "📝" });

      } else {
        // --- CREATE USER LOGIC ---
        if (!email || !password) {
            advancedToast.warning("Email and password are required for new users.", "Missing Fields");
            setIsLoading(false);
            return;
        }
        const payload = { name: name.trim(), email: email.trim(), password: password.trim() };
        const res = await fetch(`${API_BASE_URL}/superadmin/create-user`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).message || "User creation failed");
        advancedToast.success(`User "${name}" created successfully.`, "User Created", { icon: "✨" });
      }
      onSave();
    } catch (err) {
      advancedToast.error(err.message, "Operation Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: '90%', sm: 500 },
    background: darkMode ? alpha("#1a1a2e", 0.9) : alpha("#ffffff", 0.9),
    backdropFilter: 'blur(16px)',
    border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
    borderRadius: '20px',
    boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
    p: 4,
  };

  const textFieldSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
      borderRadius: '12px',
      color: darkMode ? 'grey.100' : 'grey.800',
      '& fieldset': { borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2) },
      '&:hover fieldset': { borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3) },
      '&.Mui-focused fieldset': { borderColor: '#ec008c', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root': { color: darkMode ? 'grey.300' : 'grey.600', '&.Mui-focused': { color: '#ec008c' } },
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? 'grey.100' : 'grey.800', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEdit ? <EditIcon /> : <PersonAddIcon />}
            {isEdit ? "Edit User" : "Add New User"}
          </Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>

        <TextField fullWidth autoFocus label="Name" value={name} onChange={(e) => setName(e.target.value)} sx={textFieldSx} />
        <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isEdit} sx={textFieldSx} />
        
        {!isEdit && (
            <TextField fullWidth type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} sx={textFieldSx} />
        )}

        {isEdit && (
          <>
            <Divider sx={{ my: 2 }}>Change Password (Optional)</Divider>
            <TextField fullWidth type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} sx={textFieldSx} />
            <TextField fullWidth type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={textFieldSx} />
            <TextField fullWidth type="password" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={textFieldSx} />
          </>
        )}

        <Box mt={4} display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            startIcon={isLoading ? null : <SaveIcon />}
            sx={{
              background: `linear-gradient(135deg, #ec008c, #fc6767)`,
              color: "#fff", fontWeight: "bold", py: 1.5, borderRadius: '12px',
              textTransform: 'none', fontSize: '1rem',
            }}
          >
            {isLoading ? "Saving..." : (isEdit ? "Update User" : "Create User")}
          </Button>
          <Button onClick={onClose} sx={{ color: darkMode ? 'grey.400' : 'grey.600', textTransform: 'none' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewUserModel;
