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
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // Add this at the top

const Quiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error("Failed to fetch quizzes:", err));
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

  const filtered = quizzes.filter((quiz) =>
    quiz.name?.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold" color="#343a40">
          🧠 Quiz & Training
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/quiz-training/new")} // Navigate on click
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
          New Quiz
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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
                  { label: "Quiz Title", field: "name" },
                  { label: "Description", field: "description" },
                  { label: "Question", field: "question" },
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
                paginated.map((quiz, idx) => (
                  <TableRow key={idx} hover sx={{ height: 56 }}>
                    <TableCell>{quiz.name}</TableCell>
                    <TableCell>{quiz.description}</TableCell>
                    <TableCell>{quiz.question}</TableCell>
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
                  <TableCell colSpan={4} align="center">
                    No quizzes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="gray">
            Showing{" "}
            {Math.min(sorted.length, (currentPage - 1) * entriesPerPage + 1)} to{" "}
            {Math.min(currentPage * entriesPerPage, sorted.length)} of{" "}
            {sorted.length} entries
          </Typography>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Quiz;
