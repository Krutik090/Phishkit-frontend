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

const pink = localStorage.getItem("primaryColor") || "#e91e63"; // fallback to pink
const secondary = localStorage.getItem("secondaryColor") || "#f06292"; // fallback to lighter pink

const pinkTextFieldSx = {
    "& label.Mui-focused": { color: pink },
    "& .MuiOutlinedInput-root": {
        "&.Mui-focused fieldset": {
            borderColor: pink,
            boxShadow: `0 0 0 0.15rem ${pink}`,
        },
    },
};

const StyledInputRoot = styled('div')`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledInput = styled('input')`
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

const StyledButton = styled('button')`
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
          className: 'increment',
        },
        decrementButton: {
          children: <RemoveIcon fontSize="small" />,
        },
      }}
      {...props}
      ref={ref}
    />
  );
});

const NewSuperAdminModal = ({ open, onClose, onSave, superAdminData }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        emailLimit: 1,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const isEditing = Boolean(superAdminData);

    useEffect(() => {
        if (superAdminData) {
            setFormData({
                name: superAdminData.name || "",
                email: superAdminData.email || "",
                password: "",
                emailLimit: superAdminData.emailLimit || 1,
            });
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                emailLimit: 1,
            });
        }
        setErrors({});
    }, [superAdminData, open]);

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

        if (!isEditing && !formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password && formData.password.length < 6) {
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
            };
            if (formData.password.trim()) {
                submitData.password = formData.password;
            }

            const url = isEditing
                ? `${API_BASE_URL}/superadmin/admins/${superAdminData._id}`
                : `${API_BASE_URL}/superadmin/create-admin`;

            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} super admin`);
            }

            toast.success(`Super admin ${isEditing ? 'updated' : 'created'} successfully!`);
            onSave();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !loading && onClose()}
            fullWidth
            maxWidth="lg"
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
            <DialogTitle
                sx={{
                    fontWeight: "bold",
                    color: pink,
                    borderBottom: "1px solid #f5f5f5",
                    backgroundColor: "#f5f5f5",
                }}
            >
                👥 {isEditing ? "Edit Super Admin" : "Create New Super Admin"}
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="body2" fontWeight="500" mb={0.5}>
                        Company Name
                    </Typography>
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

                    <Typography variant="body2" fontWeight="500" mt={2} mb={0.5}>
                        Email
                    </Typography>
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

                    <Typography variant="body2" fontWeight="500" mt={2} mb={0.5}>
                        {isEditing ? "New Password (optional)" : "Password"}
                    </Typography>
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

                    <Typography variant="body2" fontWeight="500" mt={2} mb={0.5}>
                        Email Limit (Credits)
                    </Typography>
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
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={loading} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        background: `linear-gradient(to right, ${pink}, ${secondary})`,
                        color: "#fff",
                        fontWeight: "bold",
                        textTransform: "none",
                        boxShadow: 1,
                        "&:hover": {
                            background: `linear-gradient(to right, ${pink}, ${secondary})`,
                        },
                        "&:disabled": {
                            background: "#ccc",
                        },
                    }}
                >
                    {loading ? "Saving..." : isEditing ? "Update" : "Save Admin"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewSuperAdminModal;
