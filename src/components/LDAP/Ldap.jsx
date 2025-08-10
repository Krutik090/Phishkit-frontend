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
  IconButton,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  const { darkMode } = useTheme();
  const [config, setConfig] = useState({
    url: "",
    bindDN: "",
    bindCredentials: "",
    searchBase: "",
    searchFilter: "",
  });

  const [configExists, setConfigExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setIsLoading(true);
      
      const loadingId = advancedToast.info(
        "Loading LDAP configuration...",
        "Loading Config",
        { icon: "⏳", autoClose: false }
      );

      fetch(`${API_BASE_URL}/ldap`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          advancedToast.dismissById(loadingId);
          
          if (data && !data.error) {
            setConfig(data);
            setConfigExists(true);
            
            advancedToast.success(
              "Existing LDAP configuration loaded.",
              "Config Loaded",
              { icon: "⚙️" }
            );
          } else {
            resetForm();
          }
        })
        .catch((err) => {
          console.error("❌ Failed to fetch LDAP config:", err);
          advancedToast.dismissById(loadingId);
          advancedToast.error(
            "Could not load LDAP configuration.",
            "Load Failed",
            { icon: "❌" }
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      resetForm();
    }
  }, [open]);

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    // Validation
    if (!config.url.trim()) {
      advancedToast.warning(
        "Please enter the LDAP URL to test connection.",
        "URL Required",
        { icon: "🔗" }
      );
      return;
    }

    if (!config.bindDN.trim()) {
      advancedToast.warning(
        "Please enter the Bind DN to test connection.",
        "Bind DN Required",
        { icon: "👤" }
      );
      return;
    }

    if (!config.bindCredentials.trim()) {
      advancedToast.warning(
        "Please enter the Bind Credentials to test connection.",
        "Credentials Required",
        { icon: "🔑" }
      );
      return;
    }

    setIsTesting(true);

    try {
      const loadingId = advancedToast.info(
        "Testing LDAP connection...",
        "Connecting to Server",
        { icon: "🔍", autoClose: false }
      );

      const res = await fetch(`${API_BASE_URL}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });
      
      const data = await res.json();
      
      advancedToast.dismissById(loadingId);

      if (data.error) throw new Error(data.error);
      
      advancedToast.success(
        "LDAP connection successful! Server is reachable and credentials are valid.",
        "Connection Successful",
        { icon: "✅" }
      );
    } catch (err) {
      console.error("❌ LDAP Test Error:", err.message);
      advancedToast.error(
        err.message || "Failed to connect to LDAP server. Please check your settings.",
        "Connection Failed",
        { icon: "🔌" }
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfiguration = async () => {
    // Validation
    const requiredFields = ['url', 'bindDN', 'bindCredentials', 'searchBase'];
    const emptyFields = requiredFields.filter(field => !config[field].trim());

    if (emptyFields.length > 0) {
      advancedToast.warning(
        "Please fill in all required fields before saving.",
        "Required Fields Missing",
        { icon: "📝" }
      );
      return;
    }

    setIsSaving(true);

    try {
      const method = configExists ? "PUT" : "POST";
      
      const loadingId = advancedToast.info(
        `${configExists ? 'Updating' : 'Saving'} LDAP configuration...`,
        "Saving Config",
        { icon: "⏳", autoClose: false }
      );

      const response = await fetch(`${API_BASE_URL}/ldap`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });

      const data = await response.json();
      
      advancedToast.dismissById(loadingId);

      if (data.error) throw new Error(data.error);

      advancedToast.success(
        `LDAP configuration ${configExists ? 'updated' : 'saved'} successfully!`,
        `Config ${configExists ? 'Updated' : 'Saved'}`,
        { icon: "✅" }
      );
      
      onClose();
    } catch (err) {
      console.error("❌ Save Config Error:", err.message);
      advancedToast.error(
        err.message || "Failed to save LDAP configuration. Please try again.",
        "Save Failed",
        { icon: "❌" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDialogClose = () => {
    if (isTesting || isSaving) {
      advancedToast.info(
        "Please wait for the current operation to complete.",
        "Operation in Progress",
        { icon: "⏳" }
      );
      return;
    }
    onClose();
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
      borderRadius: '12px',
      color: darkMode ? '#e1e1e1' : '#333',
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
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666',
      '&.Mui-focused': {
        color: '#ec008c',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: `${darkMode ? '#e1e1e1' : '#333'} !important`,
      '&::placeholder': {
        color: darkMode ? '#999' : '#666',
        opacity: 1,
      },
    },
    '& .MuiFormHelperText-root': {
      color: darkMode ? '#999' : '#666',
    },
  };

  // ✅ Check if form is valid
  const isFormValid = config.url.trim() && config.bindDN.trim() && config.bindCredentials.trim() && config.searchBase.trim();

  return (
    <Dialog
      open={open}
      onClose={onDialogClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          width: "700px",
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
          <SettingsIcon sx={{ color: '#ec008c' }} />
          LDAP Configuration
        </Box>
        
        <IconButton 
          onClick={onDialogClose} 
          size="small"
          disabled={isTesting || isSaving}
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

      <DialogContent dividers sx={{ p: 4 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Box textAlign="center">
              <CircularProgress size={48} sx={{ mb: 2, color: '#ec008c' }} />
              <Typography variant="body1" color="text.secondary">
                Loading configuration...
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                color: darkMode ? '#ccc' : '#666',
              }}
            >
              Configure the settings to connect to your Active Directory server via LDAP. This will enable fetching users directly into groups.
            </Typography>

            {ldapFields.map((field) => (
              <Box key={field.key} sx={{ mb: 3 }}>
                <Typography 
                  variant="body2" 
                  fontWeight="500" 
                  mb={1}
                  color={darkMode ? '#e1e1e1' : '#333'}
                >
                  {field.label} {field.key !== 'searchFilter' && '*'}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={field.type === 'password' && !showPassword ? 'password' : 'text'}
                  margin="dense"
                  value={config[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  disabled={isTesting || isSaving}
                  sx={textFieldStyle}
                  InputProps={field.type === 'password' ? {
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: darkMode ? '#ccc' : '#666' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  } : undefined}
                />
              </Box>
            ))}

            {/* Connection Status */}
            {configExists && (
              <Box 
                mt={3} 
                p={2} 
                sx={{
                  backgroundColor: darkMode ? alpha('#4caf50', 0.1) : alpha('#4caf50', 0.05),
                  borderRadius: '12px',
                  border: `1px solid ${alpha('#4caf50', 0.3)}`,
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#4caf50',
                    fontWeight: 'medium',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                  Existing configuration detected. Update the fields above to modify settings.
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 3, gap: 2, borderTop: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}` }}>
        <Button 
          onClick={onDialogClose} 
          variant="outlined"
          disabled={isTesting || isSaving}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            color: darkMode ? '#ccc' : '#666',
            borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
            '&:hover:not(.Mui-disabled)': {
              borderColor: darkMode ? alpha('#fff', 0.4) : alpha('#000', 0.4),
            },
            // ✅ FIXED: Disabled state styling
            '&.Mui-disabled': {
              borderColor: `${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important`,
              color: `${darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)'} !important`,
            },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleTestConnection}
          variant="outlined"
          startIcon={isTesting ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          disabled={isTesting || isSaving || !config.url.trim() || !config.bindDN.trim() || !config.bindCredentials.trim()}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
            color: darkMode ? '#ccc' : '#666',
            '&:hover:not(.Mui-disabled)': {
              borderColor: '#ec008c',
              backgroundColor: alpha('#ec008c', 0.1),
              color: '#ec008c',
            },
            // ✅ FIXED: Disabled state styling
            '&.Mui-disabled': {
              borderColor: `${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important`,
              color: `${darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)'} !important`,
              backgroundColor: 'transparent !important',
            },
          }}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>

        <Button
          onClick={handleSaveConfiguration}
          variant="contained"
          startIcon={isSaving ? null : <SaveIcon />}
          disabled={isTesting || isSaving || !isFormValid}
          sx={{
            background: (isTesting || isSaving || !isFormValid) ? 
              'transparent' : 
              'linear-gradient(135deg, #ec008c, #fc6767)',
            color: (isTesting || isSaving || !isFormValid) ?
              (darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.26)') :
              "#fff",
            borderRadius: '12px',
            textTransform: 'none',
            minWidth: '160px',
            // ✅ FIXED: Enhanced disabled state styling with better visibility
            border: (isTesting || isSaving || !isFormValid) ?
              `2px dashed ${darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}` :
              'none',
            '&.Mui-disabled': {
              background: 'transparent !important',
              color: `${darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.26)'} !important`,
              border: `2px dashed ${darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'} !important`,
              opacity: '1 !important',
            },
            '&:hover:not(.Mui-disabled)': {
              background: 'linear-gradient(135deg, #d6007a, #e55555)',
            },
          }}
        >
          {isSaving ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} color="inherit" />
              Saving...
            </Box>
          ) : (
            "Save Configuration"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LdapConfigDialog;
