import React, { useEffect, useState } from "react";
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, IconButton, Tooltip, Pagination,
  FormControl, Select, MenuItem, InputLabel, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import {
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  UploadFile as UploadFileIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import NewClientModal from "./NewClientModal";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const FILE_BASE_URL = API_BASE_URL.replace("/api", "");

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", certificateFile: null });

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

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
    <Box display="flex" alignItems="center" sx={{ cursor: "pointer" }} onClick={() => handleSort(field)}>
      {label} {getSortIcon(field)}
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
      ? valA.toString().localeCompare(valB.toString())
      : valB.toString().localeCompare(valA.toString());
  });

  const pageCount = Math.ceil(sorted.length / entriesPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

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
      <Box display="flex" justifyContent="space-between" mb={3}>
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
            px: 3,
            py: 1,
            textTransform: "uppercase",
          }}
        >
          Add Client
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

        <TableContainer sx={{ flex: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {[
                  { label: "Client Name", field: "name" },
                  { label: "Campaigns", field: "campaigns" },
                  { label: "Sent", field: "emailSent" },
                  { label: "Failed", field: "emailFailed" },
                  { label: "Opened", field: "emailOpened" },
                  { label: "Clicked", field: "linkClicked" },
                  { label: "Submitted Data", field: "submitted_data" },
                  { label: "Quiz Started", field: "quizStarted" },
                  { label: "Quiz Completed", field: "quizCompleted" },
                  { label: "Created At", field: "createdAt" },
                  { label: "Certificate", field: "certificateTemplatePath" },
                  { label: "Upload", field: null },
                ].map(({ label, field }) => (
                  <TableCell
                    key={label}
                    sx={{
                      backgroundColor: "#ffe0ef",
                      color: "#ec008c",
                      fontWeight: "bold",
                      cursor: field ? "pointer" : "default",
                    }}
                  >
                    {field ? renderSortLabel(label, field) : label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((client, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Link to={`/clients/${client._id}`} style={{ color: "#ec008c", fontWeight: "bold", textDecoration: "none" }}
                        onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{Array.isArray(client.campaigns) && client.campaigns.length > 0 ? client.campaigns.join(", ") : "—"}</TableCell>
                    <TableCell>{client.emailSent ?? 0}</TableCell>
                    <TableCell>{client.emailFailed ?? 0}</TableCell>
                    <TableCell>{client.emailOpened ?? 0}</TableCell>
                    <TableCell>{client.linkClicked ?? 0}</TableCell>
                    <TableCell>{client.submitted_data ?? 0}</TableCell>
                    <TableCell>{client.quizStarted ?? 0}</TableCell>
                    <TableCell>{client.quizCompleted ?? 0}</TableCell>
                    <TableCell>{new Date(client.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {client.certificateTemplatePath ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography color="green">Uploaded</Typography>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => handlePreview(client.certificateTemplatePath)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Upload Certificate">
                        <IconButton size="small" component="label">
                          <UploadFileIcon />
                          <input hidden type="file" accept=".ppt,.pptx,.pdf"
                            onChange={(e) => handleUploadCertificate(client._id, e.target.files[0])}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No client data available.
                  </TableCell>
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
