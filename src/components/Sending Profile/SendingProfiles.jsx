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
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewSendingProfileModal from "./NewSendingProfileModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SendingProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles`);
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      toast.error("Failed to load sending profiles.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
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

  const filtered = profiles.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const confirmDelete = (profile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sending-profiles/${profileToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete profile");
      setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id));
      toast.success("Sending profile deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete the sending profile.");
    } finally {
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  return (
    <Box p={3}>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the sending profile{" "}
          <strong>{profileToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#343a40">
          📧 Sending Profiles
        </Typography>
        <Button
          onClick={() => {
            setEditingProfile(null);
            setOpenModal(true);
          }}
          variant="contained"
          startIcon={<AddIcon />}
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
          New Profile
        </Button>
      </Box>

      {/* Table Wrapper */}
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
        {/* Filters */}
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
                  { label: "Name", field: "name" },
                  { label: "From Address", field: "from_address" },
                  { label: "Host", field: "host" },
                  { label: "Ignore Cert Errors", field: "ignore_cert_errors" },
                  { label: "Actions", field: null },
                ].map(({ label, field }) => (
                  <TableCell
                    key={label}
                    sx={{
                      backgroundColor: "#ffe0ef",
                      color: "#ec008c",
                      fontWeight: "bold",
                      cursor: field ? "pointer" : "default",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {field ? renderSortLabel(label, field) : label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((profile) => (
                  <TableRow key={profile.id} hover>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell>{profile.from_address}</TableCell>
                    <TableCell>{profile.host}</TableCell>
                    <TableCell>{profile.ignore_cert_errors ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setEditingProfile(profile);
                            setOpenModal(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => confirmDelete(profile)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No sending profiles found.
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

      {/* New/Edit Modal */}
      <NewSendingProfileModal
        open={openModal}
        handleClose={() => {
          setOpenModal(false);
          setEditingProfile(null);
        }}
        onSave={(savedProfile) => {
          if (editingProfile) {
            setProfiles((prev) =>
              prev.map((p) => (p.id === savedProfile.id ? savedProfile : p))
            );
          } else {
            setProfiles((prev) => [...prev, savedProfile]);
          }
          setOpenModal(false);
        }}
        initialData={editingProfile}
      />
    </Box>
  );
};

export default SendingProfiles;
