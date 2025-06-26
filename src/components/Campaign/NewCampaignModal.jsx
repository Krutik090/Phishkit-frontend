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
  const [existingCampaigns, setExistingCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const mockData = {
    templates: [{ id: 1, name: "Mock Template" }],
    landingPages: [{ id: 1, name: "Mock Landing" }],
    sendingProfiles: [{ id: 1, name: "Mock SMTP" }],
    groups: [{ id: 1, name: "Mock Group" }],
    quizzes: [{ id: 1, name: "Mock Quiz" }],
    clients: [{ _id: "1", name: "Mock Client" }],
  };

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      setHasSaved(false);

      try {
        const fetchWithFallback = async (url, fallbackData) => {
          try {
            const res = await fetch(url);
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
          clientsData,
          campaignsData,
        ] = await Promise.all([
          fetchWithFallback("http://localhost:5000/api/templates", mockData.templates),
          fetchWithFallback("http://localhost:5000/api/landing-pages", mockData.landingPages),
          fetchWithFallback("http://localhost:5000/api/sending-profiles", mockData.sendingProfiles),
          fetchWithFallback("http://localhost:5000/api/groups", mockData.groups),
          fetchWithFallback("http://localhost:5000/api/quizzes", mockData.quizzes),
          fetchWithFallback("http://localhost:5000/api/clients", mockData.clients),
          fetchWithFallback("http://localhost:5000/api/campaigns", []),
        ]);

        setTemplates(templatesData);
        setLandingPages(landingPagesData);
        setSendingProfiles(sendingProfilesData);
        setGroups(groupsData);
        setQuizzes(quizzesData);
        setClients(clientsData);
        setExistingCampaigns(campaignsData);
      } catch (err) {
        toast.error("Error loading campaign data.");
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

  const handleSave = async () => {
    if (hasSaved) return;

    if (!formData?.name || !formData?.schedule) {
      toast.warning("Please fill in all required fields: Name, and Schedule.");
      return;
    }

    const nameExists = existingCampaigns.some(
      (c) => c.name.trim().toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (nameExists) {
      toast.error("❌ Campaign with this name already exists.");
      return;
    }

    setHasSaved(true);

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
      const res = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("🎯 Campaign saved successfully!");
        onSave();
        onClose();
      } else {
        toast.error("Failed to save campaign.");
        setHasSaved(false);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving.");
      setHasSaved(false);
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

  const handleSelectFocus = (e) => {
    e.target.style.borderColor = pink;
    e.target.style.boxShadow = "0 0 0 0.15rem rgba(236, 0, 140, 0.25)";
  };

  const handleSelectBlur = (e) => {
    e.target.style.borderColor = "#d1d5db";
    e.target.style.boxShadow = "none";
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
      }}>
      <DialogTitle sx={{ fontWeight: "bold", color: pink, borderBottom: "1px solid #f8c6dd", backgroundColor: "#fff0f7" }}>
        🎯 Add New Campaign
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Row 1 */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Campaign Name *</Typography>
              <TextField name="name" value={safeFormData.name} onChange={handleChange}
                fullWidth placeholder="Enter campaign name"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: pink } }} />
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Client</Typography>
              <select name="client" value={safeFormData.client} onChange={handleChange}
                onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Box>
          </Box>

          {/* Row 2 */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Template</Typography>
              <select name="template" value={safeFormData.template} onChange={handleChange}
                onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Template</option>
                {templates.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Landing Page</Typography>
              <select name="landingPage" value={safeFormData.landingPage} onChange={handleChange}
                onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Landing Page</option>
                {landingPages.map((lp) => <option key={lp.id} value={lp.name}>{lp.name}</option>)}
              </select>
            </Box>
          </Box>

          {/* Row 3 */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Sending Profile</Typography>
              <select name="sendingProfile" value={safeFormData.sendingProfile} onChange={handleChange}
                onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select SMTP</option>
                {sendingProfiles.map((sp) => <option key={sp.id} value={sp.name}>{sp.name}</option>)}
              </select>
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Group</Typography>
              <select name="group" value={safeFormData.group} onChange={handleChange}
                onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
                <option value="">Select Group</option>
                {groups.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </Box>
          </Box>

          {/* Row 4 */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>URL *</Typography>
              <TextField name="url" value={safeFormData.url} onChange={handleChange}
                fullWidth placeholder="Enter campaign URL"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: pink } }} />
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Launch Date *</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={dayjs(safeFormData.schedule)}
                  onChange={(val) => setFormData((prev) => ({ ...prev, schedule: val }))}
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

          {/* Row 5 */}
          <Box>
            <Typography fontWeight="bold" mb={0.5}>Quiz (Optional)</Typography>
            <select name="quiz" value={safeFormData.quiz} onChange={handleChange}
              onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
              <option value="">Select Quiz</option>
              {quizzes.map((q) => <option key={q._id || q.id} value={q._id || q.id}>{q.title || q.name}</option>)}
            </select>
          </Box>

          {/* Actions */}
          <DialogActions sx={{ borderTop: "1px solid #f8c6dd", pt: 2 }}>
            <Button onClick={onClose} variant="outlined"
              sx={{ color: pink, borderColor: pink, textTransform: "none", "&:hover": { borderColor: pink } }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained"
              sx={{ backgroundColor: pink, color: "#fff", textTransform: "none", "&:hover": { backgroundColor: pink } }}>
              Save Campaign
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal;
