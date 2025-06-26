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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const { first_name, last_name, email, position } = formData;
    if (!first_name || !last_name || !email || !position || !isValidEmail(email)) {
      alert("Please fill in all fields with a valid email.");
      return;
    }
    setUsers((prev) => [...prev, formData]);
    setFormData({ first_name: "", last_name: "", email: "", position: "" });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split("\n").slice(1);
      const parsedUsers = lines
        .map((line) => {
          const [first_name, last_name, email, position] = line.split(",");
          if (first_name && email && isValidEmail(email)) {
            return { first_name, last_name, email, position };
          }
          return null;
        })
        .filter(Boolean);
      setUsers((prev) => [...prev, ...parsedUsers]);
    };
    reader.readAsText(file);
  };

  const handleDelete = (index) => {
    setUsers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/group_template.csv";
    link.download = "group_template.csv";
    link.click();
  };

  const handleSave = async () => {
    const isEditing = mode === "edit" && groupData?.id;
    const data = {
      id: isEditing ? groupData.id : Date.now(),
      name: groupName,
      targets: users,
      modified_date: new Date().toISOString(),
    };

    try {
      const url = isEditing
        ? `http://localhost:5000/api/groups/${groupData.id}`
        : `http://localhost:5000/api/groups`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      toast.success("Group saved successfully!");
      onSave(data);
      handleClose();
    } catch (err) {
      toast.error("Failed to save group. Please try again.");
      console.error(err);
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
            border: "2px solid #ec008c30",
            boxShadow: "0 8px 24px rgba(236, 0, 140, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: "#ec008c",
            borderBottom: "1px solid #f8c6dd",
            backgroundColor: "#fff0f7",
          }}
        >
          {mode === "edit" ? "✏️ Edit Group" : "👥 New Group"}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ maxHeight: "730px", overflowY: "auto", pr: 1 }}>
            <TextField
              fullWidth
              label="Group Name"
              variant="outlined"
              sx={{ mt: 2, mb: 3 }}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <Box display="flex" gap={2} mb={3}>
              <Button
                variant="contained"
                component="label"
                sx={{ backgroundColor: "red", color: "white" }}
              >
                BULK IMPORT USERS
                <input
                  hidden
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </Button>
              <Button variant="outlined" onClick={handleDownload}>
                DOWNLOAD CSV TEMPLATE
              </Button>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField
                name="first_name"
                label="First Name"
                fullWidth
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
              <TextField
                name="last_name"
                label="Last Name"
                fullWidth
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <TextField
                name="position"
                label="Position"
                fullWidth
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
              <Button
                variant="contained"
                color="error"
                onClick={handleAddUser}
                sx={{ width: 450 }}
              >
                + ADD
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#fde2f3" }}>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{user.first_name}</TableCell>
                        <TableCell>{user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.position}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleDelete(idx)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No users added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              color: "#374151",
              borderColor: "#d1d5db",
              fontWeight: "bold",
              borderRadius: 1,
              textTransform: "none",
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #ec4899, #d946ef)",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 1,
              textTransform: "none",
              boxShadow: 1,
              "&:hover": {
                background: "linear-gradient(to right, #db2777, #c026d3)",
              },
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
