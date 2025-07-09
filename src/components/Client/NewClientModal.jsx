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

const NewClientModal = ({
  open,
  onClose,
  formData,
  setFormData,
  refreshClients,
}) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveClient = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create client");

      toast.success("Client added successfully!");
      onClose();
      refreshClients();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add client");
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
            sx={{ backgroundColor: "#ec008c", color: "#fff" }}
            onClick={handleSaveClient}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewClientModal;
