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
import {
  Unstable_NumberInput as BaseNumberInput,
} from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const PINK = "#ec008c";
const GRADIENT = `linear-gradient(to right, ${PINK}, #d946ef)`;

const inputStyle = {
  transition: "all 0.3s ease",
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused fieldset": {
      borderColor: PINK,
      boxShadow: "0 0 0 0.15rem rgba(236, 0, 140, 0.25)",
    },
    "&:hover fieldset": { borderColor: PINK },
  },
};

export default function Settings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', emailLimit: '' });
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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

    const credit = parseInt(form.emailLimit, 10);
    if (isNaN(credit) || credit <= 0) {
      setError('Credit must be a positive number');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, form, {
        withCredentials: true,
      });
      setSuccess(res.data.message);
      setForm({ name: '', email: '', password: '', emailLimit: '' });
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
          <Typography variant="h6">Add New Client</Typography>

          <Typography variant="body2" fontWeight={500} sx={{ mt: 2, mb: 1 }}>
            Name
          </Typography>
          <TextField
            name="name"
            fullWidth
            placeholder="Enter name"
            value={form.name}
            onChange={handleChange}
            sx={{ ...inputStyle, mb: 2 }}
          />

          <Typography variant="body2" fontWeight={500} sx={{ mt: 2, mb: 1 }}>
            Email
          </Typography>
          <TextField
            name="email"
            type="email"
            fullWidth
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            sx={{ ...inputStyle, mb: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Credit
          </Typography>
          <BaseNumberInput
            aria-label="Credit"
            min={1}
            max={9999}
            value={form.emailLimit}
            onChange={(e, val) => setForm({ ...form, emailLimit: val })}
            slots={{
              root: StyledInputRoot,
              input: StyledInput,
              incrementButton: StyledButton,
              decrementButton: StyledButton,
            }}
            slotProps={{
              incrementButton: {
                children: <AddIcon fontSize="small" />,
                className: 'increment',
              },
              decrementButton: {
                children: <RemoveIcon fontSize="small" />,
              },
            }}
          />

          <Typography variant="body2" fontWeight={500} sx={{ mt: 2, mb: 1 }}>
            Password
          </Typography>
          <TextField
            name="password"
            type="password"
            fullWidth
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            sx={{ ...inputStyle, mb: 2 }}
          />

          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button
            variant="contained"
            onClick={handleAddUser}
            sx={{
              mt: 2,
              background: GRADIENT,
              color: 'white',
              '&:hover': { background: GRADIENT },
            }}
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

// ========== Custom Number Input Styling ==========

const StyledInputRoot = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px; /* Adds margin between - button, input, and + button */
  margin-top: 2px;
  margin-bottom:8px;
`;


const StyledInput = styled('input')`
  text-align: center;
  background: #fff;
  border: 1px solid #DAE2ED;
  border-radius: 8px;
  padding: 10px 12px;
  width: 5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${PINK};
  }

  &:focus {
    outline: none;
    border-color: ${PINK};
    box-shadow: 0 0 0 0.15rem rgba(236, 0, 140, 0.25);
  }
`;

const StyledButton = styled('button')`
  border: 1px solid #E5EAF2;
  background: #F3F6F9;
  color: #1C2025;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${PINK};
    border-color: ${PINK};
    color: white;
    cursor: pointer;
  }

  &.increment {
    order: 1;
  }
`;
