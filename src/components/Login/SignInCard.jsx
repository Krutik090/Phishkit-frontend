import React, { useState } from 'react';
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

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function SignInCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true } // ✅ important to allow cookies
      );

      toast.success(`Welcome back!`, { autoClose: 2000 });

      setTimeout(() => {
        navigate('/campaigns'); // ✅ or wherever your dashboard is
      }, 1500);
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setDialogOpen(true);
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

        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
      </Box>

      {/* Error Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} transitionDuration={300}>
        <DialogTitle>Login Failed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Invalid email or password. Please try again or contact your administrator.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
