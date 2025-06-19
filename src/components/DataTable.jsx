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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Visibility as VisibilityIcon,
  CheckBox,
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
  const [formData, setFormData] = useState(initialFormState());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null });
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  function initialFormState() {
    return {
      id: null,
      name: "",
      template: "",
      landingPage: "",
      url: "",
      schedule: "",
      sendingProfile: "",
      groups: [],
      quiz: "",
    };
  }

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

  const handleEdit = (campaign) => {
    setFormData({
      id: campaign.id,
      name: campaign.name,
      template: campaign.template || "",
      landingPage: campaign.landingPage || "",
      url: campaign.url || "",
      schedule: campaign.launch_date || "",
      sendingProfile: campaign.sendingProfile || "",
      groups: campaign.groups || [],
      quiz: campaign.quiz || "",
    });
    setOpenModal(true);
  };

  const handleDeleteConfirm = (campaign) => {
    setDeleteDialog({ open: true, campaign });
  };

  const confirmDelete = async () => {
  const campaignId = deleteDialog.campaign?.id;
  if (!campaignId) return;

  try {
    const res = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete campaign on the server.");
    }

    // If backend delete was successful, update frontend state
    setData((prev) => prev.filter((c) => c.id !== campaignId));
  } catch (error) {
    console.error("Error deleting campaign:", error);
    alert("Failed to delete campaign. Please try again.");
  } finally {
    setDeleteDialog({ open: false, campaign: null });
  }
};


  const cancelDelete = () => {
    setDeleteDialog({ open: false, campaign: null });
  };

  const handleSave = (savedCampaign) => {
    if (savedCampaign.id && data.some((c) => c.id === savedCampaign.id)) {
      setData((prev) =>
        prev.map((c) => (c.id === savedCampaign.id ? savedCampaign : c))
      );
    } else {
      const newCampaign = {
        id: Date.now(),
        name: savedCampaign.name,
        client_id: null,
        status: "Draft",
        launch_date: savedCampaign.schedule,
        emails_sent: 0,
        ...savedCampaign,
      };
      setData((prev) => [...prev, newCampaign]);
    }

    setFormData(initialFormState());
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData(initialFormState());
  };

  return (
    <Box p={3}>
      {/* Header */}
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
  onClick={() => {
    if (selectedCampaignId) {
      alert(`Selected Campaign ID: ${selectedCampaignId}`);
    } else {
      alert("Please select a campaign first.");
    }

    setFormData(initialFormState());
    setOpenModal(true);
  }}
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

      {/* Table Container */}
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
        {/* Top Controls */}
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

        {/* Table */}
        <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {[
                  { label: "Select", field: "Select" },
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
  <TableCell>
  <CheckBox
    checked={selectedCampaignId === row.id}
    onChange={() => setSelectedCampaignId(row.id)} // Use onChange instead of onClick
    sx={{
      color: "#ec008c",
      '&.Mui-checked': {
        color: "#ec008c",
      },
    }}
  />
</TableCell>
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
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleEdit(row)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteConfirm(row)}
                        >
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

        {/* Pagination */}
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

      {/* Modal for Add/Edit */}
      <NewCampaignModal
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteDialog.campaign?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Datatable;
