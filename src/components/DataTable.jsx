import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { pink } from "@mui/material/colors";
import CampaignIcon from "@mui/icons-material/Campaign";
import NewCampaignModal from "./NewCampaignModal";

const Datatable = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    template: "",
    landingPage: "",
    url: "",
    schedule: "",
    sendingProfile: "",
    groups: [],
    quiz: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/campaigns")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Failed to fetch data:", err));
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? (
      <ArrowDropUpIcon fontSize="small" sx={{ color: "#ec008c" }} />
    ) : (
      <ArrowDropDownIcon fontSize="small" sx={{ color: "#ec008c" }} />
    );
  };

  const renderSortLabel = (label, field) => (
    <Box
      display="flex"
      alignItems="center"
      sx={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => handleSort(field)}
    >
      {label}
      {getSortIcon(field)}
    </Box>
  );

  const filtered = data.filter((row) =>
    row.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const pageCount = Math.ceil(sorted.length / entriesPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleSave = () => {
    // Create new campaign object
    const newCampaign = {
      id: Date.now(), // Simple ID generation
      name: formData.name,
      client_id: null,
      status: "Draft",
      launch_date: formData.schedule,
      emails_sent: 0,
      ...formData
    };

    // Add to data
    setData((prev) => [...prev, newCampaign]);
    
    // Reset form and close modal
    setFormData({
      name: "",
      template: "",
      landingPage: "",
      url: "",
      schedule: "",
      sendingProfile: "",
      groups: [],
      quiz: "",
    });
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // Reset form data
    setFormData({
      name: "",
      template: "",
      landingPage: "",
      url: "",
      schedule: "",
      sendingProfile: "",
      groups: [],
      quiz: "",
    });
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <CampaignIcon sx={{ color: pink[500], mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="#343a40">
            Campaigns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{
            background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "uppercase",
            px: 3,
            py: 1,
            boxShadow: "0 4px 10px rgba(236, 0, 140, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #d6007a, #ff478a)",
              boxShadow: "0 6px 12px rgba(236, 0, 140, 0.5)",
            },
          }}
        >
          Add Campaign
        </Button>
      </Box>

      <Paper
        elevation={2}
        sx={{
          borderRadius: "12px",
          p: 2,
          height: 800,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <FormControl variant="standard">
            <InputLabel>Show</InputLabel>
            <Select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              sx={{ minWidth: 80 }}
            >
              {[10, 25, 50, 100].map((count) => (
                <MenuItem key={count} value={count}>
                  {count}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            placeholder="🔍 Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            variant="standard"
            sx={{ width: 300 }}
          />
        </Box>

        <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {[
                  { label: "ID", field: "id" },
                  { label: "Name", field: "name" },
                  { label: "Client ID", field: "client_id" },
                  { label: "Status", field: "status" },
                  { label: "Launch Date", field: "launch_date" },
                  { label: "Email Sent", field: "emails_sent" },
                ].map(({ label, field }) => (
                  <TableCell
                    key={field}
                    sx={{
                      backgroundColor: "#ffe0ef",
                      color: "#ec008c",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort(field)}
                  >
                    {renderSortLabel(label, field)}
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    backgroundColor: "#ffe0ef",
                    color: "#ec008c",
                    fontWeight: "bold",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.client_id ?? "—"}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>
                      {row.launch_date
                        ? new Date(row.launch_date).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>{row.emails_sent ?? "0"}</TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="secondary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="gray">
            Showing {Math.min(sorted.length, (currentPage - 1) * entriesPerPage + 1)} to{" "}
            {Math.min(currentPage * entriesPerPage, sorted.length)} of {sorted.length} entries
          </Typography>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Modal for creating new campaign */}
      <NewCampaignModal
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
      />
    </Box>
  );
};

export default Datatable;
