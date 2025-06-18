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
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import NewClientModal from "../components/NewClientModal";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClientIndex, setEditingClientIndex] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/clients");
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        setClients([]);
      }
    };

    fetchClients();
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

  const filtered = Array.isArray(clients)
    ? clients.filter((client) =>
        client.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    return sortDirection === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const pageCount = Math.ceil(sorted.length / entriesPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleOpenModal = () => {
    setFormData({ name: "" });
    setIsEditMode(false);
    setEditingClientIndex(null);
    setModalOpen(true);
  };

  const handleEditClient = (client, indexOnPage) => {
    const actualIndex = (currentPage - 1) * entriesPerPage + indexOnPage;
    setFormData({ name: client.name });
    setIsEditMode(true);
    setEditingClientIndex(actualIndex);
    setModalOpen(true);
  };

  const handleSaveClient = () => {
    if (isEditMode && editingClientIndex !== null) {
      setClients((prev) => {
        const updated = [...prev];
        updated[editingClientIndex] = formData;
        return updated;
      });
    } else {
      setClients((prev) => [...prev, formData]);
    }

    setModalOpen(false);
    setFormData({ name: "" });
    setIsEditMode(false);
    setEditingClientIndex(null);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#343a40">
          🧑‍💼 Clients
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
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
          Add Client
        </Button>
      </Box>

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
            placeholder="🔍 Search clients..."
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
                {[{ label: "Client Name", field: "name" }, { label: "Actions", field: null }].map(
                  ({ label, field }) => (
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
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((client, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleEditClient(client, idx)}
                        >
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
                  <TableCell colSpan={2} align="center">
                    No client data available.
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

      <NewClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveClient}
        formData={formData}
        setFormData={setFormData}
        isEditMode={isEditMode}
      />
    </Box>
  );
};

export default Clients;
