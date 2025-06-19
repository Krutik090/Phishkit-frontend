import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";

// Your custom pink color and styles
const pink = "#ec008c";

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  fontSize: "16px",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
};

// Component
const NewCampaignModal = ({ open, onClose, onSave, formData, setFormData }) => {
  const [templates, setTemplates] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [sendingProfiles, setSendingProfiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const mockData = {
    templates: [
      { id: 1, name: "Welcome Email Template" },
      { id: 2, name: "Newsletter Template" },
      { id: 3, name: "Promotional Template" },
    ],
    landingPages: [
      { id: 1, name: "Home Landing Page" },
      { id: 2, name: "Product Landing Page" },
      { id: 3, name: "Contact Landing Page" },
    ],
    sendingProfiles: [
      { id: 1, name: "Marketing Team Profile" },
      { id: 2, name: "Sales Team Profile" },
      { id: 3, name: "Support Team Profile" },
    ],
    groups: [
      { id: 1, name: "All Users" },
      { id: 2, name: "Premium Users" },
      { id: 3, name: "New Users" },
      { id: 4, name: "Active Users" },
    ],
    quizzes: [
      { id: 1, name: "Product Knowledge Quiz" },
      { id: 2, name: "Customer Satisfaction Quiz" },
      { id: 3, name: "Feedback Survey Quiz" },
    ],
    clients: [
      { id: 1, name: "Acme Corp" },
      { id: 2, name: "Globex Inc." },
      { id: 3, name: "Initech" },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      setLoading(true);

      try {
        const fetchWithFallback = async (url, fallbackData) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              return Array.isArray(data) && data.length > 0
                ? data
                : fallbackData;
            }
            return fallbackData;
          } catch (e) {
            console.warn(`Failed to fetch from ${url}, using mock data`, e);
            return fallbackData;
          }
        };

        const [
          templatesData,
          landingPagesData,
          sendingProfilesData,
          groupsData,
          quizzesData,
          clientsData,
        ] = await Promise.all([
          fetchWithFallback(
            "http://localhost:5000/api/templates",
            mockData.templates
          ),
          fetchWithFallback(
            "http://localhost:5000/api/landing-pages",
            mockData.landingPages
          ),
          fetchWithFallback(
            "http://localhost:5000/api/sending-profiles",
            mockData.sendingProfiles
          ),
          fetchWithFallback(
            "http://localhost:5000/api/groups",
            mockData.groups
          ),
          fetchWithFallback(
            "http://localhost:5000/api/quizzes",
            mockData.quizzes
          ),
          fetchWithFallback(
            "http://localhost:5000/api/clients",
            mockData.clients
          ),
        ]);

        setTemplates(templatesData);
        setLandingPages(landingPagesData);
        setSendingProfiles(sendingProfilesData);
        setGroups(groupsData);
        setQuizzes(quizzesData);
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFocus = (e) => {
    e.target.style.borderColor = pink;
    e.target.style.boxShadow = "0 0 0 0.15rem rgba(236, 0, 140, 0.25)";
  };

  const handleSelectBlur = (e) => {
    e.target.style.borderColor = "#d1d5db";
    e.target.style.boxShadow = "none";
  };

  // const handleSave = async () => {
  //   if (formData?.name && formData?.url && formData?.schedule) {
  //     setLoading(true);

  //     const payload = {
  //       ...formData,
  //       schedule: formData.schedule, // already formatted
  //     };

  //     try {
  //       const response = await fetch(
  //         formData?.id
  //           ? `http://localhost:5000/api/campaigns/${formData.id}`
  //           : "http://localhost:5000/api/campaigns",
  //         {
  //           method: formData?.id ? "PUT" : "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(payload),
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to save campaign");
  //       }

  //       const saved = await response.json();
  //       onSave(saved); // Return saved data to parent
  //       onClose();
  //     } catch (err) {
  //       alert("Failed to save campaign: " + err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     alert("Please fill in all required fields: Name, URL, and Schedule");
  //   }
  // };

const handleSave = async () => {
  if (formData?.name && formData?.url && formData?.schedule) {
    setLoading(true);

    // Find the selected full objects by matching names from formData
    const selectedTemplate = templates.find(t => t.name === formData.template) || {};
    const selectedPage = landingPages.find(lp => lp.name === formData.landingPage) || {};
    const selectedSmtp = sendingProfiles.find(sp => sp.name === formData.sendingProfile) || {};

    // groups is an array of group names, map to full group objects
    const selectedGroups = (formData.groups || []).map(groupName =>
      groups.find(g => g.name === groupName)
    ).filter(Boolean);

    const payload = {
      name: formData.name,
      template: selectedTemplate,
      page: selectedPage,
      smtp: selectedSmtp,
      url: formData.url,
      launch_date: formData.schedule,
      groups: selectedGroups,
    };

    const isEditing = !!formData?.id;
    const url = isEditing
      ? `http://localhost:5000/api/campaigns/${formData.id}`
      : "http://localhost:5000/api/campaigns";

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save campaign");
      }

      const saved = await response.json();

      onSave(isEditing ? { ...formData, ...saved } : saved);
      onClose();
    } catch (err) {
      alert("Failed to save campaign: " + err.message);
    } finally {
      setLoading(false);
    }
  } else {
    alert("Please fill in all required fields: Name, URL, and Schedule");
  }
};

  const safeFormData = {
    name: "",
    client: "",
    template: "",
    landingPage: "",
    url: "",
    schedule: dayjs().format("YYYY-MM-DDTHH:mm"),
    sendingProfile: "",
    group: "",
    quiz: "",
    groups: [],
    ...formData,
  };

  // RENDER: everything else stays the same...

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: "1200px",
          height: "850px",
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
        🎯 Add New Campaign
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Row 1: Name & Client */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                Name of Campaign *
              </Typography>
              <TextField
                name="name"
                value={safeFormData.name}
                onChange={handleChange}
                fullWidth
                placeholder="Enter campaign name"
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: pink,
                  },
                }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                Client
              </Typography>
              <select
                name="client"
                value={safeFormData.client}
                onChange={handleChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={inputStyle}
                disabled={loading}
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Row 2: Template & Landing Page */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                Email Template
              </Typography>
              <select
                name="template"
                value={safeFormData.template}
                onChange={handleChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={inputStyle}
                disabled={loading}
              >
                <option value="">Select Template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                Landing Page
              </Typography>
              <select
                name="landingPage"
                value={safeFormData.landingPage}
                onChange={handleChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={inputStyle}
                disabled={loading}
              >
                <option value="">Select Landing Page</option>
                {landingPages.map((lp) => (
                  <option key={lp.id} value={lp.name}>
                    {lp.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Row 3: URL & Schedule */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                URL *
              </Typography>
              <TextField
                name="url"
                value={safeFormData.url}
                onChange={handleChange}
                fullWidth
                placeholder="Enter URL"
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: pink,
                  },
                }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                Schedule (Date & Time) *
              </Typography>
              <TextField
                name="schedule"
                type="datetime-local"
                value={safeFormData.schedule}
                onChange={handleChange}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: pink,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Row 4: Sending Profile & Quiz */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                Sending Profile
              </Typography>
              <select
                name="sendingProfile"
                value={safeFormData.sendingProfile}
                onChange={handleChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={inputStyle}
                disabled={loading}
              >
                <option value="">Select Profile</option>
                {sendingProfiles.map((sp) => (
                  <option key={sp.id} value={sp.name}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>
                Quiz
              </Typography>
              <select
                name="quiz"
                value={safeFormData.quiz}
                onChange={handleChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={inputStyle}
                disabled={loading}
              >
                <option value="">Select Quiz</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.name}>
                    {q.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Row 5: Groups (Full Width) */}
          <Box>
            <Typography fontWeight="bold" mb={0.5}>
              Groups
            </Typography>
            <select
              name="groups"
              value=""
              onChange={(e) => {
                const selectedGroup = e.target.value;
                setFormData((prev) => {
                  const currentGroups = prev.groups || [];
                  const isSelected = currentGroups.includes(selectedGroup);
                  return {
                    ...prev,
                    groups: isSelected
                      ? currentGroups.filter((g) => g !== selectedGroup)
                      : [...currentGroups, selectedGroup],
                  };
                });
              }}
              onFocus={handleSelectFocus}
              onBlur={handleSelectBlur}
              style={inputStyle}
              disabled={loading}
            >
              <option value="" disabled>
                Select or Deselect Group
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>

            {safeFormData.groups?.length > 0 && (
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {safeFormData.groups.map((group) => (
                  <Chip
                    key={group}
                    label={group}
                    onDelete={() =>
                      setFormData((prev) => ({
                        ...prev,
                        groups: (prev.groups || []).filter((g) => g !== group),
                      }))
                    }
                    sx={{
                      backgroundColor: pink,
                      color: "white",
                      "& .MuiChip-deleteIcon": { color: "white" },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#374151",
            borderColor: "#d1d5db",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 1,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
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
        >
          {loading ? "Loading..." : " SAVE "}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewCampaignModal;
