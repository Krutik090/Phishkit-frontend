import React, { useEffect, useState } from "react";
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, IconButton, Tooltip, Pagination,
  FormControl, Select, MenuItem, InputLabel, Link as MuiLink, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  ArrowDropUp as ArrowDropUpIcon, ArrowDropDown as ArrowDropDownIcon,
  UploadFile as UploadFileIcon, Visibility as VisibilityIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Quiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadingQuizId, setUploadingQuizId] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes`);
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      toast.error("Failed to load quizzes.");
    }
  };

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
    <Box display="flex" alignItems="center" sx={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort(field)}>
      {label} {getSortIcon(field)}
    </Box>
  );

  const handlePosterUpload = async (e, quizId) => {
    const file = e.target.files[0];
    if (!file || !quizId) return;

    setUploadingQuizId(quizId);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch(`${API_BASE_URL}/quizzes/${quizId}/poster`, {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      if (data?.posterPathUrl) {
        await loadQuizzes();
        toast.success("Poster uploaded successfully!");
      } else {
        toast.error("Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading poster:", err);
      toast.error("Upload error occurred.");
    } finally {
      setUploadingQuizId(null);
    }
  };

  const handlePreview = (path) => {
    const url = `${FILE_BASE_URL}/${path}`;
    setPreviewUrl(url);
    setPreviewDialogOpen(true);
  };

  const filtered = quizzes.filter((quiz) =>
    quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = (a[sortField] || "").toString().toLowerCase();
    const valB = (b[sortField] || "").toString().toLowerCase();
    return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const pageCount = Math.ceil(sorted.length / entriesPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#343a40">
          🧠 Quiz & Training
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/quiz-training/new")}
          sx={{
            background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
            color: "#fff", fontWeight: "bold", borderRadius: "8px",
            textTransform: "uppercase", px: 3, py: 1,
          }}
        >
          New Quiz
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: "12px", p: 2, height: 800, display: "flex", flexDirection: "column" }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
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
                <MenuItem key={count} value={count}>{count}</MenuItem>
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
                  { label: "Quiz Title", field: "title" },
                  { label: "Description", field: "description" },
                  { label: "Questions", field: null },
                  { label: "Public URL", field: null },
                  { label: "Poster", field: null },
                  { label: "Actions", field: null },
                ].map(({ label, field }) => (
                  <TableCell
                    key={label}
                    sx={{
                      backgroundColor: "#ffe0ef", color: "#ec008c", fontWeight: "bold",
                      whiteSpace: "nowrap", cursor: field ? "pointer" : "default",
                    }}
                  >
                    {field ? renderSortLabel(label, field) : label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((quiz) => (
                  <TableRow key={quiz._id} hover>
                    <TableCell>{quiz.title}</TableCell>
                    <TableCell>{quiz.description}</TableCell>
                    <TableCell>{quiz.questions?.length || 0}</TableCell>
                    <TableCell>
                      {quiz.publicUrl ? (
                        <MuiLink
                          href={`/quiz/${quiz.publicUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          color="primary"
                        >
                          Open Link
                        </MuiLink>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {quiz.posterPathUrl ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography color="green">Uploaded</Typography>
                          <Tooltip title="Preview">
                            <IconButton size="small" onClick={() => handlePreview(quiz.posterPathUrl)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept=".pdf"
                            style={{ display: "none" }}
                            id={`upload-poster-${quiz._id}`}
                            onChange={(e) => handlePosterUpload(e, quiz._id)}
                          />
                          <label htmlFor={`upload-poster-${quiz._id}`}>
                            <Button
                              component="span"
                              variant="outlined"
                              size="small"
                              color="secondary"
                              startIcon={<UploadFileIcon />}
                              disabled={uploadingQuizId === quiz._id}
                            >
                              Upload PDF
                            </Button>
                          </label>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="secondary" onClick={() => navigate(`/quiz-training/edit/${quiz._id}`)}>
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
                  <TableCell colSpan={6} align="center">No quizzes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2} display="flex" justifyContent="space-between">
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

      {/* PDF Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>📄 Poster Preview</DialogTitle>
        <DialogContent dividers>
          {previewUrl?.toLowerCase().endsWith(".pdf") ? (
            <iframe src={previewUrl} title="PDF Preview" width="100%" height="600px" style={{ border: "none" }} />
          ) : (
            <Typography color="error">Invalid or unsupported file format.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Quiz;
