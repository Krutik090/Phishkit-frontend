import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // ✅ Fetch authenticated user info via secure cookie
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/protected`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => navigate('/login'));
  }, []);

  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    setSuccess('');
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, form, {
        withCredentials: true,
      });
      setSuccess(res.data.message);
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        ⚙️ Settings
      </Typography>

      {isAdmin ? (
        <Box sx={{ maxWidth: 400, mt: 3 }}>
          <Typography variant="h6">Add New User</Typography>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
          />

          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddUser}
            sx={{ mt: 2 }}
          >
            Add User
          </Button>

          <Divider sx={{ my: 4 }} />

          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You don’t have access to manage users.
          </Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );
}
