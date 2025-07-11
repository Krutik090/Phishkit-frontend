import React, { useEffect, useState, useRef } from "react";
import {
  Box, Button, Typography, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import NewClientModal from "./NewClientModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", certificateFile: null });

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const tableRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      const table = $(tableRef.current).DataTable();
      return () => {
        table.destroy(); // Cleanup
      };
    }
  }, [clients]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`);
      const clients = await response.json();

      await Promise.all(
        clients.map(async (client) => {
          try {
            const syncRes = await fetch(`${API_BASE_URL}/clients/sync-stats/${client._id}`, {
              method: "POST"
            });
            if (!syncRes.ok) {
              console.warn(`Failed to sync stats for client ${client.name}`);
            }
          } catch (syncErr) {
            console.error(`Error syncing client ${client.name}:`, syncErr);
          }
        })
      );

      const refreshed = await fetch(`${API_BASE_URL}/clients`);
      const updatedClients = await refreshed.json();
      setClients(updatedClients);

    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClients([]);
    }
  };

  const handleOpenModal = () => {
    setFormData({ name: "", certificateFile: null });
    setModalOpen(true);
  };

  const handleUploadCertificate = async (clientId, file) => {
    const formData = new FormData();
    formData.append("certificate", file);

    try {
      await fetch(`${API_BASE_URL}/clients/${clientId}/upload-template`, {
        method: "POST",
        body: formData,
      });
      fetchClients();
      toast.success('Template Saved Successfully.');
    } catch (error) {
      console.error("Failed to upload certificate:", error);
      toast.error('Failed to upload Certificate Template');
    }
  };

  const handlePreview = (path) => {
    const url = `${FILE_BASE_URL}/${path}`;
    setPreviewUrl(url);
    setPreviewDialogOpen(true);
  };

  return (
    <Box p={3}>
      <Box>

        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            📁 Projects
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{
              background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
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
                "Project Name", "Campaigns", "Sent", "Failed", "Opened", "Clicked",
                "Submitted Data", "Quiz Started", "Quiz Completed", "Created At",
                "Certificate", "Upload"
              ].map((header, idx) => (
                <th key={idx} style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <Link to={`/clients/${client._id}`} style={{ color: "#ec008c", fontWeight: "bold", textDecoration: "none" }}>
                    {client.name}
                  </Link>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{Array.isArray(client.campaigns) ? client.campaigns.join(", ") : "—"}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{client.emailSent ?? 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{client.emailFailed ?? 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{client.emailOpened ?? 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{client.linkClicked ?? 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{client.submitted_data ?? 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{client.quizStarted ?? 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{client.quizCompleted ?? 0}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{new Date(client.createdAt).toLocaleString()}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {client.certificateTemplatePath ? (
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <Typography color="green">Uploaded</Typography>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handlePreview(client.certificateTemplatePath)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : "N/A"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <Tooltip title="Upload Certificate">
                    <IconButton size="small" component="label">
                      <UploadFileIcon />
                      <input
                        hidden
                        type="file"
                        accept=".ppt,.pptx,.pdf"
                        onChange={(e) => handleUploadCertificate(client._id, e.target.files[0])}
                      />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <NewClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        refreshClients={fetchClients}
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
              </a>
              .
            </Typography>
          ) : (
            <Typography color="error">Unsupported file format.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Clients;
