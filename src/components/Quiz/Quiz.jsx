import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import {
  Box, Button, Typography, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent
} from "@mui/material";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  UploadFile as UploadFileIcon
} from "@mui/icons-material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Quiz = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const [quizzes, setQuizzes] = useState([]);
  const [uploadingQuizId, setUploadingQuizId] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const initializeDataTable = () => {
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
    }
    dataTableRef.current = $(tableRef.current).DataTable({
      destroy: true,
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      order: [[0, "asc"]],
      responsive: true,
      searching: true,
      ordering: true,
      info: true,
      autoWidth: false,
    });
  };

  const reloadDataTable = () => {
    if (dataTableRef.current) {
      dataTableRef.current.clear();
      dataTableRef.current.rows.add($(tableRef.current).find('tbody tr'));
      dataTableRef.current.draw();
    }
  };

  const loadQuizzes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/quizzes`, { withCredentials: true });
      const data = res.data;
      const updatedData = data.map((q) => ({
        ...q,
        posterPathUrl: q.posterPath ? `${FILE_BASE_URL}/${q.posterPath}` : null,
      }));
      setQuizzes(updatedData);

      // Initialize DataTable after loading quizzes
      setTimeout(() => {
        if (updatedData.length > 0) {
          if (!dataTableRef.current) {
            initializeDataTable();
          } else {
            reloadDataTable();
          }
        }
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quizzes.");
    }
  };


  // const handlePosterUpload = async (e, quizId) => {
  //   const file = e.target.files[0];
  //   if (!file || !quizId) return;

  //   setUploadingQuizId(quizId);
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("quizId", quizId);

  //   try {
  //     const uploadRes = await fetch(`${API_BASE_URL}/quizzes/poster`, {
  //       credentials: "include",
  //       method: "POST",
  //       body: formData,
  //     });
  //     const data = await uploadRes.json();

  //     if (uploadRes.ok && data?.posterPath) {
  //       toast.success("Poster uploaded successfully!");
  //       await loadQuizzes();
  //     } else {
  //       toast.error(data?.error || "Poster upload failed.");
  //     }
  //   } catch (err) {
  //     toast.error("Upload error occurred.");
  //   } finally {
  //     setUploadingQuizId(null);
  //   }
  // };

  // const handlePreview = (path) => {
  //   setPreviewUrl(`${FILE_BASE_URL}/${path}`);
  //   setPreviewDialogOpen(true);
  // };

  const handleOpenDeleteDialog = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/${quizToDelete._id}`, {
        credentials: "include",
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Quiz deleted successfully.");

        // Update state and reload DataTable
        setQuizzes((prev) => prev.filter((q) => q._id !== quizToDelete._id));

        // Reload DataTable after state update
        setTimeout(() => {
          if (dataTableRef.current) {
            reloadDataTable();
          }
        }, 100);

      } else {
        toast.error(data?.error || "Failed to delete quiz.");
      }
    } catch (err) {
      toast.error("Error deleting quiz.");
    } finally {
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  // Cleanup DataTable on component unmount
  useEffect(() => {
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }
    };
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🧠 Quiz
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/quizz/new")}
          sx={{
            background: `linear-gradient(135deg, ${localStorage.getItem('primaryColor')}, ${localStorage.getItem('secondaryColor')})`,
            color: "#fff", fontWeight: "bold", borderRadius: "8px",
            textTransform: "uppercase", px: 3, py: 1,
          }}
        >
          New Quiz
        </Button>
      </Box>

      <div className="table-responsive">
        <table className="display stripe" id="quizTable" ref={tableRef}
          style={{
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Quiz Title</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Description</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Questions</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Public URL</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Poster</th>
              <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz._id}>
                <td style={{ border: "1px solid #ccc", padding: 10 }}>{quiz.title}</td>
                <td style={{ border: "1px solid #ccc", padding: 10 }}>{quiz.description}</td>
                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>{quiz.questions?.length || 0}</td>
                <td style={{ border: "1px solid #ccc", padding: 10 }}>
                  {quiz.publicUrl ? (
                    <a href={`/quiz/${quiz.publicUrl}`} target="_blank" rel="noopener noreferrer">
                      Open Link
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>
                  <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
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
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {quiz.posterPathUrl ? "Update Poster" : "Upload PDF"}
                      </Button>
                    </label>
                    {quiz.posterPathUrl && (
                      <Tooltip title="View Poster">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => window.open(`${API_BASE_URL}/quizzes/${quiz._id}/poster`, "_blank")}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </td>

                <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="secondary" onClick={() => navigate(`/quizz/edit/${quiz._id}`)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(quiz)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete <strong>{quizToDelete?.title}</strong>?
          </Typography>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Quiz;