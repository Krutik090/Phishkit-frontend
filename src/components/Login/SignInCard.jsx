import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { encryptWithPublicKey } from '../../utils/helper'; // ✅ Import your helper

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function SignInCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loginErrorDialogOpen, setLoginErrorDialogOpen] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [publicKey, setPublicKey] = useState('');

  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/captcha`, { credentials: 'include' });
      const svg = await res.text();
      setCaptchaSvg(svg);
    } catch (err) {
      console.error("Failed to load captcha:", err);
    }
  };

  const fetchPublicKey = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/public-key`);
      const key = await res.text();
      setPublicKey(key);
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
    if (!validate()) return;

    try {
      const encryptedEmail = await encryptWithPublicKey(publicKey, email);
      const encryptedPassword = await encryptWithPublicKey(publicKey, password);

      const response = await axios.post(
        `${API_BASE_URL}/auth/prelogin`,
        {  encryptedEmail, encryptedPassword, captcha: captchaInput },
        { withCredentials: true }
      );

      toast.success("Welcome back!", { autoClose: 2000 });
      setTimeout(() => {
        navigate('/campaigns');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "MFA token required") {
        const encryptedEmail = await encryptWithPublicKey(publicKey, email);
        const encryptedPassword = await encryptWithPublicKey(publicKey, password);
        setUserInfo({ email: encryptedEmail, password: encryptedPassword });
        setMfaDialogOpen(true);
      } else {
        console.error("Login failed:", error.response?.data || error.message);
        setLoginErrorDialogOpen(true);
        fetchCaptcha(); // refresh captcha on failure
      }
    }
  };

  const handleMfaSubmit = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        encryptedEmail: userInfo.email,
        encryptedPassword: userInfo.password,
        token: mfaToken
      },
      { withCredentials: true }
    );

    toast.success("Welcome back!", { autoClose: 2000 });
    setTimeout(() => {
      navigate('/campaigns');
    }, 1500);
  } catch (err) {
    console.error("MFA Error:", err.response?.data?.message || err.message);
    setMfaError("Invalid MFA token. Please try again.");
    setMfaToken("");
  }
};


  return (
    <Card variant="outlined" sx={{ p: 4, maxWidth: 450, width: '100%' }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <FormControl>
          <FormLabel>Email</FormLabel>
          <TextField
            fullWidth
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            placeholder="john@example.com"
            required
          />
        </FormControl>

        <FormControl>
          <FormLabel>Password</FormLabel>
          <TextField
            fullWidth
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            required
          />
        </FormControl>

        <Box sx={{ textAlign: 'right' }}>
          <Button onClick={() => setDialogOpen(true)} variant="text" size="small">
            Forgot password?
          </Button>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
          <Button onClick={fetchCaptcha}>↻ Refresh</Button>
        </Box>

        <TextField
          fullWidth
          label="Enter Captcha"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          required
        />

        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
      </Box>

      {/* MFA Dialog */}
      <Dialog open={mfaDialogOpen} onClose={() => setMfaDialogOpen(false)}>
        <DialogTitle>MFA Verification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the 6-digit MFA code from your authenticator app.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="MFA Token"
            fullWidth
            variant="standard"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
          {mfaError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {mfaError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMfaDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMfaSubmit}>Verify</Button>
        </DialogActions>
      </Dialog>

      {/* Login Error Dialog */}
      <Dialog open={loginErrorDialogOpen} onClose={() => setLoginErrorDialogOpen(false)}>
        <DialogTitle>Login Failed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Invalid credentials. Please try again or contact your administrator.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
