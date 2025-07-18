import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const NewProjectModal = ({
  open,
  onClose,
  formData,
  setFormData,
  refreshProjects,
}) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create Project");

      toast.success("Project added successfully!");
      onClose();
      refreshProjects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add Project");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Add New Project
        </Typography>

        <TextField
          fullWidth
          name="name"
          label="Project Name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: localStorage.getItem("primaryColor"), color: "#fff" }}
            onClick={handleSaveClient}

          > Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewProjectModal;
