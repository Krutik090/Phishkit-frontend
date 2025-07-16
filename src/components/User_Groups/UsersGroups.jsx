import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import NewGroupModal from "./NewGroupModal";
import LdapConfigDialog from "../LDAP/Ldap";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const UsersGroups = () => {
  const tableRef = useRef();
  const dataTable = useRef(null);
  const [groups, setGroups] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [ldapDialogOpen, setLdapDialogOpen] = useState(false);

  const initializeDataTable = () => {
    if (dataTable.current) {
      dataTable.current.destroy();
    }

    if (groups.length > 0) {
      dataTable.current = $(tableRef.current).DataTable({
        destroy: true,
        responsive: true,
        pageLength: 10,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
      });
    }
  };

  const reloadDataTable = () => {
    if (dataTable.current) {
      dataTable.current.clear();
      dataTable.current.rows.add($(tableRef.current).find('tbody tr'));
      dataTable.current.draw();
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/groups`, {
        credentials: "include",
      });
      const data = await res.json();
      setGroups(data);

      // Reload DataTable after fetching new data
      setTimeout(() => {
        if (dataTable.current) {
          reloadDataTable();
        }
      }, 100);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && !dataTable.current) {
      initializeDataTable();
    }
  }, [groups]);

const handleDeleteGroup = async () => {
  if (!groupToDelete) return;

  try {
    console.log("Deleting group:", groupToDelete._id || groupToDelete.id);

    const res = await fetch(`${API_BASE_URL}/groups/${groupToDelete._id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete group");
    }

    toast.success("Group deleted successfully!");

    setGroups((prev) =>
      prev.filter((g) => g._id !== groupToDelete._id)
    );

    setTimeout(() => {
      if (dataTable.current) {
        reloadDataTable();
      }
    }, 100);

    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  } catch (err) {
    console.error("Failed to delete group:", err);
    toast.error(err.message || "Failed to delete group. Please try again.");
  }
};

  const handleNewGroup = () => {
    setSelectedGroup(null);
    setModalMode("create");
    setOpenModal(true);
  };

  const handleEditGroup = (group) => {
    const normalizedGroup = {
      ...group,
      id: group.id || group._id, // 👈 ensures id is present
    };
    setSelectedGroup(normalizedGroup);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleSaveSuccess = () => {
    // Fetch fresh data and reload DataTable
    fetchGroups();
    setOpenModal(false);
  };

  // Cleanup DataTable on component unmount
  useEffect(() => {
    return () => {
      if (dataTable.current) {
        dataTable.current.destroy();
      }
    };
  }, []);

  return (
    <Box p={3}>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the group <strong>{groupToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteGroup} color="error" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* LDAP Config Dialog */}
      <LdapConfigDialog open={ldapDialogOpen} onClose={() => setLdapDialogOpen(false)} />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          👥 Users & Groups
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={() => setLdapDialogOpen(true)}
            sx={{
              background: `linear-gradient(135deg, ${localStorage.getItem('primaryColor')}, ${localStorage.getItem('secondaryColor')})`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              px: 3,
              py: 1,
              boxShadow: "0 4px 10px rgba(236, 0, 140, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #d6007a, #ff478a)",
              },
            }}>
            Upload LDAP Config
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewGroup}
            sx={{
              background: `linear-gradient(135deg, ${localStorage.getItem('primaryColor')}, ${localStorage.getItem('secondaryColor')})`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              px: 3,
              py: 1,
              boxShadow: "0 4px 10px rgba(236, 0, 140, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #d6007a, #ff478a)",
              },
            }}
          >
            New Group
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="display stripe"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr>
              {["Name", "# of Members", "Modified Date", "Actions"].map((h, i) => (
                <th key={i} style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>{group.name}</td>
                <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>
                  {group.targets?.length || 0}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>
                  {new Date(group.modified_date).toLocaleString()}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center", verticalAlign: "middle" }}>
                  <Tooltip title="Edit">
                    <IconButton color="secondary" size="small" onClick={() => handleEditGroup(group)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
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
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <NewGroupModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        mode={modalMode}
        groupData={selectedGroup}
        onSave={handleSaveSuccess}
      />
    </Box>
  );
};

export default UsersGroups;