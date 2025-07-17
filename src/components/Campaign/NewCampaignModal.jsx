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
} from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const pink = "#ec008c";
const GRADIENT = `linear-gradient(to right, ${pink}, #d946ef)`;

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: `1px solid #d1d5db`,
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
  const [projects, setProjects] = useState([]);
  const [existingCampaigns, setExistingCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const mockData = {
    templates: [{ id: 1, name: "Mock Template" }],
    landingPages: [{ id: 1, name: "Mock Landing" }],
    sendingProfiles: [{ id: 1, name: "Mock SMTP" }],
    groups: [{ id: 1, name: "Mock Group" }],
    quizzes: [{ id: 1, name: "Mock Quiz", publicUrl: "sample-url" }],
    projects: [{ _id: "1", name: "Mock Project" }],
  };

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      setHasSaved(false);

      try {
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

        setTemplates(templatesData);
        setLandingPages(landingPagesData);
        setSendingProfiles(sendingProfilesData);
        setGroups(groupsData);
        setQuizzes(quizzesData);
        setProjects(projectData);
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

    if (name === "quiz") {
      const selectedQuiz = quizzes.find((q) => (q._id || q.id) === value);
      setFormData((prev) => ({ ...prev, quiz: selectedQuiz || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      groups: Array.isArray(formData.group)
        ? formData.group.map((groupName) => ({ name: groupName }))
        : [],
      projectId: formData.project,
      publicUrl: formData.quiz?.publicUrl || null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const handleSelectFocus = (e) => {
    e.target.style.borderColor = pink;
    e.target.style.boxShadow = "0 0 0 0.15rem rgba(236, 0, 140, 0.25)";
  };

  const handleSelectBlur = (e) => {
    e.target.style.borderColor = "#d1d5db";
    e.target.style.boxShadow = "none";
  };

  // return (
  //   <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg"
  //     PaperProps={{
  //       sx: {
  //         width: "1200px",
  //         height: "740px",
  //         maxHeight: "90vh",
  //         borderRadius: "16px",
  //         border: "2px solid #ec008c30",
  //         boxShadow: "0 8px 24px rgba(236, 0, 140, 0.2)",
  //       },
  //     }}>
  //     <DialogTitle sx={{ fontWeight: "bold", color: pink, borderBottom: "1px solid #f8c6dd", backgroundColor: "#fff0f7" }}>
  //       🎯 Add New Campaign
  //     </DialogTitle>

  //     <DialogContent sx={{ mt: 2 }}>
  //       <Box display="flex" flexDirection="column" gap={3}>
  //         {/* Campaign Name & Client */}
  //         <Box display="flex" gap={2}>
  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>Campaign Name *</Typography>
  //             <TextField name="name" value={safeFormData.name} onChange={handleChange}
  //               fullWidth placeholder="Enter campaign name"
  //               sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: pink } }} />
  //           </Box>
  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>Project</Typography>
  //             <select name="client" value={safeFormData.client} onChange={handleChange}
  //               onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
  //               <option value="">Select Project</option>
  //               {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
  //             </select>
  //           </Box>
  //         </Box>

  //         {/* Template and Landing Page */}
  //         <Box display="flex" gap={2}>
  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>Template</Typography>
  //             <select name="template" value={safeFormData.template} onChange={handleChange}
  //               onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
  //               <option value="">Select Template</option>
  //               {templates.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
  //             </select>
  //           </Box>
  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>Landing Page</Typography>
  //             <select name="landingPage" value={safeFormData.landingPage} onChange={handleChange}
  //               onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
  //               <option value="">Select Landing Page</option>
  //               {landingPages.map((lp) => <option key={lp.id} value={lp.name}>{lp.name}</option>)}
  //             </select>
  //           </Box>
  //         </Box>

  //         {/* SMTP and Quiz */}
  //         <Box display="flex" gap={2}>
  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>Sending Profile</Typography>
  //             <select name="sendingProfile" value={safeFormData.sendingProfile} onChange={handleChange}
  //               onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
  //               <option value="">Select SMTP</option>
  //               {sendingProfiles.map((sp) => <option key={sp.id} value={sp.name}>{sp.name}</option>)}
  //             </select>
  //           </Box>

  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>Quiz</Typography>
  //             <select name="quiz" value={safeFormData.quiz?._id || ""} onChange={handleChange}
  //               onFocus={handleSelectFocus} onBlur={handleSelectBlur} style={inputStyle} disabled={loading}>
  //               <option value="">Select Quiz</option>
  //               {quizzes.map((q) => (
  //                 <option key={q._id || q.id} value={q._id || q.id}>
  //                   {q.title || q.name}
  //                 </option>
  //               ))}
  //             </select>
  //           </Box>
  //         </Box>

  //         {/* URL and Schedule */}
  //         <Box display="flex" gap={2}>
  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>URL</Typography>
  //             <TextField name="url" value={safeFormData.url} onChange={handleChange}
  //               fullWidth placeholder="Enter campaign URL"
  //               sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: pink } }} />
  //           </Box>
  //           <Box flex={1}>
  //             <Typography fontWeight="bold" mb={0.5}>Launch Date</Typography>
  //             {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
  //               <DateTimePicker
  //                 value={dayjs(safeFormData.schedule)}
  //                 onChange={(val) => setFormData((prev) => ({ ...prev, schedule: val }))}
  //                 timeSteps={{ minutes: 1 }}
  //                 slotProps={{
  //                   textField: {
  //                     fullWidth: true,
  //                     sx: {
  //                       "& .MuiOutlinedInput-root.Mui-focused fieldset": {
  //                         borderColor: pink,
  //                       },
  //                     },
  //                   },
  //                 }}
  //               />
  //             </LocalizationProvider> */}
  //             <LocalizationProvider dateAdapter={AdapterDayjs}>
  //               <DateTimePicker
  //                 value={dayjs(safeFormData.schedule)}
  //                 onChange={(val) =>
  //                   setFormData((prev) => ({ ...prev, schedule: val }))
  //                 }
  //                 timeSteps={{ minutes: 1 }}
  //                 slotProps={{
  //                   textField: {
  //                     fullWidth: true,
  //                     sx: {
  //                       "& .MuiOutlinedInput-root.Mui-focused fieldset": {
  //                         borderColor: pink[500], // pink is an object with shades, like pink[500]
  //                       },
  //                     },
  //                   },
  //                 }}
  //               />
  //             </LocalizationProvider>
  //           </Box>
  //         </Box>

  //         {/* Groups */}
  //         <Box>
  //           <Typography fontWeight="bold" mb={0.5}>Group</Typography>
  //           <Select
  //             multiple
  //             name="group"
  //             value={Array.isArray(formData.group) ? formData.group : []}
  //             onChange={(e) => {
  //               const {
  //                 target: { value },
  //               } = e;
  //               setFormData((prev) => ({
  //                 ...prev,
  //                 group: typeof value === "string" ? value.split(",") : value,
  //               }));
  //             }}
  //             disabled={loading}
  //             input={<OutlinedInput fullWidth />}
  //             renderValue={(selected) => (
  //               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
  //                 {selected.map((value) => (
  //                   <Chip
  //                     key={value}
  //                     label={value}
  //                     onMouseDown={(event) => event.stopPropagation()}
  //                     onDelete={() => {
  //                       setFormData((prev) => ({
  //                         ...prev,
  //                         group: prev.group.filter((item) => item !== value),
  //                       }));
  //                     }}
  //                     deleteIcon={<CancelIcon sx={{ borderRadius: "50%", fontSize: "18px", p: "2px" }} />}
  //                     sx={{
  //                       backgroundColor: "white",
  //                       color: "black",
  //                       border: "2px solid",
  //                       borderColor: pink,
  //                       fontWeight: 500,
  //                     }}
  //                   />
  //                 ))}
  //               </Box>
  //             )}
  //             sx={{
  //               "& .MuiOutlinedInput-root": {
  //                 "& fieldset": { border: "none" },
  //                 "&:hover fieldset": { border: "none" },
  //                 "&.Mui-focused fieldset": { border: "none" },
  //               },
  //             }}
  //           >
  //             {groups.map((g) => (
  //               <MenuItem key={g.id} value={g.name}>
  //                 {g.name}
  //               </MenuItem>
  //             ))}
  //           </Select>
  //         </Box>

  //         {/* Actions */}
  //         <DialogActions sx={{ px: 3, pb: 2 }}>
  //           <Button onClick={onClose} variant="outlined">
  //             CANCEL
  //           </Button>
  //           <Button
  //             onClick={handleSave}
  //             variant="contained"
  //             sx={{ background: GRADIENT }}
  //           >
  //             Save Campaign
  //           </Button>
  //         </DialogActions>
  //       </Box>
  //     </DialogContent>
  //   </Dialog>
  // );
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg"
      PaperProps={{
        sx: {
          width: "1200px",
          height: "740px",
          maxHeight: "90vh",
          borderRadius: "16px",
          border: "2px solid #ec008c30",
          boxShadow: "0 8px 24px rgba(236, 0, 140, 0.2)",
        },
      }}>
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: pink,
          borderBottom: "1px solid #f8c6dd",
          backgroundColor: "#fff0f7",
        }}
      >
        🎯 Add New Campaign
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Campaign Name & Client */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Campaign Name *</Typography>
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
              <Typography fontWeight="bold" mb={0.5}>Project</Typography>
              <select
                name="project"
                value={safeFormData.project}
                onChange={handleChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={inputStyle}
                disabled={loading}
              >
                <option value="">Select Project</option>
                {projects.map((c) => (
                  <option key={c._id || c.id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {/* Template and Landing Page */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Template</Typography>
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
                  <option key={t._id || t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Landing Page</Typography>
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
                  <option key={lp._id || lp.id} value={lp.name}>
                    {lp.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>

          {/* SMTP and Quiz */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Sending Profile</Typography>
              <select
                name="sendingProfile"
                value={safeFormData.sendingProfile}
                onChange={handleChange}
                onFocus={handleSelectFocus}
                onBlur={handleSelectBlur}
                style={inputStyle}
                disabled={loading}
              >
                <option value="">Select SMTP</option>
                {sendingProfiles.map((sp) => (
                  <option key={sp._id || sp.id} value={sp.name}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Quiz</Typography>
              <select
                name="quiz"
                value={safeFormData.quiz?._id || ""}
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

          {/* URL and Schedule */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>URL</Typography>
              <TextField
                name="url"
                value={safeFormData.url}
                onChange={handleChange}
                fullWidth
                placeholder="Enter campaign URL"
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: pink,
                  },
                }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontWeight="bold" mb={0.5}>Launch Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={dayjs(safeFormData.schedule)}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, schedule: val }))
                  }
                  timeSteps={{ minutes: 1 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                          borderColor: pink[500],
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
            <Typography fontWeight="bold" mb={0.5}>Group</Typography>
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
              disabled={loading}
              input={<OutlinedInput fullWidth />}
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
                        backgroundColor: "white",
                        color: "black",
                        border: "2px solid",
                        borderColor: pink,
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                },
              }}
            >
              {groups.map((g) => (
                <MenuItem key={g._id || g.id} value={g.name}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Actions */}
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="outlined">
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ background: GRADIENT }}
            >
              Save Campaign
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );

};

export default NewCampaignModal;

