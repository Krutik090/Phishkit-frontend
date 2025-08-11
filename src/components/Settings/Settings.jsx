import React, {
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext'; // Use your existing theme context
import { advancedToast } from '../../utils/toast'; // Use your advanced toast

// API Constants
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Local Theme Context for color customization (separate from main dark mode theme)
export const ColorThemeContext = createContext();
export const useThemeColors = () => useContext(ColorThemeContext);

export const ColorThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#ec008c';
  });

  const [secondaryColor, setSecondaryColor] = useState(() => {
    return localStorage.getItem('secondaryColor') || '#fc6767';
  });

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('secondaryColor', secondaryColor);
  }, [secondaryColor]);

  return (
    <ColorThemeContext.Provider
      value={{ primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor }}
    >
      {children}
    </ColorThemeContext.Provider>
  );
};

const SettingsContent = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // Use your existing theme context
  const { primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor } = useThemeColors();

  const [user, setUser] = useState(null);
  const [enableMFA, setEnableMFA] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [loadingQR, setLoadingQR] = useState(false);
  const [status, setStatus] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);

  // ✅ Enhanced TextField styling for dark mode
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
        borderColor: primaryColor,
        borderWidth: '2px',
        boxShadow: `0 0 0 4px ${alpha(primaryColor, 0.1)}`,
      },
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666',
      '&.Mui-focused': {
        color: primaryColor,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: `${darkMode ? '#e1e1e1' : '#333'} !important`,
      '&::placeholder': {
        color: darkMode ? '#999' : '#666',
        opacity: 1,
      },
    },
    mb: 3,
  };

  useEffect(() => {
    const loadingId = advancedToast.info(
      "Loading user settings...",
      "Loading",
      { icon: "⏳", autoClose: false }
    );

    axios
      .get(`${API_BASE_URL}/protected`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        advancedToast.dismissById(loadingId);
        advancedToast.success(
          "Settings loaded successfully!",
          "Welcome",
          { icon: "⚙️" }
        );
      })
      .catch(() => {
        advancedToast.dismissById(loadingId);
        advancedToast.error(
          "Session expired. Please login again.",
          "Authentication Required",
          { icon: "🔒" }
        );
        navigate('/login');
      });
  }, []);

  const handleApplyTheme = async () => {
    setIsApplyingTheme(true);
    setStatus('applying');

    try {
      const loadingId = advancedToast.info(
        "Applying new theme colors...",
        "Updating Theme",
        { icon: "🎨", autoClose: false }
      );

      await axios.put(
        `${API_BASE_URL}/auth/update-theme`,
        { primaryColor, secondaryColor },
        { withCredentials: true }
      );

      advancedToast.dismissById(loadingId);
      setStatus('success');
      
      advancedToast.success(
        "Theme updated successfully! Refreshing page...",
        "Theme Applied",
        { icon: "✨" }
      );

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Theme update failed:', err);
      setStatus('error');
      advancedToast.error(
        "Failed to update theme. Please try again.",
        "Update Failed",
        { icon: "❌" }
      );
    } finally {
      setIsApplyingTheme(false);
    }
  };

  const handleEnableMFA = async (checked) => {
    setEnableMFA(checked);
    setQrCode(null);
    setMfaCode('');

    if (checked) {
      setLoadingQR(true);
      
      try {
        const loadingId = advancedToast.info(
          "Generating MFA QR code...",
          "Setting up MFA",
          { icon: "🔐", autoClose: false }
        );

        const res = await axios.post(`${API_BASE_URL}/auth/mfa/setup`, {}, { withCredentials: true });
        setQrCode(res.data.qr);
        
        advancedToast.dismissById(loadingId);
        advancedToast.success(
          "QR code generated! Scan with your authenticator app.",
          "MFA Setup",
          { icon: "📱" }
        );
      } catch (err) {
        console.error('QR generation error:', err);
        advancedToast.error(
          "Failed to generate QR code. Please try again.",
          "MFA Setup Failed",
          { icon: "❌" }
        );
      } finally {
        setLoadingQR(false);
      }
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    if (!mfaCode.trim() || mfaCode.length !== 6) {
      advancedToast.warning(
        "Please enter a valid 6-digit MFA code.",
        "Invalid Code",
        { icon: "🔢" }
      );
      return;
    }

    setIsVerifyingMFA(true);

    try {
      const loadingId = advancedToast.info(
        "Verifying MFA code...",
        "Verifying",
        { icon: "🔍", autoClose: false }
      );

      await axios.post(
        `${API_BASE_URL}/auth/mfa/verify`,
        { token: mfaCode.trim() },
        { withCredentials: true }
      );

      advancedToast.dismissById(loadingId);
      advancedToast.success(
        "MFA enabled successfully! Your account is now more secure.",
        "MFA Enabled",
        { icon: "🛡️" }
      );
      
      setMfaCode('');
    } catch (err) {
      console.error('MFA verification failed:', err);
      advancedToast.error(
        "Invalid MFA code. Please check your authenticator app and try again.",
        "Verification Failed",
        { icon: "❌" }
      );
    } finally {
      setIsVerifyingMFA(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      advancedToast.warning(
        "Please enter your current password.",
        "Current Password Required",
        { icon: "🔑" }
      );
      return;
    }

    if (newPassword.length < 8) {
      advancedToast.warning(
        "New password must be at least 8 characters long.",
        "Password Too Short",
        { icon: "📏" }
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      advancedToast.warning(
        "New passwords do not match. Please check and try again.",
        "Password Mismatch",
        { icon: "⚠️" }
      );
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const loadingId = advancedToast.info(
        "Updating your password...",
        "Updating Password",
        { icon: "🔒", autoClose: false }
      );

      await axios.put(
        `${API_BASE_URL}/auth/update-password`,
        { currentPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );

      advancedToast.dismissById(loadingId);
      advancedToast.success(
        "Password updated successfully! Your account is secure.",
        "Password Updated",
        { icon: "✅" }
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      advancedToast.error(
        err.response?.data?.message || "Failed to update password. Please check your current password and try again.",
        "Update Failed",
        { icon: "❌" }
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* ✅ Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '20px',
          background: darkMode 
            ? `linear-gradient(135deg, ${alpha('#1a1a2e', 0.8)}, ${alpha('#2d2d3e', 0.6)})` 
            : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)}, ${alpha('#f8f9fa', 0.8)})`,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              borderRadius: '16px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SecurityIcon sx={{ color: '#fff', fontSize: '2rem' }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: darkMode ? '#e1e1e1' : '#333',
                mb: 0.5,
              }}
            >
              Settings
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: darkMode ? '#ccc' : '#666',
                opacity: 0.8,
              }}
            >
              Customize your account and security preferences
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ✅ Theme Colors Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: '20px',
          background: darkMode 
            ? alpha("#1a1a2e", 0.6) 
            : alpha("#ffffff", 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <PaletteIcon sx={{ color: primaryColor, fontSize: '1.5rem' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: darkMode ? '#e1e1e1' : '#333',
            }}
          >
            Theme Colors
          </Typography>
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            color: darkMode ? '#ccc' : '#666',
            mb: 3,
          }}
        >
          Customize the primary and secondary colors for your interface
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: darkMode ? '#e1e1e1' : '#333',
                mb: 1,
                fontWeight: 'medium',
              }}
            >
              Primary Color
            </Typography>
            <Box
              sx={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: `2px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.1)}`,
              }}
            >
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ 
                  width: 80, 
                  height: 50, 
                  border: 'none', 
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: darkMode ? '#e1e1e1' : '#333',
                mb: 1,
                fontWeight: 'medium',
              }}
            >
              Secondary Color
            </Typography>
            <Box
              sx={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: `2px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.1)}`,
              }}
            >
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{ 
                  width: 80, 
                  height: 50, 
                  border: 'none', 
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={handleApplyTheme}
            disabled={isApplyingTheme}
            startIcon={isApplyingTheme ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{
              background: isApplyingTheme 
                ? 'rgba(236, 0, 140, 0.3)' 
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              py: 1.5,
              mt: { xs: 2, sm: 0 },
              '&:hover': {
                background: isApplyingTheme 
                  ? 'rgba(236, 0, 140, 0.3)' 
                  : `linear-gradient(135deg, ${alpha(primaryColor, 0.8)}, ${alpha(secondaryColor, 0.8)})`,
              },
            }}
          >
            {isApplyingTheme ? 'Applying...' : 'Apply Theme'}
          </Button>
        </Box>

        {/* Preview Box */}
        <Box
          sx={{
            p: 3,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${alpha(primaryColor, 0.1)}, ${alpha(secondaryColor, 0.05)})`,
            border: `1px solid ${alpha(primaryColor, 0.2)}`,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: darkMode ? '#e1e1e1' : '#333',
              fontWeight: 'medium',
            }}
          >
            🎨 Preview: This is how your selected colors will look in the interface
          </Typography>
        </Box>
      </Paper>

      {/* ✅ Password Change Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: '20px',
          background: darkMode 
            ? alpha("#1a1a2e", 0.6) 
            : alpha("#ffffff", 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <LockIcon sx={{ color: primaryColor, fontSize: '1.5rem' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: darkMode ? '#e1e1e1' : '#333',
            }}
          >
            Change Password
          </Typography>
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            color: darkMode ? '#ccc' : '#666',
            mb: 3,
          }}
        >
          Update your password to keep your account secure
        </Typography>

        <Box 
          component="form" 
          onSubmit={handlePasswordUpdate} 
          sx={{ maxWidth: 500 }}
        >
          <TextField
            type={showCurrentPassword ? 'text' : 'password'}
            placeholder="Current Password"
            fullWidth
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isUpdatingPassword}
            sx={textFieldStyle}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: darkMode ? '#ccc' : '#666' }}
                >
                  {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />

          <TextField
            type={showNewPassword ? 'text' : 'password'}
            placeholder="New Password (min 8 characters)"
            fullWidth
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isUpdatingPassword}
            sx={textFieldStyle}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: darkMode ? '#ccc' : '#666' }}
                >
                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />

          <TextField
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm New Password"
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isUpdatingPassword}
            sx={textFieldStyle}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: darkMode ? '#ccc' : '#666' }}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
            startIcon={isUpdatingPassword ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
            sx={{
              background: (isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword) 
                ? 'rgba(236, 0, 140, 0.3)' 
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              '&:hover': {
                background: (isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword) 
                  ? 'rgba(236, 0, 140, 0.3)' 
                  : `linear-gradient(135deg, ${alpha(primaryColor, 0.8)}, ${alpha(secondaryColor, 0.8)})`,
              },
            }}
          >
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </Paper>

      {/* ✅ MFA Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '20px',
          background: darkMode 
            ? alpha("#1a1a2e", 0.6) 
            : alpha("#ffffff", 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <ShieldIcon sx={{ color: primaryColor, fontSize: '1.5rem' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: darkMode ? '#e1e1e1' : '#333',
            }}
          >
            Multi-Factor Authentication
          </Typography>
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            color: darkMode ? '#ccc' : '#666',
            mb: 3,
          }}
        >
          Add an extra layer of security to your account using an authenticator app like Google Authenticator or Authy.
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableMFA}
                  onChange={(e) => handleEnableMFA(e.target.checked)}
                  disabled={loadingQR}
                  sx={{
                    color: darkMode ? '#ccc' : '#666',
                    '&.Mui-checked': {
                      color: primaryColor,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: darkMode ? '#e1e1e1' : '#333', fontWeight: 'medium' }}>
                  Enable Multi-Factor Authentication
                </Typography>
              }
            />

            {enableMFA && (
              <Box component="form" onSubmit={handleVerifyMFA} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Enter 6-digit code from your authenticator app"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  inputProps={{ maxLength: 6 }}
                  disabled={isVerifyingMFA}
                  sx={textFieldStyle}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isVerifyingMFA || mfaCode.length !== 6}
                  startIcon={isVerifyingMFA ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                  sx={{
                    background: (isVerifyingMFA || mfaCode.length !== 6) 
                      ? 'rgba(236, 0, 140, 0.3)' 
                      : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {isVerifyingMFA ? 'Verifying...' : 'Verify & Enable MFA'}
                </Button>
              </Box>
            )}
          </Box>

          {enableMFA && (
            <Box
              sx={{
                flex: 1,
                minWidth: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
                borderRadius: '16px',
                background: darkMode 
                  ? alpha('#2d2d3e', 0.3) 
                  : alpha('#f8f9fa', 0.8),
                border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
              }}
            >
              {loadingQR ? (
                <Box>
                  <CircularProgress sx={{ mb: 2, color: primaryColor }} />
                  <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666' }}>
                    Generating QR code...
                  </Typography>
                </Box>
              ) : qrCode ? (
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2,
                      color: darkMode ? '#e1e1e1' : '#333',
                      fontWeight: 'medium',
                    }}
                  >
                    📱 Scan with your Authenticator App
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: '#fff',
                      display: 'inline-block',
                    }}
                  >
                    <img src={qrCode} alt="MFA QR Code" width="200" />
                  </Box>
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? '#999' : '#666',
                    fontStyle: 'italic',
                  }}
                >
                  📱 QR code will appear here when you enable MFA
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// ✅ Final Export with ColorThemeProvider
export default function Settings() {
  return (
    <ColorThemeProvider>
      <SettingsContent />
    </ColorThemeProvider>
  );
}
