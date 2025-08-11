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
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CloudSync as CloudSyncIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const NewGroupModal = ({ open, handleClose, mode, groupData, onSave }) => {
  const { darkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingAD, setIsFetchingAD] = useState(false);

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
    
    if (!email || !isValidEmail(email)) {
      advancedToast.warning(
        "Please provide a valid email address.",
        "Invalid Email",
        { icon: "✉️" }
      );
      return;
    }

    // Check for duplicate emails
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      advancedToast.warning(
        "This email address is already in the group.",
        "Duplicate Email",
        { icon: "⚠️" }
      );
      return;
    }

    setUsers((prev) => [...prev, formData]);
    setFormData({ first_name: "", last_name: "", email: "", position: "" });
    
    advancedToast.success(
      `User "${formData.first_name || formData.email}" added to group.`,
      "User Added",
      { icon: "👤" }
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingId = advancedToast.info(
      "Processing CSV file...",
      "Importing Users",
      { icon: "⏳", autoClose: false }
    );

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const lines = evt.target.result.split("\n").slice(1); // Skip header row
        const parsedUsers = lines
          .map((line) => {
            const [first_name, last_name, email, position] = line.split(",").map(field => field?.trim());
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
          .filter(Boolean);
        
        advancedToast.dismissById(loadingId);

        if (parsedUsers.length > 0) {
          // Filter out duplicates
          const existingEmails = users.map(u => u.email.toLowerCase());
          const newUsers = parsedUsers.filter(u => !existingEmails.includes(u.email.toLowerCase()));
          
          setUsers((prev) => [...prev, ...newUsers]);
          
          advancedToast.success(
            `${newUsers.length} users imported successfully from CSV.`,
            "Import Complete",
            { icon: "📄" }
          );
          
          if (newUsers.length < parsedUsers.length) {
            advancedToast.info(
              `${parsedUsers.length - newUsers.length} duplicate emails were skipped.`,
              "Duplicates Filtered",
              { icon: "🔍" }
            );
          }
        } else {
          advancedToast.warning(
            "No valid users found in the CSV file.",
            "Import Failed",
            { icon: "📄" }
          );
        }
      } catch (error) {
        advancedToast.dismissById(loadingId);
        advancedToast.error(
          "Error processing CSV file. Please check the format.",
          "Import Error",
          { icon: "❌" }
        );
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (index) => {
    const deletedUser = users[index];
    setUsers((prev) => prev.filter((_, i) => i !== index));
    
    advancedToast.success(
      `User "${deletedUser.first_name || deletedUser.email}" removed from group.`,
      "User Removed",
      { icon: "🗑️" }
    );
  };

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = "/group_template.csv";
      link.download = "group_template.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      advancedToast.success(
        "CSV template downloaded successfully!",
        "Download Complete",
        { icon: "💾" }
      );
    } catch (error) {
      advancedToast.error(
        "Failed to download CSV template.",
        "Download Failed",
        { icon: "❌" }
      );
    }
  };

  const handleFetchFromAD = async () => {
    setIsFetchingAD(true);
    
    try {
      const loadingId = advancedToast.info(
        "Fetching users from Active Directory...",
        "Connecting to AD",
        { icon: "🔍", autoClose: false }
      );

      const response = await fetch(`${API_BASE_URL}/ad-users`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      advancedToast.dismissById(loadingId);

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
          position: u.title || "N/A",
        }));

      // Filter out duplicates
      const existingEmails = users.map(u => u.email.toLowerCase());
      const newUsers = mappedUsers.filter(u => !existingEmails.includes(u.email.toLowerCase()));

      setUsers((prev) => [...prev, ...newUsers]);
      
      advancedToast.success(
        `${newUsers.length} users fetched from Active Directory successfully!`,
        "AD Import Complete",
        { icon: "🌐" }
      );

      if (newUsers.length < mappedUsers.length) {
        advancedToast.info(
          `${mappedUsers.length - newUsers.length} duplicate emails were skipped.`,
          "Duplicates Filtered",
          { icon: "🔍" }
        );
      }
    } catch (err) {
      advancedToast.error(
        err.message || "Failed to fetch users from Active Directory.",
        "AD Fetch Failed",
        { icon: "🌐" }
      );
      console.error(err);
    } finally {
      setIsFetchingAD(false);
    }
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      advancedToast.warning(
        "Please enter a group name to continue.",
        "Group Name Required",
        { icon: "👥" }
      );
      return;
    }
    
    if (users.length === 0) {
      advancedToast.warning(
        "Please add at least one user to the group.",
        "No Users Added",
        { icon: "👤" }
      );
      return;
    }

    setIsSaving(true);

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
      const loadingId = advancedToast.info(
        `${isEditing ? 'Updating' : 'Creating'} group "${groupName}"...`,
        "Saving Group",
        { icon: "⏳", autoClose: false }
      );

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      advancedToast.dismissById(loadingId);

      if (!response.ok) {
        const errorMessage = responseData?.error || "Something went wrong while saving group.";
        throw new Error(errorMessage);
      }

      advancedToast.success(
        `Group "${groupName}" ${isEditing ? 'updated' : 'created'} successfully!`,
        `Group ${isEditing ? 'Updated' : 'Created'}`,
        { icon: "✅" }
      );
      
      onSave(responseData);
      handleClose();
    } catch (err) {
      advancedToast.error(
        err.message || "Failed to save group. Please try again.",
        "Save Failed",
        { icon: "❌" }
      );
      console.error("Group Save Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const onDialogClose = () => {
    if (isSaving || isFetchingAD) {
      advancedToast.info(
        "Please wait for the current operation to complete.",
        "Operation in Progress",
        { icon: "⏳" }
      );
      return;
    }
    handleClose();
  };

  // ✅ FIXED: Enhanced textFieldStyle with proper input text colors
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
      borderRadius: '12px',
      color: darkMode ? '#e1e1e1' : '#333',
      '& fieldset': {
        borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
      },
      '&:hover fieldset': {
        borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ec008c',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666',
      '&.Mui-focused': {
        color: '#ec008c',
      },
    },
    // ✅ COMPREHENSIVE INPUT TEXT COLOR FIXES
    '& .MuiOutlinedInput-input': {
      color: `${darkMode ? '#e1e1e1' : '#333'} !important`, // ✅ Force color with !important
      '&::placeholder': {
        color: darkMode ? '#999' : '#666',
        opacity: 1,
      },
      // ✅ Fix browser autofill styling
      '&:-webkit-autofill': {
        WebkitBoxShadow: darkMode ? 
          `0 0 0 1000px ${alpha('#1e1e2f', 0.8)} inset` : 
          `0 0 0 1000px ${alpha('#ffffff', 0.9)} inset`,
        WebkitTextFillColor: `${darkMode ? '#e1e1e1' : '#333'} !important`,
        borderRadius: '12px',
        transition: 'background-color 5000s ease-in-out 0s',
      },
      '&:-webkit-autofill:hover, &:-webkit-autofill:focus': {
        WebkitBoxShadow: darkMode ? 
          `0 0 0 1000px ${alpha('#1e1e2f', 0.9)} inset` : 
          `0 0 0 1000px ${alpha('#ffffff', 1)} inset`,
        WebkitTextFillColor: `${darkMode ? '#e1e1e1' : '#333'} !important`,
      },
    },
    // ✅ Additional input selectors for comprehensive coverage
    '& input': {
      color: `${darkMode ? '#e1e1e1' : '#333'} !important`,
      '&:focus': {
        color: `${darkMode ? '#ffffff' : '#000'} !important`,
      },
      '&:not(:placeholder-shown)': {
        color: `${darkMode ? '#e1e1e1' : '#333'} !important`,
      },
    },
    // ✅ Fix any input type variations
    '& input[type="text"], & input[type="email"]': {
      color: `${darkMode ? '#e1e1e1' : '#333'} !important`,
    },
    // ✅ Override any conflicting styles
    '& .MuiInputBase-input': {
      color: `${darkMode ? '#e1e1e1' : '#333'} !important`,
    },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onDialogClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: "1200px",
            height: "900px",
            maxHeight: "90vh",
            borderRadius: "20px",
            background: darkMode ? alpha("#1a1a2e", 0.95) : alpha("#ffffff", 0.95),
            backdropFilter: 'blur(16px)',
            border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
            boxShadow: darkMode ? 
              '0 8px 32px rgba(0, 0, 0, 0.5)' : 
              '0 8px 32px rgba(0, 0, 0, 0.1)',
            // ✅ Advanced scrollbar styling
            '& .MuiDialogContent-root': {
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                borderRadius: '4px',
                margin: '2px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                borderRadius: '4px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                },
              },
              scrollbarWidth: 'thin',
              scrollbarColor: darkMode 
                ? 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: darkMode ? '#e1e1e1' : '#333',
            background: `linear-gradient(135deg, ${alpha('#ec008c', 0.1)}, ${alpha('#fc6767', 0.05)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <GroupIcon sx={{ color: '#ec008c' }} />
            {mode === "edit" ? "Edit Group" : "New Group"}
          </Box>
          
          <IconButton 
            onClick={onDialogClose} 
            size="small"
            disabled={isSaving || isFetchingAD}
            sx={{
              color: darkMode ? 'grey.400' : 'grey.600',
              '&:hover': {
                backgroundColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.05),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ 
            maxHeight: "100%", 
            // ✅ Custom scrollbar for content area
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
              borderRadius: '8px',
              margin: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
              },
            },
          }}>
            {/* Group Name Field */}
            <TextField
              fullWidth
              label="Group Name *"
              variant="outlined"
              sx={{ mt: 1, mb: 3, ...textFieldStyle }}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isSaving}
              placeholder="Enter a descriptive group name..."
            />

            {/* Action Buttons */}
            <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={isSaving || isFetchingAD}
                sx={{ 
                  background: 'linear-gradient(135deg, #ec008c, #fc6767)',
                  color: "white",
                  borderRadius: '12px',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d6007a, #e55555)',
                  },
                }}
              >
                Bulk Import (CSV)
                <input hidden type="file" accept=".csv" onChange={handleFileUpload} />
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={isSaving || isFetchingAD}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                  color: darkMode ? '#ccc' : '#666',
                  '&:hover': {
                    borderColor: '#ec008c',
                    backgroundColor: alpha('#ec008c', 0.1),
                    color: '#ec008c',
                  },
                }}
              >
                Download CSV Template
              </Button>
              
              <Button
                variant="outlined"
                startIcon={isFetchingAD ? <CircularProgress size={16} /> : <CloudSyncIcon />}
                onClick={handleFetchFromAD}
                disabled={isSaving || isFetchingAD}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                  color: darkMode ? '#ccc' : '#666',
                  '&:hover': {
                    borderColor: '#ec008c',
                    backgroundColor: alpha('#ec008c', 0.1),
                    color: '#ec008c',
                  },
                }}
              >
                {isFetchingAD ? 'Fetching...' : 'Fetch From AD'}
              </Button>
            </Box>

            {/* Add User Form */}
            <Box display="flex" gap={2} mb={3} alignItems="flex-end" flexWrap="wrap">
              <TextField 
                name="first_name" 
                label="First Name" 
                fullWidth 
                size="small"
                value={formData.first_name} 
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={isSaving}
                sx={textFieldStyle}
              />
              <TextField 
                name="last_name" 
                label="Last Name" 
                fullWidth 
                size="small"
                value={formData.last_name} 
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={isSaving}
                sx={textFieldStyle}
              />
              <TextField 
                name="email" 
                label="Email (Required)" 
                fullWidth 
                size="small"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSaving}
                required 
                sx={textFieldStyle}
              />
              <TextField 
                name="position" 
                label="Position" 
                fullWidth 
                size="small"
                value={formData.position} 
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                disabled={isSaving}
                sx={textFieldStyle}
              />
              <Button
                variant="contained"
                onClick={handleAddUser}
                startIcon={<AddIcon />}
                disabled={isSaving}
                sx={{ 
                  background: 'linear-gradient(135deg, #ec008c, #fc6767)',
                  color: 'white',
                  minWidth: '120px',
                  height: '40px',
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                Add
              </Button>
            </Box>

            {/* Users Table */}
            <Paper
              sx={{
                borderRadius: '12px',
                border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                overflow: 'hidden',
                backgroundColor: darkMode ? alpha('#1e1e2f', 0.8) : alpha('#ffffff', 0.8),
              }}
            >
              <TableContainer 
                sx={{ 
                  maxHeight: '400px',
                  // ✅ Custom scrollbar for table
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
                    borderRadius: '4px',
                    '&:hover': {
                      background: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
                    },
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        backgroundColor: darkMode ? '#0f0f1a' : '#ec008c',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}>
                        First Name
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: darkMode ? '#0f0f1a' : '#ec008c',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}>
                        Last Name
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: darkMode ? '#0f0f1a' : '#ec008c',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: darkMode ? '#0f0f1a' : '#ec008c',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}>
                        Position
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          backgroundColor: darkMode ? '#0f0f1a' : '#ec008c',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user, idx) => (
                        <TableRow 
                          key={idx} 
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                            },
                          }}
                        >
                          <TableCell sx={{ color: darkMode ? '#e1e1e1' : '#333' }}>
                            {user.first_name || '—'}
                          </TableCell>
                          <TableCell sx={{ color: darkMode ? '#e1e1e1' : '#333' }}>
                            {user.last_name || '—'}
                          </TableCell>
                          <TableCell sx={{ color: darkMode ? '#e1e1e1' : '#333' }}>
                            {user.email}
                          </TableCell>
                          <TableCell sx={{ color: darkMode ? '#e1e1e1' : '#333' }}>
                            {user.position || '—'}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              onClick={() => handleDelete(idx)} 
                              size="small"
                              disabled={isSaving}
                              sx={{
                                color: '#f44336',
                                '&:hover': {
                                  backgroundColor: alpha('#f44336', 0.1),
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell 
                          colSpan={5} 
                          align="center" 
                          sx={{ py: 4 }}
                        >
                          <Typography 
                            color="text.secondary"
                            sx={{ color: darkMode ? '#999' : '#666' }}
                          >
                            No users added yet. Add users using the form above or import from CSV/AD.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Stats */}
            {users.length > 0 && (
              <Box mt={2}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? '#ccc' : '#666',
                    fontStyle: 'italic'
                  }}
                >
                  💡 Total users in group: {users.length}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 3, gap: 2, borderTop: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}` }}>
          <Button 
            onClick={onDialogClose} 
            variant="outlined"
            disabled={isSaving || isFetchingAD}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: darkMode ? '#ccc' : '#666',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={isSaving ? null : <SaveIcon />}
            disabled={isSaving || isFetchingAD || !groupName || users.length === 0}
            sx={{
              background: (isSaving || !groupName || users.length === 0) ? 
                'rgba(236, 0, 140, 0.3)' : 
                'linear-gradient(135deg, #ec008c, #fc6767)',
              color: "#fff",
              borderRadius: '12px',
              textTransform: 'none',
              minWidth: '140px',
            }}
          >
            {isSaving ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} color="inherit" />
                Saving...
              </Box>
            ) : (
              "Save Group"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewGroupModal;
