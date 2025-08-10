import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  const ms = d.getMilliseconds().toString().padStart(3, '0') + '0000';
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const oh = pad(Math.floor(Math.abs(offset) / 60));
  const om = pad(Math.abs(offset) % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}${sign}${oh}:${om}`;
}

const NewSendingProfileModal = ({ open, handleClose, onSave, initialData }) => {
  const { darkMode } = useTheme();
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
  const [isSaving, setIsSaving] = useState(false);

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
    advancedToast.success(
      "New header field added.",
      "Header Added",
      { icon: "📝" }
    );
  };

  const removeHeader = (index) => {
    const newHeaders = form.headers.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, headers: newHeaders.length > 0 ? newHeaders : [{key: '', value: ''}] }));
    advancedToast.success(
      "Header field removed.",
      "Header Removed",
      { icon: "🗑️" }
    );
  };

  const handleSubmit = async () => {
    if (!isSuperAdmin) {
      advancedToast.warning(
        "You do not have permission to perform this action.",
        "Access Denied",
        { icon: "🔒" }
      );
      return;
    }

    // Validation
    if (!form.name.trim()) {
      advancedToast.warning(
        "Please enter a sending profile name.",
        "Name Required",
        { icon: "📝" }
      );
      return;
    }

    if (!form.from_address.trim()) {
      advancedToast.warning(
        "Please enter a from address.",
        "From Address Required",
        { icon: "✉️" }
      );
      return;
    }

    if (!form.host.trim()) {
      advancedToast.warning(
        "Please enter an SMTP host.",
        "SMTP Host Required",
        { icon: "🌐" }
      );
      return;
    }

    setIsSaving(true);

    const isEdit = !!initialData?.id;
    const url = isEdit
      ? `${API_BASE_URL}/sending-profiles/${initialData.id}`
      : `${API_BASE_URL}/sending-profiles`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const loadingId = advancedToast.info(
        `${isEdit ? 'Updating' : 'Creating'} sending profile "${form.name}"...`,
        "Saving Profile",
        { icon: "⏳", autoClose: false }
      );

      const payload = {
        ...form,
        headers: form.headers.filter(h => h.key && h.value),
        modified_date: getCurrentDateTime(),
        ...(isEdit && { id: initialData.id })
      };

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      advancedToast.dismissById(loadingId);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save profile");
      }

      const data = await res.json();
      
      advancedToast.success(
        `Sending profile "${form.name}" ${isEdit ? 'updated' : 'created'} successfully!`,
        `Profile ${isEdit ? 'Updated' : 'Created'}`,
        { icon: "✅" }
      );
      
      onSave?.(data);
      handleClose();
    } catch (err) {
      console.error("Error saving sending profile:", err);
      advancedToast.error(
        err.message || "Failed to save the sending profile. Please try again.",
        "Save Failed",
        { icon: "❌" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDialogClose = () => {
    if (isSaving) {
      advancedToast.info(
        "Please wait for the profile to be saved.",
        "Operation in Progress",
        { icon: "⏳" }
      );
      return;
    }
    handleClose();
  };
  
  const dialogTitle = isSuperAdmin 
    ? (initialData ? "Edit Sending Profile" : "New Sending Profile")
    : "View Sending Profile";

  // ✅ FIXED: Enhanced textFieldStyle with proper dark mode colors
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
      borderRadius: '12px',
      color: darkMode ? '#e1e1e1' : '#333', // ✅ Input text color
      '& fieldset': {
        borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
      },
      '&:hover fieldset': {
        borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ec008c',
        borderWidth: '2px',
      },
      '&.Mui-disabled': {
        backgroundColor: darkMode ? alpha('#fff', 0.02) : '#f3f4f6',
        color: darkMode ? '#888' : '#999', // ✅ Disabled text color
      },
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666', // ✅ Label color
      '&.Mui-focused': {
        color: '#ec008c',
      },
      '&.Mui-disabled': {
        color: darkMode ? '#666' : '#999', // ✅ Disabled label color
      },
    },
    // ✅ Fix input text color specifically
    '& .MuiOutlinedInput-input': {
      color: darkMode ? '#e1e1e1' : '#333',
      '&::placeholder': {
        color: darkMode ? '#999' : '#666',
        opacity: 1,
      },
      '&.Mui-disabled': {
        color: darkMode ? '#888' : '#999',
        WebkitTextFillColor: darkMode ? '#888' : '#999', // ✅ Important for disabled state
      },
    },
    // ✅ Fix helper text color
    '& .MuiFormHelperText-root': {
      color: darkMode ? '#999' : '#666',
      '&.Mui-disabled': {
        color: darkMode ? '#666' : '#888',
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onDialogClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background: darkMode ? alpha("#1a1a2e", 0.95) : alpha("#ffffff", 0.95),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
          boxShadow: darkMode ? 
            '0 8px 32px rgba(0, 0, 0, 0.5)' : 
            '0 8px 32px rgba(0, 0, 0, 0.1)',
          // ✅ Advanced scrollbar styling
          '& .MuiDialogContent-root': {
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
              borderRadius: '4px',
              margin: '2px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode 
              ? 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)',
          },
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          fontWeight: "bold", 
          color: darkMode ? '#e1e1e1' : '#333',
          background: `linear-gradient(135deg, ${alpha('#ec008c', 0.1)}, ${alpha('#fc6767', 0.05)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <EmailIcon sx={{ color: '#ec008c' }} />
          {dialogTitle}
        </Box>
        
        <IconButton 
          onClick={onDialogClose}
          size="small"
          disabled={isSaving}
          sx={{
            color: darkMode ? 'grey.400' : 'grey.600',
            '&:hover': {
              backgroundColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.05),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 4, py: 3 }}>
        {/* Name and From Address */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Profile Name *"
            size="small"
            fullWidth
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={!isSuperAdmin || isSaving}
            placeholder="Enter a descriptive name for this profile..."
            sx={textFieldStyle}
          />
          <TextField
            label="From Address *"
            size="small"
            fullWidth
            value={form.from_address}
            onChange={(e) => handleInputChange("from_address", e.target.value)}
            disabled={!isSuperAdmin || isSaving}
            placeholder="sender@example.com"
            sx={textFieldStyle}
          />
        </Box>

        {/* Interface Type */}
        <TextField
          label="Interface Type"
          value="SMTP"
          fullWidth
          disabled
          size="small"
          variant="outlined"
          sx={{ mb: 3, ...textFieldStyle }}
          helperText="Currently only SMTP is supported"
        />

        {/* SMTP Host and Username */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="SMTP Host *"
            size="small"
            fullWidth
            value={form.host}
            onChange={(e) => handleInputChange("host", e.target.value)}
            disabled={!isSuperAdmin || isSaving}
            placeholder="smtp.example.com:587"
            sx={textFieldStyle}
            helperText="Format: host:port (e.g., smtp.gmail.com:587)"
          />
          <TextField
            label="Username"
            size="small"
            fullWidth
            value={form.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            disabled={!isSuperAdmin || isSaving}
            placeholder="Enter SMTP username"
            sx={textFieldStyle}
          />
        </Box>

        {/* Password and Certificate Options */}
        <Box display="flex" gap={2} mb={3} alignItems="flex-start">
          <TextField
            label="Password"
            type="password"
            size="small"
            fullWidth
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            disabled={!isSuperAdmin || isSaving}
            placeholder="Enter SMTP password"
            sx={textFieldStyle}
          />
          <Box sx={{ pt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.ignore_cert_errors}
                  onChange={(e) => handleInputChange("ignore_cert_errors", e.target.checked)}
                  size="small"
                  disabled={!isSuperAdmin || isSaving}
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    "&.Mui-checked": { color: '#ec008c' },
                    "&.Mui-disabled": { 
                      color: darkMode ? '#555' : '#bbb' // ✅ Disabled checkbox color
                    }
                  }}
                />
              }
              label={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? '#e1e1e1' : '#333', // ✅ Checkbox label color
                    fontSize: '0.875rem',
                    '&.Mui-disabled': {
                      color: darkMode ? '#888' : '#999', // ✅ Disabled checkbox label
                    }
                  }}
                >
                  Ignore Certificate Errors
                </Typography>
              }
            />
          </Box>
        </Box>

        {/* Custom Headers Section */}
        <Box mt={3}>
          <Typography 
            fontWeight="bold" 
            fontSize={16} 
            mb={2}
            color={darkMode ? '#e1e1e1' : '#333'} // ✅ Section header color
          >
            Custom Headers
          </Typography>

          {form.headers.map((header, index) => (
            <Box key={index} display="flex" gap={1} mb={2} alignItems="center">
              <TextField
                label="Header Key"
                value={header.key}
                onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                fullWidth
                size="small"
                disabled={!isSuperAdmin || isSaving}
                placeholder="e.g., X-Custom-Header"
                sx={textFieldStyle}
              />
              <TextField
                label="Header Value"
                value={header.value}
                onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                fullWidth
                size="small"
                disabled={!isSuperAdmin || isSaving}
                placeholder="Header value"
                sx={textFieldStyle}
              />
              {isSuperAdmin && (
                <IconButton 
                  onClick={() => removeHeader(index)} 
                  disabled={isSaving}
                  sx={{ 
                    color: '#f44336',
                    '&:hover': {
                      backgroundColor: alpha('#f44336', 0.1),
                    },
                    '&:disabled': {
                      color: darkMode ? '#555' : '#ccc',
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          ))}

          {isSuperAdmin && (
            <Button 
              onClick={addHeader} 
              startIcon={<AddIcon />} 
              variant="outlined" 
              size="small"
              disabled={isSaving}
              sx={{ 
                textTransform: "none", 
                mt: 1, 
                borderRadius: '8px',
                borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                color: darkMode ? '#ccc' : '#666', // ✅ Button text color
                '&:hover': {
                  borderColor: '#ec008c',
                  backgroundColor: alpha('#ec008c', 0.1),
                  color: '#ec008c',
                },
                '&:disabled': {
                  borderColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                  color: darkMode ? '#555' : '#bbb',
                }
              }}
            >
              Add Header
            </Button>
          )}
        </Box>

        {/* Helper text for non-superadmins */}
        {!isSuperAdmin && (
          <Box 
            mt={3} 
            p={2} 
            sx={{
              backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
              borderRadius: '12px',
              border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontStyle: 'italic',
                color: darkMode ? '#bbb' : '#666' // ✅ Helper text color
              }}
            >
              💡 You are viewing this sending profile in read-only mode. Only superadmins can edit SMTP settings.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 3, gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onDialogClose}
          disabled={isSaving}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            color: darkMode ? '#ccc' : '#666', // ✅ Button text color
            borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
            '&:hover': {
              borderColor: darkMode ? alpha('#fff', 0.4) : alpha('#000', 0.4),
            }
          }}
        >
          {isSuperAdmin ? "Cancel" : "Close"}
        </Button>
        {isSuperAdmin && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={isSaving ? null : <SaveIcon />}
            disabled={isSaving || !form.name.trim() || !form.from_address.trim() || !form.host.trim()}
            sx={{
              background: (isSaving || !form.name.trim() || !form.from_address.trim() || !form.host.trim()) ? 
                'rgba(236, 0, 140, 0.3)' : 
                'linear-gradient(135deg, #ec008c, #fc6767)',
              color: "#fff",
              borderRadius: '12px',
              textTransform: 'none',
              minWidth: '140px',
            }}
          >
            {isSaving ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} color="inherit" />
                Saving...
              </Box>
            ) : (
              "Save Profile"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewSendingProfileModal;
