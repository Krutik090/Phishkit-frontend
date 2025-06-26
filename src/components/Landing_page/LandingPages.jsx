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
  Typography,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LanguageIcon from "@mui/icons-material/Language";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NewLandingPageModal from "./NewLandingPageModal";
import { toast } from "react-toastify";


const LandingPages = () => {
  const [landingPages, setLandingPages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/landing-pages");
      if (!response.ok) throw new Error("Failed to fetch landing pages");
      const data = await response.json();
      setLandingPages(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  const handleDelete = async (page) => {
  const confirmDelete = window.confirm(`Are you sure you want to delete "${page.name}"?`);
  if (!confirmDelete) {
    toast.info("⚠️ Deletion cancelled.");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/landing-pages/${page.id}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("Delete failed");

    setLandingPages((prev) => prev.filter((p) => p.id !== page.id));
    toast.success(`🗑️ "${page.name}" deleted successfully.`);
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete landing page.");
  }
};


  const handleSaveNewPage = async (pageData, mode) => {
    try {
      if (mode === "edit") {
        // PUT request for edit
        const res = await fetch(
          `http://localhost:5000/api/landing-pages/${pageData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pageData),
          }
        );
        if (!res.ok) throw new Error("Failed to update landing page");
        const updatedPage = await res.json();
        setLandingPages((prev) =>
          prev.map((p) => (p.id === updatedPage.id ? updatedPage : p))
        );
      } else {
        // POST request for create
        const res = await fetch("http://localhost:5000/api/landing-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageData),
        });
        if (!res.ok) throw new Error("Failed to create landing page");
        const savedPage = await res.json();
        setLandingPages((prev) => [...prev, savedPage]);
      }

      setIsModalOpen(false);
      setEditingPage(null);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save landing page.");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredPages = landingPages
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const aComp = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
      const bComp = typeof bVal === "string" ? bVal.toLowerCase() : bVal;
      if (aComp < bComp) return sortOrder === "asc" ? -1 : 1;
      if (aComp > bComp) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const pageCount = Math.ceil(filteredPages.length / entriesPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const renderSortLabel = (field, label) => (
    <Box
      display="flex"
      alignItems="center"
      sx={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field &&
        (sortOrder === "asc" ? (
          <ArrowDropUpIcon fontSize="small" />
        ) : (
          <ArrowDropDownIcon fontSize="small" />
        ))}
    </Box>
  );

  return (
    <Box p={3}>
      {/* Title and Add Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#343a40"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <LanguageIcon color="primary" />
          Landing Pages
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setIsModalOpen(true);
            setEditingPage(null); // reset edit mode
          }}
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
          New Landing Page
        </Button>
      </Box>

      {/* Main Table Container */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          p: 2,
          height: 800,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Filters */}
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
            variant="standard"
            placeholder="🔍 Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            sx={{ width: 300 }}
          />
        </Box>

        {/* Table */}
        <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ backgroundColor: "#ffe0ef", color: "#ec008c", fontWeight: "bold" }}
                >
                  {renderSortLabel("name", "Name")}
                </TableCell>
                <TableCell
                  sx={{ backgroundColor: "#ffe0ef", color: "#ec008c", fontWeight: "bold" }}
                >
                  {renderSortLabel("capture_credentials", "Capture Credential")}
                </TableCell>
                <TableCell
                  sx={{ backgroundColor: "#ffe0ef", color: "#ec008c", fontWeight: "bold" }}
                >
                  {renderSortLabel("redirect_url", "Redirect URL")}
                </TableCell>
                <TableCell
                  sx={{ backgroundColor: "#ffe0ef", color: "#ec008c", fontWeight: "bold" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPages.length > 0 ? (
                paginatedPages.map((page) => (
                  <TableRow key={page.id} hover>
                    <TableCell>{page.name}</TableCell>
                    <TableCell>{page.capture_credentials ? "Yes" : "No"}</TableCell>
                    <TableCell>{page.redirect_url || "-"}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton color="secondary" onClick={() => handleEdit(page)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(page)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No landing pages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Footer */}
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="gray">
            Showing{" "}
            {Math.min(filteredPages.length, (currentPage - 1) * entriesPerPage + 1)} to{" "}
            {Math.min(currentPage * entriesPerPage, filteredPages.length)} of{" "}
            {filteredPages.length} entries
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
      <NewLandingPageModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPage(null);
        }}
        onSave={handleSaveNewPage}
        pageToEdit={editingPage}  // pass editing page here
      />
    </Box>
  );
};

export default LandingPages;