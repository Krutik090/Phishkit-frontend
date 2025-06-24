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
} from "@mui/material";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

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
      { _id: "1", name: "Acme Corp" },
      { _id: "2", name: "Globex Inc." },
      { _id: "3", name: "Initech" },
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
          fetchWithFallback("http://localhost:5000/api/templates", mockData.templates),
          fetchWithFallback("http://localhost:5000/api/landing-pages", mockData.landingPages),
          fetchWithFallback("http://localhost:5000/api/sending-profiles", mockData.sendingProfiles),
          fetchWithFallback("http://localhost:5000/api/groups", mockData.groups),
          fetchWithFallback("http://localhost:5000/api/quizzes", mockData.quizzes),
          fetchWithFallback("http://localhost:5000/api/clients", mockData.clients),
        ]);

        setTemplates(templatesData);
        setLandingPages(landingPagesData);
        setSendingProfiles(sendingProfilesData);
        setGroups(groupsData);
        setQuizzes(quizzesData);
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data.");
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

  const handleSave = async () => {
    if (formData?.name && formData?.url && formData?.schedule) {
      const payload = {
        name: formData.name,
        template: { name: formData.template },
        landingPage: { name: formData.landingPage },
        smtp: { name: formData.sendingProfile },
        url: formData.url,
        launchDate: dayjs(formData.schedule).toISOString(),
        group: { name: formData.group },
        clientId: formData.client,
        quiz: formData.quiz || null,
      };


      try {
        const response = await fetch("http://localhost:5000/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          toast.success("🎯 Campaign saved successfully!");
          onSave();
          onClose();
        } else {
          toast.error("Failed to save the campaign.");
        }
      } catch (error) {
        console.error("Error saving campaign:", error);
        toast.error("An error occurred while saving the campaign.");
      }
    } else {
      toast.warning("Please fill in all required fields: Name, URL, and Schedule.");
    }
  };

  const safeFormData = {
    name: "",
    client: "",
    template: "",
    landingPage: "",
    url: "",
    schedule: formData?.schedule ? dayjs(formData.schedule) : dayjs(),
    sendingProfile: "",
    group: "",
    quiz: "",
    ...formData,
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg"
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
      <DialogTitle sx={{ fontWeight: "bold", color: pink, borderBottom: "1px solid #f8c6dd", backgroundColor: "#fff0f7" }}>
        🎯 Add New Campaign
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Row 1: Name & Client */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Name of Campaign *</Typography>
              <TextField
                name="name"
                value={safeFormData.name}
                onChange={handleChange}
                fullWidth
                placeholder="Enter campaign name"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: pink } }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Client</Typography>
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
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Row 2: Template & Landing Page */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Template</Typography>
              <select name="template" value={safeFormData.template} onChange={handleChange} onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Landing Page</Typography>
              <select name="landingPage" value={safeFormData.landingPage} onChange={handleChange} onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Landing Page</option>
                {landingPages.map((lp) => (
                  <option key={lp.id} value={lp.name}>{lp.name}</option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Row 3: Sending Profile & Group */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Sending Profile</Typography>
              <select name="sendingProfile" value={safeFormData.sendingProfile} onChange={handleChange} onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Sending Profile</option>
                {sendingProfiles.map((sp) => (
                  <option key={sp.id} value={sp.name}>{sp.name}</option>
                ))}
              </select>
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Group</Typography>
              <select name="group" value={safeFormData.group} onChange={handleChange} onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Row 4: URL & Launch Date */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>URL</Typography>
              <TextField
                name="url"
                value={safeFormData.url}
                onChange={handleChange}
                fullWidth
                placeholder="Enter campaign URL"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: pink } }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Launch Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={dayjs(safeFormData.schedule)}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, schedule: newValue }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                          borderColor: pink,
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          {/* Row 5: Quiz Selection */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Quiz (Optional)</Typography>
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
                  <option key={q._id || q.id} value={q._id || q.id}>
                    {q.title || q.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>


          <DialogActions sx={{ borderTop: "1px solid #f8c6dd", pt: 2 }}>
            <Button onClick={onClose} variant="outlined" sx={{
              color: pink,
              borderColor: pink,
              textTransform: "none",
              "&:hover": { borderColor: pink },
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" sx={{
              backgroundColor: pink,
              color: "#fff",
              textTransform: "none",
              "&:hover": { backgroundColor: pink },
            }}>
              Save Campaign
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal;
