import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Box,
  Typography,
  FormControl,
  InputLabel,
  CircularProgress,
  alpha,
  IconButton,
} from "@mui/material";
import {
  Cancel as CancelIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const mockData = {
  templates: [{ id: 1, name: "Mock Template" }],
  landingPages: [{ id: 1, name: "Mock Landing" }],
  sendingProfiles: [{ id: 1, name: "Mock SMTP" }],
  groups: [{ id: 1, name: "Mock Group" }],
  quizzes: [{ id: 1, name: "Mock Quiz", publicUrl: "sample-url" }],
  projects: [{ _id: "1", name: "Mock Project" }],
};

const NewCampaignModal = ({ open, onClose, onSave, formData, setFormData }) => {
  const { darkMode } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [sendingProfiles, setSendingProfiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [existingCampaigns, setExistingCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when modal closes
  useEffect(() => {
    if (!open) {
      setHasSaved(false);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      setHasSaved(false);

      try {
        const loadingId = advancedToast.info(
          "Loading campaign data...",
          "Please Wait",
          { icon: "⏳", autoClose: false }
        );

        const fetchWithFallback = async (url, fallbackData) => {
          try {
            const res = await fetch(url, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (res.ok) {
              const data = await res.json();
              return Array.isArray(data) && data.length ? data : fallbackData;
            }
            return fallbackData;
          } catch {
            return fallbackData;
          }
        };

        const [
          templatesData,
          landingPagesData,
          sendingProfilesData,
          groupsData,
          quizzesData,
          projectData,
          campaignsData,
        ] = await Promise.all([
          fetchWithFallback(`${API_BASE_URL}/templates`, mockData.templates),
          fetchWithFallback(`${API_BASE_URL}/landing-pages`, mockData.landingPages),
          fetchWithFallback(`${API_BASE_URL}/sending-profiles`, mockData.sendingProfiles),
          fetchWithFallback(`${API_BASE_URL}/groups`, mockData.groups),
          fetchWithFallback(`${API_BASE_URL}/quizzes`, mockData.quizzes),
          fetchWithFallback(`${API_BASE_URL}/projects`, mockData.projects),
          fetchWithFallback(`${API_BASE_URL}/campaigns`, []),
        ]);

        advancedToast.dismissById(loadingId);

        setTemplates(templatesData);
        setLandingPages(landingPagesData);
        setSendingProfiles(sendingProfilesData);
        setGroups(groupsData);
        setQuizzes(quizzesData);
        setProjects(projectData);
        setExistingCampaigns(campaignsData);

        advancedToast.success(
          "Campaign data loaded successfully!",
          "Ready to Create",
          { icon: "✅", autoClose: 2000 }
        );
      } catch (err) {
        advancedToast.error(
          "Error loading campaign data. Please try again.",
          "Load Failed",
          { icon: "❌" }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quiz") {
      const selectedQuiz = quizzes.find((q) => (q._id || q.id) === value);
      setFormData((prev) => ({ ...prev, quiz: selectedQuiz || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (hasSaved || isSubmitting) return;

    // Validation with advanced toast
    if (!formData?.name?.trim()) {
      advancedToast.warning(
        "Please enter a campaign name to continue.",
        "Campaign Name Required",
        { icon: "📝" }
      );
      return;
    }

    if (!formData?.schedule) {
      advancedToast.warning(
        "Please select a launch date and time.",
        "Schedule Required",
        { icon: "📅" }
      );
      return;
    }

    const nameExists = existingCampaigns.some(
      (c) => c.name.trim().toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (nameExists) {
      advancedToast.error(
        "A campaign with this name already exists. Please choose a different name.",
        "Duplicate Campaign Name",
        { icon: "🚫" }
      );
      return;
    }

    setHasSaved(true);
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      template: { name: formData.template },
      landingPage: { name: formData.landingPage },
      smtp: { name: formData.sendingProfile },
      url: formData.url,
      launchDate: dayjs(formData.schedule).toISOString(),
      groups: Array.isArray(formData.group)
        ? formData.group.map((groupName) => ({ name: groupName }))
        : [],
      projectId: formData.project,
      publicUrl: formData.quiz?.publicUrl || null,
    };

    try {
      const loadingId = advancedToast.info(
        `Creating campaign "${formData.name}"...`,
        "Saving Campaign",
        { icon: "⏳", autoClose: false }
      );

      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      advancedToast.dismissById(loadingId);

      if (res.ok) {
        advancedToast.success(
          `Campaign "${formData.name}" created successfully!`,
          "Campaign Created",
          { icon: "🎯" }
        );
        onSave();
        onClose();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save campaign");
      }
    } catch (err) {
      console.error("Save error:", err);
      advancedToast.error(
        err.message || "An error occurred while saving the campaign.",
        "Save Failed",
        { icon: "❌" }
      );
      setHasSaved(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      advancedToast.info(
        "Please wait for the campaign to be saved.",
        "Operation in Progress",
        { icon: "⏳" }
      );
      return;
    }
    onClose();
  };

  const defaultSchedule = dayjs().add(2, "minute");

  const safeFormData = {
    name: "",
    project: "",
    template: "",
    landingPage: "",
    url: "",
    schedule: formData?.schedule ? dayjs(formData.schedule) : defaultSchedule,
    sendingProfile: "",
    group: [],
    quiz: null,
    ...formData,
  };

  const selectFieldStyle = {
    backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.02),
    borderRadius: '12px',
    color: darkMode ? '#e1e1e1' : '#333',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ec008c',
      borderWidth: '2px',
    },
    // ✅ Fix dropdown arrow color
    '& .MuiSelect-icon': {
      color: darkMode ? '#ccc' : '#666',
    },
  };

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
    // ✅ Fix input text color
    '& .MuiOutlinedInput-input': {
      color: darkMode ? '#e1e1e1' : '#333',
      '&::placeholder': {
        color: darkMode ? '#999' : '#666',
        opacity: 1,
      },
    },
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: "1200px",
          height: "740px",
          maxHeight: "90vh",
          borderRadius: "20px",
          background: darkMode ? alpha("#1a1a2e", 0.95) : alpha("#ffffff", 0.95),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
          boxShadow: darkMode ? 
            '0 8px 32px rgba(0, 0, 0, 0.5)' : 
            '0 8px 32px rgba(0, 0, 0, 0.1)',
          // ✅ Fix scrollbar styling for dark mode
          '& .MuiDialogContent-root': {
            '&::-webkit-scrollbar': {
              width: '8px',
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
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          fontWeight: "bold", 
          color: darkMode ? '#e1e1e1' : '#333',
          borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          background: `linear-gradient(135deg, ${alpha('#ec008c', 0.1)}, ${alpha('#fc6767', 0.05)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <CampaignIcon sx={{ color: '#ec008c' }} />
          Add New Campaign
        </Box>
        <IconButton 
          onClick={handleClose} 
          size="small"
          disabled={isSubmitting}
          sx={{
            color: darkMode ? 'grey.400' : 'grey.600',
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
      </DialogTitle>

      <DialogContent sx={{ mt: 2, px: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Box textAlign="center">
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Loading campaign data...
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Campaign Name & Project */}
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  Campaign Name *
                </Typography>
                <TextField
                  name="name"
                  value={safeFormData.name}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Enter a descriptive campaign name..."
                  disabled={isSubmitting}
                  sx={textFieldStyle}
                />
              </Box>
              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  Project
                </Typography>
                <FormControl fullWidth>
                  <Select
                    name="project"
                    value={safeFormData.project}
                    onChange={handleChange}
                    disabled={loading || isSubmitting}
                    displayEmpty
                    sx={selectFieldStyle}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                          color: darkMode ? '#e1e1e1' : '#333',
                          borderRadius: '12px',
                          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                          '& .MuiMenuItem-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                            },
                            '&.Mui-selected': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Project</em>
                    </MenuItem>
                    {projects.map((c) => (
                      <MenuItem key={c._id || c.id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Template and Landing Page */}
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  Template
                </Typography>
                <FormControl fullWidth>
                  <Select
                    name="template"
                    value={safeFormData.template}
                    onChange={handleChange}
                    disabled={loading || isSubmitting}
                    displayEmpty
                    sx={selectFieldStyle}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                          color: darkMode ? '#e1e1e1' : '#333',
                          borderRadius: '12px',
                          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                          '& .MuiMenuItem-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                            },
                            '&.Mui-selected': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Template</em>
                    </MenuItem>
                    {templates.map((t) => (
                      <MenuItem key={t._id || t.id} value={t.name}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  Landing Page
                </Typography>
                <FormControl fullWidth>
                  <Select
                    name="landingPage"
                    value={safeFormData.landingPage}
                    onChange={handleChange}
                    disabled={loading || isSubmitting}
                    displayEmpty
                    sx={selectFieldStyle}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                          color: darkMode ? '#e1e1e1' : '#333',
                          borderRadius: '12px',
                          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                          '& .MuiMenuItem-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                            },
                            '&.Mui-selected': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Landing Page</em>
                    </MenuItem>
                    {landingPages.map((lp) => (
                      <MenuItem key={lp._id || lp.id} value={lp.name}>
                        {lp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* SMTP and Quiz */}
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  Sending Profile
                </Typography>
                <FormControl fullWidth>
                  <Select
                    name="sendingProfile"
                    value={safeFormData.sendingProfile}
                    onChange={handleChange}
                    disabled={loading || isSubmitting}
                    displayEmpty
                    sx={selectFieldStyle}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                          color: darkMode ? '#e1e1e1' : '#333',
                          borderRadius: '12px',
                          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                          '& .MuiMenuItem-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                            },
                            '&.Mui-selected': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select SMTP</em>
                    </MenuItem>
                    {sendingProfiles.map((sp) => (
                      <MenuItem key={sp._id || sp.id} value={sp.name}>
                        {sp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  Quiz
                </Typography>
                <FormControl fullWidth>
                  <Select
                    name="quiz"
                    value={safeFormData.quiz?._id || ""}
                    onChange={handleChange}
                    disabled={loading || isSubmitting}
                    displayEmpty
                    sx={selectFieldStyle}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                          color: darkMode ? '#e1e1e1' : '#333',
                          borderRadius: '12px',
                          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                          '& .MuiMenuItem-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                            },
                            '&.Mui-selected': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Quiz</em>
                    </MenuItem>
                    {quizzes.map((q) => (
                      <MenuItem key={q._id || q.id} value={q._id || q.id}>
                        {q.title || q.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* URL and Schedule */}
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  URL (optional)
                </Typography>
                <TextField
                  name="url"
                  value={safeFormData.url}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Enter campaign URL (optional)..."
                  disabled={isSubmitting}
                  sx={textFieldStyle}
                />
              </Box>
              <Box flex={1}>
                <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                  Launch Date *
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    value={dayjs(safeFormData.schedule)}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, schedule: val }))
                    }
                    disabled={isSubmitting}
                    timeSteps={{ minutes: 1 }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          ...textFieldStyle,
                          // ✅ Fix time picker text colors in dark mode
                          '& .MuiInputBase-input': {
                            color: darkMode ? '#e1e1e1' : '#333',
                          },
                        },
                      },
                      // ✅ Fix time picker popover styling
                      popper: {
                        sx: {
                          '& .MuiPaper-root': {
                            backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                            color: darkMode ? '#e1e1e1' : '#333',
                            border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                          },
                          '& .MuiPickersDay-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                            '&:hover': {
                              backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#ec008c',
                              color: '#fff',
                            },
                          },
                          '& .MuiPickersCalendarHeader-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                          },
                          '& .MuiPickersArrowSwitcher-button': {
                            color: darkMode ? '#e1e1e1' : '#333',
                          },
                          '& .MuiClock-root': {
                            backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                          },
                          '& .MuiClockPointer-root': {
                            backgroundColor: '#ec008c',
                          },
                          '& .MuiClockPointer-thumb': {
                            backgroundColor: '#ec008c',
                            borderColor: '#ec008c',
                          },
                          '& .MuiClock-pin': {
                            backgroundColor: '#ec008c',
                          },
                          '& .MuiClockNumber-root': {
                            color: darkMode ? '#e1e1e1' : '#333',
                            '&.Mui-selected': {
                              backgroundColor: '#ec008c',
                              color: '#fff',
                            },
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            {/* Groups */}
            <Box>
              <Typography fontWeight="bold" mb={1} color={darkMode ? '#e1e1e1' : '#333'}>
                Target Groups
              </Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  name="group"
                  value={Array.isArray(formData.group) ? formData.group : []}
                  onChange={(e) => {
                    const {
                      target: { value },
                    } = e;
                    setFormData((prev) => ({
                      ...prev,
                      group: typeof value === "string" ? value.split(",") : value,
                    }));
                  }}
                  disabled={loading || isSubmitting}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          onMouseDown={(event) => event.stopPropagation()}
                          onDelete={() => {
                            setFormData((prev) => ({
                              ...prev,
                              group: prev.group.filter((item) => item !== value),
                            }));
                          }}
                          deleteIcon={
                            <CancelIcon
                              sx={{ borderRadius: "50%", fontSize: "18px", p: "2px" }}
                            />
                          }
                          sx={{
                            backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                            color: '#ec008c',
                            border: "1px solid #ec008c",
                            fontWeight: 500,
                            '& .MuiChip-deleteIcon': {
                              color: '#ec008c',
                              '&:hover': {
                                color: '#d6007a',
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  sx={selectFieldStyle}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: darkMode ? '#1e1e2f' : '#fff',
                        color: darkMode ? '#e1e1e1' : '#333',
                        borderRadius: '12px',
                        border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                        '& .MuiMenuItem-root': {
                          color: darkMode ? '#e1e1e1' : '#333',
                          '&:hover': {
                            backgroundColor: darkMode ? alpha('#ec008c', 0.1) : alpha('#ec008c', 0.1),
                          },
                          '&.Mui-selected': {
                            backgroundColor: darkMode ? alpha('#ec008c', 0.2) : alpha('#ec008c', 0.1),
                          },
                        },
                      },
                    },
                  }}
                >
                  {groups.map((g) => (
                    <MenuItem key={g._id || g.id} value={g.name}>
                      {g.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Helpful tip */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: darkMode ? 'grey.400' : 'grey.600',
                fontSize: '0.75rem',
                lineHeight: 1.4,
                fontStyle: 'italic'
              }}
            >
              💡 Schedule your campaign at least 2 minutes in the future to ensure proper processing.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            color: darkMode ? 'grey.400' : 'grey.600',
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
            },
            '&:disabled': {
              color: darkMode ? 'grey.600' : 'grey.400',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting || loading || !safeFormData.name?.trim()}
          variant="contained"
          startIcon={isSubmitting ? null : <SaveIcon />}
          sx={{
            background: (isSubmitting || !safeFormData.name?.trim()) ? 
              (darkMode ? 'rgba(236, 0, 140, 0.3)' : 'rgba(236, 0, 140, 0.3)') :
              `linear-gradient(135deg, #ec008c, #fc6767)`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: '12px',
            textTransform: 'none',
            px: 4,
            py: 1.2,
            minWidth: '140px',
            boxShadow: (isSubmitting || !safeFormData.name?.trim()) ? 'none' : 
              (darkMode ? 
                '0 4px 16px rgba(236, 0, 140, 0.3)' : 
                '0 4px 16px rgba(236, 0, 140, 0.2)'),
            '&:hover': {
              background: (isSubmitting || !safeFormData.name?.trim()) ? 
                (darkMode ? 'rgba(236, 0, 140, 0.3)' : 'rgba(236, 0, 140, 0.3)') :
                `linear-gradient(135deg, #d6007a, #e55555)`,
              boxShadow: (isSubmitting || !safeFormData.name?.trim()) ? 'none' :
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
          {isSubmitting ? (
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
              Creating...
            </Box>
          ) : (
            'Save Campaign'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewCampaignModal;
