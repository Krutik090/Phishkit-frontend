import React, { useEffect, useState, useRef } from "react";
import {
  Box, Button, Typography, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import NewProjectModal from "./NewProjectModal";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_URL;
const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", certificateFile: null });
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      setTimeout(() => {
        dataTableRef.current = $(tableRef.current).DataTable({
          destroy: true,
          responsive: true,
          pageLength: 10,
          lengthChange: true,
          searching: true,
          ordering: true,
          info: true,
          autoWidth: false,
        });
      }, 100);
    }
  }, [projects]);

  useEffect(() => {
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, { credentials: "include" });
      const projects = await response.json();

      await Promise.all(
        projects.map(async (project) => {
          try {
            const syncRes = await fetch(`${API_BASE_URL}/projects/sync-stats/${project._id}`, {
              credentials: "include",
              method: "POST",
            });
            if (!syncRes.ok) {
              console.warn(`Failed to sync stats for project ${project.name}`);
            }
          } catch (syncErr) {
            console.error(`Error syncing project ${project.name}:`, syncErr);
          }
        })
      );

      const refreshed = await fetch(`${API_BASE_URL}/projects`, { credentials: "include" });
      const updatedProjects = await refreshed.json();

      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      setProjects(updatedProjects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
      toast.error("Failed to load projects");
    }
  };

  const handleOpenModal = () => {
    setFormData({ name: "", certificateFile: null });
    setModalOpen(true);
  };

  const handleUploadCertificate = async (projectId, file) => {
    const formData = new FormData();
    formData.append("certificate", file);

    try {
      await fetch(`${API_BASE_URL}/projects/${projectId}/upload-template`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });
      await fetchProjects();
      toast.success("Template Saved Successfully.");
    } catch (error) {
      console.error("Failed to upload certificate:", error);
      toast.error("Failed to upload Certificate Template");
    }
  };

  const handlePreview = (path) => {
    const url = `${FILE_BASE_URL}/${path}`;
    setPreviewUrl(url);
    setPreviewDialogOpen(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Project deleted successfully");
      await fetchProjects();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete project");
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  return (
  <Box p={3}>
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          📁 Projects
        </Typography>

        {(user?.role === "admin" || user?.role === "superadmin") && (
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{
              background: `linear-gradient(135deg, ${localStorage.getItem('primaryColor')}, ${localStorage.getItem('secondaryColor')})`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              px: 3,
              py: 1,
              textTransform: "uppercase",
            }}
          >
            Add Project
          </Button>
        )}
      </Box>

      <table
        ref={tableRef}
        className="display stripe"
        style={{
          width: "100%",
          textAlign: "center",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr>
            {[
              "Project Name", "Campaigns", "Sent", "Failed", "Clicked",
              "Submitted Data", "Quiz Started", "Quiz Completed", "Created At",
              "Certificate", ...(user?.role === "admin" || user?.role === "superadmin" ? ["Upload", "Action"] : [])
            ].map((header, idx) => (
              <th
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((project, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>
                <Link
                  to={`/projects/${project._id}`}
                  style={{
                    color: localStorage.getItem("primaryColor"),
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  {project.name}
                </Link>
              </td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>
                {Array.isArray(project.campaigns) ? project.campaigns.join(", ") : "—"}
              </td>
              <td style={{ border: "1px solid #ddd", textAlign: "center", verticalAlign: "middle", padding: "8px" }}>{project.emailSent ?? 0}</td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>{project.emailFailed ?? 0}</td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>{project.linkClicked ?? 0}</td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>{project.submitted_data ?? 0}</td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>{project.quizStarted ?? 0}</td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>{project.quizCompleted ?? 0}</td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>{new Date(project.createdAt).toLocaleString()}</td>
              <td style={{ border: "1px solid #ddd",textAlign: "center", verticalAlign: "middle", padding: "8px" }}>
                {project.certificateTemplatePath ? (
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Typography color="green">Uploaded</Typography>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => handlePreview(project.certificateTemplatePath)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : "N/A"}
              </td>

              {/* Only show upload and delete buttons to admin/superadmin */}
              {(user?.role === "admin" || user?.role === "superadmin") && (
                <>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <Tooltip title="Upload Certificate">
                      <IconButton size="small" component="label">
                        <UploadFileIcon />
                        <input
                          hidden
                          type="file"
                          accept=".ppt,.pptx,.pdf"
                          onChange={(e) => handleUploadCertificate(project._id, e.target.files[0])}
                        />
                      </IconButton>
                    </Tooltip>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <Tooltip title="Delete Project">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(project)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>

    {/* Modal and Dialogs – unchanged */}
    <NewProjectModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      formData={formData}
      setFormData={setFormData}
      refreshProjects={fetchProjects}
    />

    <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>📄 Certificate Template Preview</DialogTitle>
      <DialogContent dividers>
        {previewUrl?.toLowerCase().endsWith(".pdf") ? (
          <iframe src={previewUrl} title="PDF Preview" width="100%" height="600px" style={{ border: "none" }} />
        ) : previewUrl?.toLowerCase().endsWith(".ppt") || previewUrl?.toLowerCase().endsWith(".pptx") ? (
          <Typography>
            PowerPoint file preview is not supported.{" "}
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#ec008c" }}>
              Click here to download and view
            </a>.
          </Typography>
        ) : (
          <Typography color="error">Unsupported file format.</Typography>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
      <DialogTitle>🗑️ Delete Project</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteCancel} variant="outlined" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ textTransform: "none" }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);

};

export default Projects;