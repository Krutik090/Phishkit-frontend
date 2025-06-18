import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";

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
  onSave,
  formData,
  setFormData,
  isEditMode,
}) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {isEditMode ? "Edit Client" : "Add New Client"}
        </Typography>

        <TextField
          fullWidth
          name="name"
          label="Client Name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />

        <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#ec008c", color: "#fff" }}
            onClick={onSave}
          >
            {isEditMode ? "Update" : "Save"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewClientModal;
