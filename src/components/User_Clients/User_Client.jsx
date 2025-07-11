import React, { useEffect, useRef, useState } from 'react';
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function User_Client() {
  const tableRef = useRef();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', credit: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/users`, { withCredentials: true });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length && tableRef.current) {
      const table = $(tableRef.current).DataTable();
      table.clear().rows.add(users).draw();
    }
  }, [users]);

  useEffect(() => {
    if (tableRef.current && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        columns: [
          { data: 'name' },
          { data: 'email' },
          { data: 'credit' },
          {
            data: null,
            orderable: false,
            render: () => `<button class="edit-btn">Edit</button>`,
          },
        ],
      });

      // Bind edit click event
      $(tableRef.current).on('click', '.edit-btn', function () {
        const rowData = $(tableRef.current).DataTable().row($(this).parents('tr')).data();
        setForm({ name: rowData.name, email: rowData.email, credit: rowData.credit });
        setOpen(true);
      });
    }
  }, []);

  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/users/${form.email}`, form, { withCredentials: true });
      fetchUsers();
      setOpen(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        👥 User Clients
      </Typography>

      <Box sx={{ overflowX: 'auto' }}>
        <table ref={tableRef}
        className="display stripe"
        style={{
          width: "100%",
          textAlign: "center",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Email</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Credit</th>
              <th style={{ border: "1px solid #ccc", padding: 10 }}>Action</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            value={form.name}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            value={form.email}
            disabled
          />
          <TextField
            margin="dense"
            label="Credit"
            name="credit"
            fullWidth
            type="number"
            value={form.credit}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
