import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TextField,
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
  Group as GroupIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewGroupModal from "./NewGroupModal";
import LdapConfigDialog from "../LDAP/Ldap";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const UsersGroups = () => {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [openModal, setOpenModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [ldapDialogOpen, setLdapDialogOpen] = useState(false);


  const fetchGroups = () => {
    fetch(`${API_BASE_URL}/groups`)
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch((err) => console.error("Failed to fetch groups:", err));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      await fetch(`${API_BASE_URL}/groups/${groupToDelete.id}`, {
        method: "DELETE",
      });

      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      toast.success("Group deleted successfully!");
    } catch (err) {
      console.error("Failed to delete group:", err);
      toast.error("Failed to delete group. Please try again.");
    }
  };

  const renderSortLabel = (field, label) => (
    <Box
      display="flex"
      alignItems="center"
      sx={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ArrowDropUpIcon fontSize="small" />
        ) : (
          <ArrowDropDownIcon fontSize="small" />
        ))}
    </Box>
  );

  const filtered = groups.filter((group) =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = sortField === "members" ? a.targets?.length || 0 : a[sortField];
    const valB = sortField === "members" ? b.targets?.length || 0 : b[sortField];
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const pageCount = Math.ceil(sorted.length / entriesPerPage);
  const paginatedData = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleNewGroup = () => {
    setSelectedGroup(null);
    setModalMode("create");
    setOpenModal(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedGroup(null);
    setModalMode("create");
  };

  return (
    <Box p={3}>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the group{" "}
          <strong>{groupToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteGroup} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <LdapConfigDialog open={ldapDialogOpen} onClose={() => setLdapDialogOpen(false)} />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#343a40"
          display="flex"
          alignItems="center"
        >
          <GroupIcon sx={{ mr: 1 }} />
          Users & Groups
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            onClick={() => setLdapDialogOpen(true)}
            variant="outlined"
            sx={{
              borderColor: "#ec008c",
              color: "#ec008c",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "uppercase",
              px: 3,
              py: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#c60078",
                backgroundColor: "#fff0f7",
              },
            }}
          >
            Upload LDAP Config
          </Button>

          <Button
            onClick={handleNewGroup}
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
                background: "linear-gradient(135deg, #c60078, #ff478a)",
                boxShadow: "0 6px 12px rgba(236, 0, 140, 0.5)",
              },
            }}
          >
            New Group
          </Button>
        </Box>
      </Box>

      {/* Table Section */}
      <Paper elevation={2} sx={{ borderRadius: "12px", p: 2, height: 800, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                  { label: "# of Members", field: "members" },
                  { label: "Modified Date", field: null },
                  { label: "Actions", field: null },
                ].map(({ label, field }) => (
                  <TableCell
                    key={label}
                    sx={{
                      backgroundColor: "#ffe0ef",
                      color: "#ec008c",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      cursor: field ? "pointer" : "default",
                    }}
                  >
                    {field ? renderSortLabel(field, label) : label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((group, idx) => (
                  <TableRow key={idx} hover sx={{ height: 56 }}>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.targets?.length || 0}</TableCell>
                    <TableCell>{new Date(group.modified_date).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="secondary" onClick={() => handleEditGroup(group)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setGroupToDelete(group);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No groups found
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

      {/* Modal */}
      <NewGroupModal
        open={openModal}
        handleClose={handleCloseModal}
        mode={modalMode}
        groupData={selectedGroup}
        onSave={() => {
          fetchGroups(); // Refresh list on save
          handleCloseModal();
        }}
      />
    </Box>
  );
};

export default UsersGroups;
