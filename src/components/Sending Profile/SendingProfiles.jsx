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
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-toastify";
import NewSendingProfileModal from "./NewSendingProfileModal";

const API_BASE_URL = "http://localhost:5000/api/sending-profiles";

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
  const [groupToDelete, setGroupToDelete] = useState(null);

  // Fetch profiles on mount
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      alert("Failed to load sending profiles.");
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

  // Filtering & sorting
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

  // Delete profile handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sending profile?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete profile");

      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      setProfiles((prev) => prev.filter((p) => p.id !== id));

      // ✅ Add this line
      toast.success("Sending profile deleted successfully!");
    } catch (err) {
      console.error("Failed to delete profile:", err);
      toast.error("Failed to delete the sending profile.");
    }

  };

  return (
    <Box p={3}>
      {/* <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the group{" "}
          <strong>{groupToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete(groupToDelete)} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog> */}
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
                          //                         onClick={() => {
                          //                           setGroupToDelete(profile.id);
                          //                 setDeleteDialogOpen(true);
                          // }}
                          onClick={() => handleDelete(profile.id)}
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

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="gray">
            Showing{" "}
            {Math.min(sorted.length, (currentPage - 1) * entriesPerPage + 1)} to{" "}
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

      {/* <NewSendingProfileModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSave={async (data) => {
          if (editingProfile) {
            // Update backend to get the latest saved profile (already done inside modal)
            // We update UI locally here
            setProfiles((prev) =>
              prev.map((p) => (p.id === editingProfile.id ? { ...p, ...data } : p))
            );
          } else {
            // Optimistically add new profile with temporary id
            // Ideally, you would refetch or get real id from backend
            setProfiles((prev) => [...prev, { id: Date.now(), ...data }]);
          }
          setOpenModal(false);
        }}
        initialData={editingProfile}
      /> */}
      <NewSendingProfileModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSave={(savedProfile) => {
          if (editingProfile) {
            // It's an update, so replace the existing profile in the list
            setProfiles((prev) =>
              prev.map((p) => (p.id === savedProfile.id ? savedProfile : p))
            );
          } else {
            // It's a new profile created via POST, backend returned full object including ID
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
