import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RED_GRADIENT = `linear-gradient(to right, #dc2626, #ef4444)`;
const GRADIENT = `linear-gradient(to right, #6366f1, #3b82f6)`; // new gradient

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [enableMFA, setEnableMFA] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [loadingQR, setLoadingQR] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/protected`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        // setEnableMFA(res.data.user?.mfaEnabled);
      })
      .catch(() => navigate('/login'));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleEnableMFA = async (checked) => {
    setEnableMFA(checked);
    setQrCode(null);
    setMfaCode('');
    setMfaSuccess('');
    setMfaError('');

    if (checked) {
      setLoadingQR(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/mfa/setup`,
          {},
          { withCredentials: true }
        );
        setQrCode(res.data.qr);
      } catch (err) {
        console.error('Error generating QR:', err);
        setMfaError('Failed to generate QR code.');
      } finally {
        setLoadingQR(false);
      }
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setMfaSuccess('');
    setMfaError('');

    try {
      await axios.post(
        `${API_BASE_URL}/auth/mfa/verify`,
        { token: mfaCode.trim() },
        { withCredentials: true }
      );
      setMfaSuccess('✅ MFA verified successfully!');
    } catch (err) {
      console.error('MFA verification failed:', err);
      setMfaError('❌ Invalid MFA code. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">⚙️ Settings</Typography>
        <Button
          onClick={handleLogout}
          variant="contained"
          sx={{
            background: RED_GRADIENT,
            color: 'white',
            fontWeight: 500,
            '&:hover': {
              background: RED_GRADIENT,
              opacity: 0.9,
            },
          }}
        >
          Logout
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* MFA Section */}
      <Typography variant="h5" gutterBottom>🔐 Multi-Factor Authentication</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Add an extra layer of security to your account by enabling MFA using an authenticator app.
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Left Column */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={enableMFA}
                onChange={(e) => handleEnableMFA(e.target.checked)}
              />
            }
            label="Enable Multi-Factor Authentication"
          />

          {enableMFA && (
            <Box component="form" onSubmit={handleVerifyMFA} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                placeholder="Enter 6-digit code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
                sx={{
                  '& input::placeholder': {
                    color: '#9ca3af', // Tailwind's gray-400
                    opacity: 1,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#9ca3af', // light gray border
                    },
                    '&:hover fieldset': {
                      borderColor: '#ec4899', // pink hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ec4899',
                      boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.3)',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 2,
                  background: GRADIENT,
                  color: 'white',
                  fontWeight: 500,
                  '&:hover': {
                    background: GRADIENT,
                    opacity: 0.9,
                  },
                }}
              >
                Verify MFA
              </Button>

              {mfaSuccess && <Alert severity="success" sx={{ mt: 2 }}>{mfaSuccess}</Alert>}
              {mfaError && <Alert severity="error" sx={{ mt: 2 }}>{mfaError}</Alert>}
            </Box>
          )}
        </Box>

        {/* Right Column: QR */}
        {enableMFA && (
          <Box
            sx={{
              flex: 1,
              minWidth: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loadingQR ? (
              <CircularProgress />
            ) : qrCode ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Scan with your Authenticator App
                </Typography>
                <img src={qrCode} alt="MFA QR Code" width="200" />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                QR code will appear here
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
