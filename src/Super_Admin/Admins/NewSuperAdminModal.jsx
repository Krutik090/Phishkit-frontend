// NewSuperAdminModal.js
import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, TextField, Button
} from "@mui/material";
import { styled } from "@mui/system";
import { toast } from "react-toastify";
import { Unstable_NumberInput as BaseNumberInput } from "@mui/base/Unstable_NumberInput";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const pink = localStorage.getItem("primaryColor") || "#e91e63";
const secondary = localStorage.getItem("secondaryColor") || "#f06292";

const pinkTextFieldSx = {
    "& label.Mui-focused": { color: pink },
    "& .MuiOutlinedInput-root": {
        "&.Mui-focused fieldset": {
            borderColor: pink,
            boxShadow: `0 0 0 0.15rem ${pink}`,
        },
    },
};

const StyledInputRoot = styled("div")`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledInput = styled("input")`
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.375;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0, 0.05);
  border-radius: 8px;
  margin: 0 8px;
  padding: 10px 12px;
  outline: 0;
  width: 4rem;
  text-align: center;

  &:hover {
    border-color: ${pink};
  }

  &:focus {
    border-color: ${pink};
    box-shadow: 0 0 0 3px ${pink};
  }

  &:focus-visible {
    outline: 0;
  }
`;

const StyledButton = styled("button")`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  border: 1px solid #ccc;
  border-radius: 999px;
  background: #f9f9f9;
  color: #333;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 120ms ease;

  &:hover {
    cursor: pointer;
    background: ${pink};
    border-color: ${pink};
    color: white;
  }

  &.increment {
    order: 1;
  }
`;

const NumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
    return (
        <BaseNumberInput
            slots={{
                root: StyledInputRoot,
                input: StyledInput,
                incrementButton: StyledButton,
                decrementButton: StyledButton,
            }}
            slotProps={{
                incrementButton: {
                    children: <AddIcon fontSize="small" />,
                    className: "increment",
                    type: "button",
                },
                decrementButton: {
                    children: <RemoveIcon fontSize="small" />,
                    type: "button",
                },
            }}
            {...props}
            ref={ref}
        />
    );
});

const NewSuperAdminModal = ({ open, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        emailLimit: 1,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData({
            name: "",
            email: "",
            password: "",
            emailLimit: 1,
        });
        setErrors({});
    }, [open]);

    const handleInputChange = (e, val) => {
        const { name, value, type } = e.target || {};
        const finalName = name || "emailLimit";
        const finalValue = val ?? (type === "number" ? parseInt(value || "0", 10) : value);

        setFormData(prev => ({
            ...prev,
            [finalName]: finalValue,
        }));

        if (errors[finalName]) {
            setErrors(prev => ({ ...prev, [finalName]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Company name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.emailLimit === "" || isNaN(formData.emailLimit)) {
            newErrors.emailLimit = "Email limit is required";
        } else if (formData.emailLimit < 1) {
            newErrors.emailLimit = "Email limit must be 1 or more";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                emailLimit: parseInt(formData.emailLimit),
                password: formData.password.trim(),
            };

            const url = `${API_BASE_URL}/superadmin/create-admin`;

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to create super admin");
            }

            toast.success("Super Admin created successfully!");
            setTimeout(() => {
                onSave();
            }, 500);
        } catch (error) {
            console.error("Modal error:", error);
            toast.error(error.message);
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
            disableEscapeKeyDown={loading}
            PaperProps={{
                sx: {
                    width: "600px",
                    height: "700px",
                    maxHeight: "90vh",
                    borderRadius: "16px",
                    border: `2px solid ${pink}`,
                    boxShadow: `0 8px 24px ${pink}`,
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: "bold", color: pink, backgroundColor: "#f5f5f5" }}>
                👥 Create New Super Admin
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="body2" fontWeight="500" mb={0.5}>Company Name</Typography>
                    <TextField
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={loading}
                        sx={pinkTextFieldSx}
                    />

                    <Typography variant="body2" fontWeight="500" mt={2} mb={0.5}>Email</Typography>
                    <TextField
                        fullWidth
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={loading}
                        sx={pinkTextFieldSx}
                    />

                    <Typography variant="body2" fontWeight="500" mt={2} mb={0.5}>Password</Typography>
                    <TextField
                        fullWidth
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        disabled={loading}
                        sx={pinkTextFieldSx}
                    />

                    <Typography variant="body2" fontWeight="500" mt={2} mb={0.5}>Email Limit (Credits)</Typography>
                    <Box mt={1}>
                        <NumberInput
                            min={1}
                            max={1000}
                            value={formData.emailLimit}
                            onChange={(e, val) => handleInputChange(e, val)}
                            aria-label="Email Limit"
                        />
                        {errors.emailLimit && (
                            <Typography variant="caption" color="error">
                                {errors.emailLimit}
                            </Typography>
                        )}
                    </Box>

                    <DialogActions sx={{ p: 0, pt: 4 }}>
                        <Button onClick={handleClose} disabled={loading} variant="outlined">Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="contained"
                            sx={{
                                background: `linear-gradient(to right, ${pink}, ${secondary})`,
                                color: "#fff",
                                fontWeight: "bold",
                                textTransform: "none",
                                "&:hover": {
                                    background: `linear-gradient(to right, ${pink}, ${secondary})`,
                                },
                            }}
                        >
                            {loading ? "Saving..." : "Save Admin"}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default NewSuperAdminModal;
