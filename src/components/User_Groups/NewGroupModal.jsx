import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const primaryColor = localStorage.getItem("primaryColor") || '#EC008C';
const secondaryColor = localStorage.getItem("secondaryColor") || '#FC6767';

const NewGroupModal = ({ open, handleClose, mode, groupData, onSave }) => {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: "",
  });

  useEffect(() => {
    if (groupData && mode === "edit") {
      setGroupName(groupData.name || "");
      setUsers(groupData.targets || []);
    } else {
      setGroupName("");
      setUsers([]);
    }
  }, [groupData, mode, open]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddUser = () => {
    const { email } = formData;
    // Updated validation: Only the email field is mandatory.
    if (!email || !isValidEmail(email)) {
      toast.warn("Please provide a valid email address.");
      return;
    }
    setUsers((prev) => [...prev, formData]);
    // Reset form for the next entry
    setFormData({ first_name: "", last_name: "", email: "", position: "" });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split("\n").slice(1); // Skip header row
      const parsedUsers = lines
        .map((line) => {
          const [first_name, last_name, email, position] = line.split(",").map(field => field.trim());
          if (email && isValidEmail(email)) {
            return { 
              first_name: first_name || "", 
              last_name: last_name || "", 
              email, 
              position: position || "" 
            };
          }
          return null;
        })
        .filter(Boolean); // Filter out any null entries
      
      if (parsedUsers.length > 0) {
        setUsers((prev) => [...prev, ...parsedUsers]);
        toast.success(`${parsedUsers.length} users imported successfully from CSV.`);
      } else {
        toast.warn("No valid users found in the CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (index) => {
    setUsers((prev) => prev.filter((_, i) => i !== index));
    toast.info("User removed from the list.");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/group_template.csv";
    link.download = "group_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFetchFromAD = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ad-users`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const adUsers = data.users || [];

      const mappedUsers = adUsers
        .filter((u) => u.firstName && u.email && isValidEmail(u.email))
        .map((u) => ({
          first_name: u.firstName,
          last_name: u.lastName || '',
          email: u.email,
          position: u.title || "N/A", // Use title from AD if available
        }));

      setUsers((prev) => [...prev, ...mappedUsers]);
      toast.success("Fetched users from Active Directory successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to fetch users from Active Directory");
      console.error(err);
    }
  };

const handleSave = async () => {
  if (!groupName.trim()) {
    toast.warn("Group Name is required.");
    return;
  }
  if (users.length === 0) {
    toast.warn("Please add at least one user to the group.");
    return;
  }

  const isEditing = mode === "edit" && groupData?.id;

  const payload = {
    name: groupName,
    targets: users,
  };

  const url = isEditing
    ? `${API_BASE_URL}/groups/${groupData.id}`
    : `${API_BASE_URL}/groups`;

  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // 🔥 Use server's error message if available
      const errorMessage = responseData?.error || "Something went wrong while saving group.";
      throw new Error(errorMessage);
    }

    toast.success(`Group "${groupName}" saved successfully!`);
    onSave(responseData);
    handleClose();
  } catch (err) {
    toast.warning(err.message);
    console.error("Group Save Error:", err);
  }
};


  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: "1200px",
            height: "900px",
            maxHeight: "90vh",
            borderRadius: "16px",
            border: `2px solid ${primaryColor}`,
            boxShadow: `0 8px 24px ${primaryColor}33`,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: primaryColor,
            borderBottom: `1px solid #f0f0f0`,
            backgroundColor: "#f9fafb",
          }}
        >
          {mode === "edit" ? "✏️ Edit Group" : "👥 New Group"}
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ maxHeight: "100%", overflowY: "auto", p: 1 }}>
            <TextField
              fullWidth
              label="Group Name"
              variant="outlined"
              sx={{ mt: 2, mb: 3 }}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
              <Button
                variant="contained"
                component="label"
                sx={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, color: "white" }}
              >
                Bulk Import (CSV)
                <input hidden type="file" accept=".csv" onChange={handleFileUpload} />
              </Button>
              <Button variant="outlined" onClick={handleDownload}>
                Download CSV Template
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleFetchFromAD}
              >
                Fetch From AD
              </Button>
            </Box>

            <Box display="flex" gap={2} mb={2} alignItems="center">
              <TextField name="first_name" label="First Name" fullWidth value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              <TextField name="last_name" label="Last Name" fullWidth value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              <TextField name="email" label="Email (Required)" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <TextField name="position" label="Position" fullWidth value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
              <Button
                variant="contained"
                onClick={handleAddUser}
                sx={{ 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, 
                  color: 'white',
                  minWidth: '120px',
                  height: '56px'
                }}
              >
                + ADD
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{maxHeight: '400px'}}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ "& .MuiTableCell-root": { backgroundColor: primaryColor, color: 'white', fontWeight: 'bold' } }}>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{user.first_name || '—'}</TableCell>
                        <TableCell>{user.last_name || '—'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.position || '—'}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleDelete(idx)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{py: 4}}>
                        <Typography color="textSecondary">No users added yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
          <Button onClick={handleClose} variant="outlined">
            CANCEL
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              color: "#fff",
            }}
            disabled={!groupName || users.length === 0}
          >
            SAVE GROUP
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewGroupModal;
