// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   TextField,
//   Alert,
//   CircularProgress,
//   Divider,
// } from '@mui/material';
// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL;
// const RED_GRADIENT = `linear-gradient(to right, #dc2626, #ef4444)`;
// const GRADIENT = `linear-gradient(to right, #6366f1, #3b82f6)`; // new gradient

// export default function Settings() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   const [enableMFA, setEnableMFA] = useState(false);
//   const [qrCode, setQrCode] = useState(null);
//   const [mfaCode, setMfaCode] = useState('');
//   const [mfaSuccess, setMfaSuccess] = useState('');
//   const [mfaError, setMfaError] = useState('');
//   const [loadingQR, setLoadingQR] = useState(false);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE_URL}/protected`, { withCredentials: true })
//       .then((res) => {
//         setUser(res.data.user);
//         // setEnableMFA(res.data.user?.mfaEnabled);
//       })
//       .catch(() => navigate('/login'));
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
//       navigate('/login');
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   const handleEnableMFA = async (checked) => {
//     setEnableMFA(checked);
//     setQrCode(null);
//     setMfaCode('');
//     setMfaSuccess('');
//     setMfaError('');

//     if (checked) {
//       setLoadingQR(true);
//       try {
//         const res = await axios.post(
//           `${API_BASE_URL}/auth/mfa/setup`,
//           {},
//           { withCredentials: true }
//         );
//         setQrCode(res.data.qr);
//       } catch (err) {
//         console.error('Error generating QR:', err);
//         setMfaError('Failed to generate QR code.');
//       } finally {
//         setLoadingQR(false);
//       }
//     }
//   };

//   const handleVerifyMFA = async (e) => {
//     e.preventDefault();
//     setMfaSuccess('');
//     setMfaError('');

//     try {
//       await axios.post(
//         `${API_BASE_URL}/auth/mfa/verify`,
//         { token: mfaCode.trim() },
//         { withCredentials: true }
//       );
//       setMfaSuccess('✅ MFA verified successfully!');
//     } catch (err) {
//       console.error('MFA verification failed:', err);
//       setMfaError('❌ Invalid MFA code. Please try again.');
//     }
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       {/* Header */}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Typography variant="h4">⚙️ Settings</Typography>
//         <Button
//           onClick={handleLogout}
//           variant="contained"
//           sx={{
//             background: RED_GRADIENT,
//             color: 'white',
//             fontWeight: 500,
//             '&:hover': {
//               background: RED_GRADIENT,
//               opacity: 0.9,
//             },
//           }}
//         >
//           Logout
//         </Button>
//       </Box>

//       <Divider sx={{ my: 4 }} />

//       {/* MFA Section */}
//       <Typography variant="h5" gutterBottom>🔐 Multi-Factor Authentication</Typography>
//       <Typography variant="body1" sx={{ mb: 2 }}>
//         Add an extra layer of security to your account by enabling MFA using an authenticator app.
//       </Typography>

//       <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
//         {/* Left Column */}
//         <Box sx={{ flex: 1, minWidth: 300 }}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={enableMFA}
//                 onChange={(e) => handleEnableMFA(e.target.checked)}
//               />
//             }
//             label="Enable Multi-Factor Authentication"
//           />

//           {enableMFA && (
//             <Box component="form" onSubmit={handleVerifyMFA} sx={{ mt: 2 }}>
//               <TextField
//                 fullWidth
//                 placeholder="Enter 6-digit code"
//                 value={mfaCode}
//                 onChange={(e) => setMfaCode(e.target.value)}
//                 inputProps={{ maxLength: 6 }}
//                 sx={{
//                   '& input::placeholder': {
//                     color: '#9ca3af', // Tailwind's gray-400
//                     opacity: 1,
//                   },
//                   '& .MuiOutlinedInput-root': {
//                     '& fieldset': {
//                       borderColor: '#9ca3af', // light gray border
//                     },
//                     '&:hover fieldset': {
//                       borderColor: '#ec4899', // pink hover
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor: '#ec4899',
//                       boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.3)',
//                     },
//                   },
//                 }}
//               />
//               <Button
//                 type="submit"
//                 variant="contained"
//                 sx={{
//                   mt: 2,
//                   background: GRADIENT,
//                   color: 'white',
//                   fontWeight: 500,
//                   '&:hover': {
//                     background: GRADIENT,
//                     opacity: 0.9,
//                   },
//                 }}
//               >
//                 Verify MFA
//               </Button>

//               {mfaSuccess && <Alert severity="success" sx={{ mt: 2 }}>{mfaSuccess}</Alert>}
//               {mfaError && <Alert severity="error" sx={{ mt: 2 }}>{mfaError}</Alert>}
//             </Box>
//           )}
//         </Box>

//         {/* Right Column: QR */}
//         {enableMFA && (
//           <Box
//             sx={{
//               flex: 1,
//               minWidth: 300,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             {loadingQR ? (
//               <CircularProgress />
//             ) : qrCode ? (
//               <Box sx={{ textAlign: 'center' }}>
//                 <Typography variant="body1" sx={{ mb: 1 }}>
//                   Scan with your Authenticator App
//                 </Typography>
//                 <img src={qrCode} alt="MFA QR Code" width="200" />
//               </Box>
//             ) : (
//               <Typography variant="body2" color="text.secondary">
//                 QR code will appear here
//               </Typography>
//             )}
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

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
} from '@mui/material';
import axios from 'axios';

// API & Style Constants
const API_BASE_URL = import.meta.env.VITE_API_URL;
const RED_GRADIENT = `linear-gradient(to right, #dc2626, #ef4444)`;

// ✅ Theme Context (local only)
export const ThemeContext = createContext();
export const useThemeColors = () => useContext(ThemeContext);

// ✅ Theme Provider wrapper

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#ec008c';
  });

  const [secondaryColor, setSecondaryColor] = useState(() => {
    return localStorage.getItem('secondaryColor') || '#ff6a9f';
  });

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('secondaryColor', secondaryColor);
  }, [secondaryColor]);

  return (
    <ThemeContext.Provider
      value={{ primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// export const ThemeProvider = ({ children }) => {
//   const [primaryColor, setPrimaryColor] = useState('#ec008c');
//   const [secondaryColor, setSecondaryColor] = useState('#ff6a9f');

//   useEffect(() => {
//     // axios
//     //   .get(`${API_BASE_URL}/auth/theme`, { withCredentials: true })
//     //   .then((res) => {
//     //     setPrimaryColor(res.data.primaryColor || '#ec008c');
//     //     setSecondaryColor(res.data.secondaryColor || '#ff6a9f');
//     //   })
//     //   .catch((err) => {
//     //     console.error('Failed to fetch theme', err);
//     //   });
//   }, []);

//   return (
//     <ThemeContext.Provider
//       value={{ primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor }}
//     >
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// ✅ Settings Component
const SettingsContent = () => {
  const navigate = useNavigate();
  const { primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor } =
    useThemeColors();

  const [user, setUser] = useState(null);
  const [enableMFA, setEnableMFA] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [loadingQR, setLoadingQR] = useState(false);
  const [status, setStatus] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const fieldSx = {
    '& input::placeholder': { color: '#9ca3af', opacity: 1 },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#9ca3af' },
      '&:hover fieldset': { borderColor: primaryColor },
      '&.Mui-focused fieldset': {
        borderColor: primaryColor,
        boxShadow: `0 0 0 2px ${primaryColor}44`,
      },
      mb: 2,
    },
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/protected`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => navigate('/login'));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleApplyTheme = async () => {
    window.location.reload(true);
    setStatus('applying');
    // try {
    //   await axios.put(
    //     `${API_BASE_URL}/auth/theme`,
    //     { primaryColor, secondaryColor },
    //     { withCredentials: true }
    //   );
    //   setStatus('success');
    //   window.location.reload();
    // } catch (err) {
    //   console.error('Theme update failed:', err);
    //   setStatus('error');
    // }
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
        const res = await axios.post(`${API_BASE_URL}/auth/mfa/setup`, {}, { withCredentials: true });
        setQrCode(res.data.qr);
      } catch (err) {
        console.error('QR generation error:', err);
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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/auth/update-password`,
        { currentPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );
      setPwdSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to update password.');
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
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
            color: 'white',
            fontWeight: 500,
            '&:hover': { background: RED_GRADIENT, opacity: 0.9 },
          }}
        >
          Logout
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Theme */}
      <Typography variant="h5" gutterBottom>🎨 Theme Colors</Typography>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography>Primary Color</Typography>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{ width: 60, height: 40, border: 'none', cursor: 'pointer' }}
          />
        </Box>
        <Box>
          <Typography>Secondary Color</Typography>
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            style={{ width: 60, height: 40, border: 'none', cursor: 'pointer' }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleApplyTheme}
          sx={{
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
            color: 'white',
            fontWeight: 500,
            mt: 2,
          }}
        >
          Apply
        </Button>
        {status === 'success' && <Alert severity="success">Theme updated! Refreshing...</Alert>}
        {status === 'error' && <Alert severity="error">Failed to update theme. Try again.</Alert>}
      </Box>
<Divider sx={{ my: 4 }} />
      {/* Password */}
      <Typography variant="h5" gutterBottom>🔒 Change Password</Typography>
      <Box component="form" onSubmit={handlePasswordUpdate} sx={{ mt: 2, maxWidth: 400 }}>
        <TextField
          type="password"
          placeholder="Current Password"
          fullWidth
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          sx={fieldSx}
        />
        <TextField
          type="password"
          placeholder="New Password"
          fullWidth
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={fieldSx}
        />
        <TextField
          type="password"
          placeholder="Confirm Password"
          fullWidth
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={fieldSx}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
            color: 'white',
            fontWeight: 500,
            '&:hover': { opacity: 0.9 },
          }}
        >
          Update Password
        </Button>
        {pwdSuccess && <Alert severity="success" sx={{ mt: 2 }}>{pwdSuccess}</Alert>}
        {pwdError && <Alert severity="error" sx={{ mt: 2 }}>{pwdError}</Alert>}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* MFA */}
      <Typography variant="h5" gutterBottom>🔐 Multi-Factor Authentication</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Add an extra layer of security using an authenticator app.
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
                sx={fieldSx}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 2,
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  color: 'white',
                  fontWeight: 500,
                }}
              >
                Verify MFA
              </Button>
              {mfaSuccess && <Alert severity="success" sx={{ mt: 2 }}>{mfaSuccess}</Alert>}
              {mfaError && <Alert severity="error" sx={{ mt: 2 }}>{mfaError}</Alert>}
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
};

// ✅ Final Export: self-contained with ThemeProvider
export default function Settings() {
  return (
    <ThemeProvider>
      <SettingsContent />
    </ThemeProvider>
  );
}
