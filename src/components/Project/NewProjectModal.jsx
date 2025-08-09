import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  alpha,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import { advancedToast, toastMessages } from "../../utils/toast"; // Import advanced toast
import { useTheme } from "../../context/ThemeContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const NewProjectModal = ({ open, onClose, refreshProjects }) => {
  const { darkMode } = useTheme();
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setProjectName("");
      setIsLoading(false);
    }
  }, [open]);

  const handleSaveProject = async () => {
    // Validation with advanced toast
    if (!projectName.trim()) {
      advancedToast.warning(
        "Please enter a project name to continue.", 
        "Project Name Required",
        { icon: "📝" }
      );
      return;
    }

    if (projectName.trim().length < 2) {
      advancedToast.warning(
        "Project name must be at least 2 characters long.", 
        "Invalid Project Name",
        { icon: "⚠️" }
      );
      return;
    }

    setIsLoading(true);

    try {
      // Show loading toast
      const loadingToastId = advancedToast.info(
        `Creating "${projectName.trim()}" project...`,
        "Please Wait",
        { 
          icon: "⏳",
          autoClose: false // Don't auto close loading toast
        }
      );

      // Create the project
      const createProjectPromise = fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create project");
        }
        return response.json();
      });

      // Execute the API call and handle the response
      const result = await createProjectPromise;
      
      // Dismiss loading toast
      advancedToast.dismissById(loadingToastId);
      
      // Show success toast
      advancedToast.success(
        `Project "${projectName.trim()}" created successfully!`,
        "Project Created",
        { 
          icon: "🎉",
          autoClose: 3000 
        }
      );

      // Close modal and refresh projects
      onClose();
      refreshProjects();

    } catch (err) {
      console.error("Project creation error:", err);
      
      // Handle specific error cases
      if (err.message.includes('already exists')) {
        advancedToast.error(
          "A project with this name already exists. Please choose a different name.",
          "Duplicate Project Name",
          { icon: "🚫" }
        );
      } else if (err.message.includes('permission')) {
        advancedToast.error(
          "You don't have permission to create projects.",
          "Access Denied",
          { icon: "🔒" }
        );
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        advancedToast.error(
          "Please check your internet connection and try again.",
          "Network Error",
          { icon: "🌐" }
        );
      } else {
        advancedToast.error(
          err.message || "An unexpected error occurred. Please try again.",
          "Creation Failed",
          { icon: "⚠️" }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) {
      advancedToast.info(
        "Please wait for the current operation to complete.",
        "Operation in Progress",
        { icon: "⏳" }
      );
      return;
    }
    onClose();
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: '90%', sm: 450 },
    // Enhanced glassmorphism style
    background: darkMode ? alpha("#1a1a2e", 0.9) : alpha("#ffffff", 0.9),
    backdropFilter: 'blur(16px)',
    border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
    borderRadius: '20px',
    boxShadow: darkMode ? 
      '0 8px 32px rgba(0, 0, 0, 0.5)' : 
      '0 8px 32px rgba(0, 0, 0, 0.1)',
    p: 4,
    color: darkMode ? 'grey.100' : 'grey.800',
  };

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      sx={{
        backdropFilter: 'blur(4px)',
        '& .MuiBackdrop-root': {
          backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
        }
      }}
    >
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ 
              color: darkMode ? 'grey.100' : 'grey.800',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            Add New Project
          </Typography>
          <IconButton 
            onClick={handleClose} 
            size="small"
            disabled={isLoading}
            sx={{
              color: darkMode ? 'grey.300' : 'grey.600',
              '&:hover': {
                backgroundColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.05),
              },
              '&:disabled': {
                color: darkMode ? 'grey.600' : 'grey.400',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          autoFocus
          name="name"
          label="Project Name"
          placeholder="Enter a descriptive project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isLoading}
          margin="normal"
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
              borderRadius: '12px',
              color: darkMode ? 'grey.100' : 'grey.800',
              '& fieldset': {
                borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#ec008c' : '#ec008c',
                borderWidth: '2px',
              },
              '&.Mui-disabled': {
                backgroundColor: darkMode ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                '& fieldset': {
                  borderColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                },
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? 'grey.300' : 'grey.600',
              '&.Mui-focused': {
                color: darkMode ? '#ec008c' : '#ec008c',
              },
              '&.Mui-disabled': {
                color: darkMode ? 'grey.600' : 'grey.400',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: darkMode ? 'grey.100' : 'grey.800',
              '&::placeholder': {
                color: darkMode ? 'grey.400' : 'grey.500',
                opacity: 1,
              },
              '&:disabled': {
                color: darkMode ? 'grey.500' : 'grey.400',
              },
            },
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSaveProject();
            }
          }}
          InputProps={{
            endAdornment: projectName.trim() && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: darkMode ? 'grey.400' : 'grey.500',
                marginRight: '8px'
              }}>
                {projectName.trim().length}/100
              </span>
            )
          }}
          inputProps={{
            maxLength: 100
          }}
        />

        {/* Helpful tip */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: darkMode ? 'grey.400' : 'grey.600',
            display: 'block',
            mb: 3,
            fontSize: '0.75rem',
            lineHeight: 1.4
          }}
        >
          💡 Choose a clear, descriptive name for your project. This will help you organize your campaigns better.
        </Typography>

        <Box mt={4} display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            onClick={handleSaveProject}
            disabled={isLoading || !projectName.trim()}
            startIcon={isLoading ? null : <AddCircleOutlineIcon />}
            sx={{
              background: isLoading || !projectName.trim() ? 
                (darkMode ? 'rgba(236, 0, 140, 0.3)' : 'rgba(236, 0, 140, 0.3)') :
                `linear-gradient(135deg, #ec008c, #fc6767)`,
              color: "#fff",
              fontWeight: "bold",
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: '48px',
              position: 'relative',
              boxShadow: (isLoading || !projectName.trim()) ? 'none' : 
                (darkMode ? 
                  '0 4px 16px rgba(236, 0, 140, 0.3)' : 
                  '0 4px 16px rgba(236, 0, 140, 0.2)'),
              '&:hover': {
                background: (isLoading || !projectName.trim()) ? 
                  (darkMode ? 'rgba(236, 0, 140, 0.3)' : 'rgba(236, 0, 140, 0.3)') :
                  `linear-gradient(135deg, #d6007a, #e55555)`,
                boxShadow: (isLoading || !projectName.trim()) ? 'none' :
                  (darkMode ? 
                    '0 6px 20px rgba(236, 0, 140, 0.4)' : 
                    '0 6px 20px rgba(236, 0, 140, 0.3)'),
              },
              '&:disabled': {
                color: '#fff',
                opacity: 0.7,
              },
            }}
          >
            {isLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Box 
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} 
                />
                Creating Project...
              </Box>
            ) : (
              'Create Project'
            )}
          </Button>
          <Button 
            onClick={handleClose}
            disabled={isLoading}
            sx={{
              color: darkMode ? 'grey.400' : 'grey.600',
              textTransform: 'none',
              py: 1,
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                color: darkMode ? 'grey.300' : 'grey.700',
              },
              '&:disabled': {
                color: darkMode ? 'grey.600' : 'grey.400',
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewProjectModal;