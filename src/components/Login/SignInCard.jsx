import React, { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, TextField, Typography, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, alpha, IconButton, Paper, Tooltip
} from '@mui/material';
import {
    Login as LoginIcon,
    Visibility,
    VisibilityOff,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { advancedToast } from '../../utils/toast';
import { encryptWithPublicKey } from '../../utils/helper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const SignInCard = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  // ✅ Added state for inactive user dialog
  const [inactiveDialogOpen, setInactiveDialogOpen] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/captcha`, { credentials: 'include' });
      setCaptchaSvg(await res.text());
    } catch (err) {
      console.error("Failed to load captcha:", err);
    }
  };

  const fetchPublicKey = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/public-key`);
      setPublicKey(await res.text());
    } catch (err) {
      console.error("Failed to load public key:", err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
    fetchPublicKey();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password || !captchaInput) {
        return advancedToast.warning("Please fill in all fields.", "Missing Information");
    }

    try {
      const encryptedEmail = await encryptWithPublicKey(publicKey, email);
      const encryptedPassword = await encryptWithPublicKey(publicKey, password);

      await axios.post(`${API_BASE_URL}/auth/prelogin`, {
        encryptedEmail,
        encryptedPassword,
        captcha: captchaInput,
      }, { withCredentials: true });

      const res = await axios.get(`${API_BASE_URL}/protected`, { withCredentials: true });
      setUser(res.data.user);
      advancedToast.success(`Welcome back, ${res.data.user.name}!`, "Login Successful", { icon: "👋" });
      navigate(res.data.user.role === 'superadmin' ? '/super-admin' : '/dashboard');

    } catch (error) {
      const message = error.response?.data?.message;
      const statusCode = error.response?.status;
      
      fetchCaptcha(); // Refresh captcha on any error
      
      // ✅ Handle different error scenarios
      if (statusCode === 403) {
        // Account is inactive
        setInactiveDialogOpen(true);
        advancedToast.error("Your account is inactive. Please contact your administrator.", "Account Inactive", { 
          icon: "🚫",
          duration: 6000 
        });
      } else if (message === "MFA token required") {
        setUserInfo({ email, password });
        setMfaDialogOpen(true);
      } else {
        advancedToast.error(message || "Invalid credentials. Please try again.", "Login Failed");
      }
    }
  };

  const handleMfaSubmit = async () => {
    try {
      const encryptedEmail = await encryptWithPublicKey(publicKey, userInfo.email);
      const encryptedPassword = await encryptWithPublicKey(publicKey, userInfo.password);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        encryptedEmail,
        encryptedPassword,
        token: mfaToken,
      }, { withCredentials: true });
      
      setUser(res.data.user);
      advancedToast.success(`Welcome back, ${res.data.user.name}!`, "Login Successful", { icon: "👋" });
      navigate(res.data.user.role === 'superadmin' ? '/super-admin' : '/dashboard');
      setMfaDialogOpen(false);
    } catch (err) {
      const statusCode = err.response?.status;
      const message = err.response?.data?.message;
      
      // ✅ Handle inactive account in MFA flow
      if (statusCode === 403) {
        setMfaDialogOpen(false);
        setInactiveDialogOpen(true);
        advancedToast.error("Your account is inactive. Please contact your administrator.", "Account Inactive", { 
          icon: "🚫",
          duration: 6000 
        });
      } else {
        advancedToast.error(message || "Invalid MFA token.", "MFA Failed");
      }
      setMfaToken("");
    }
  };

  // ✅ Handle closing inactive dialog and clearing form
  const handleInactiveDialogClose = () => {
    setInactiveDialogOpen(false);
    // Clear form fields for security
    setEmail('');
    setPassword('');
    setCaptchaInput('');
    setMfaToken('');
    setUserInfo(null);
    fetchCaptcha(); // Get new captcha
  };
  
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
      borderRadius: '12px',
      '& fieldset': { borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2) },
      '&:hover fieldset': { borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3) },
      '&.Mui-focused fieldset': { borderColor: '#ec008c', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root': { color: darkMode ? 'grey.300' : 'grey.600', '&.Mui-focused': { color: '#ec008c' } },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: '20px',
        background: darkMode ? alpha("#1a1a2e", 0.8) : alpha("#ffffff", 0.8),
        backdropFilter: 'blur(16px)',
        border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
        boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
        Sign in
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Welcome back! Please enter your details.
      </Typography>

      <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField fullWidth name="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={textFieldSx} />
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={textFieldSx}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setForgotDialogOpen(true)} variant="text" size="small" sx={{ textTransform: 'none' }}>
            Forgot password?
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: '12px', background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02) }}>
          <Box dangerouslySetInnerHTML={{ __html: captchaSvg }} sx={{ '& svg': { display: 'block', borderRadius: '8px' } }} />
          <Tooltip title="Refresh Captcha">
            <IconButton onClick={fetchCaptcha}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>

        <TextField fullWidth label="Enter Captcha" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} sx={textFieldSx} />

        <Button type="submit" variant="contained" fullWidth startIcon={<LoginIcon />} sx={{ py: 1.5, borderRadius: '12px', fontWeight: 'bold' }}>
          Login
        </Button>
      </Box>

      {/* Dialogs */}
      <Dialog open={mfaDialogOpen} onClose={() => setMfaDialogOpen(false)} PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle fontWeight="bold">MFA Verification</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the 6-digit code from your authenticator app.</DialogContentText>
          <TextField autoFocus margin="dense" label="MFA Token" fullWidth variant="outlined" value={mfaToken} onChange={(e) => setMfaToken(e.target.value)} inputProps={{ maxLength: 6 }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMfaDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMfaSubmit} variant="contained">Verify</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={forgotDialogOpen} onClose={() => setForgotDialogOpen(false)} PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle fontWeight="bold">Forgot Password?</DialogTitle>
        <DialogContent>
          <DialogContentText>Please contact your administrator to reset your password.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setForgotDialogOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Added Inactive User Dialog */}
      <Dialog 
        open={inactiveDialogOpen} 
        onClose={handleInactiveDialogClose} 
        PaperProps={{ 
          sx: { 
            borderRadius: '20px',
            border: '2px solid #f44336',
            boxShadow: '0 8px 32px rgba(244, 67, 54, 0.2)'
          } 
        }}
      >
        <DialogTitle 
          fontWeight="bold" 
          sx={{ 
            color: '#f44336', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}
        >
          🚫 Account Inactive
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '1.1rem', mb: 2 }}>
            Your account is currently inactive and cannot be used to access the system.
          </DialogContentText>
          <DialogContentText sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Please contact your administrator to reactivate your account.
          </DialogContentText>
          <DialogContentText variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            If you believe this is an error, please reach out to your system administrator with your email address: <strong>{email}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleInactiveDialogClose} 
            variant="contained" 
            color="primary"
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
