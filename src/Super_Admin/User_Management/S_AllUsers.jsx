// import React, { useEffect, useRef, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   IconButton,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Select,
//   MenuItem,
//   FormControl,
// } from "@mui/material";
// import {
//   Delete as DeleteIcon,
//   Edit as EditIcon,
// } from "@mui/icons-material";
// import $ from "jquery";
// import "datatables.net";
// import "datatables.net-dt/css/dataTables.dataTables.min.css";

// import NewUserModel from "./NewUserModel";

// const API_BASE_URL = import.meta.env.VITE_API_URL;

// // Dummy data for development
// const DUMMY_USERS = [
//   {
//     id: 1,
//     name: "John Doe",
//     email: "john.doe@example.com",
//     role: "User",
//     permission: "Launch"
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     email: "jane.smith@company.com",
//     role: "Maintenance User",
//     permission: "Read Only"
//   }
// ];

// const S_AllUsers = () => {
//   const [users, setUsers] = useState(DUMMY_USERS); // Initialize with dummy data
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

//   const tableRef = useRef(null);
//   const dataTable = useRef(null);

//   useEffect(() => {
//     // Comment out fetchUsers() to use dummy data
//     // fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (dataTable.current) {
//       dataTable.current.destroy();
//     }

//     if (users.length > 0 && tableRef.current) {
//       dataTable.current = $(tableRef.current).DataTable({
//         pageLength: 10,
//         searching: true,
//         ordering: true,
//         lengthChange: true,
//         destroy: true,
//         columnDefs: [
//           { targets: [2, 3, 4], orderable: false }, // Disable sorting for Role, Permission, and Actions columns
//         ],
//       });
//     }
//   }, [users]);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/users`);
//       const data = await res.json();
//       setUsers(data);
//     } catch (err) {
//       console.error("Failed to fetch users:", err);
//       // Fallback to dummy data if API fails
//       setUsers(DUMMY_USERS);
//     }
//   };

//   const handleOpenModal = () => {
//     setSelectedUser(null);
//     setIsModalOpen(true);
//   };

//   const handleEditUser = (user) => {
//     setSelectedUser(user);
//     setIsModalOpen(true);
//   };

//   const handleSaveSuccess = () => {
//     fetchUsers();
//     setIsModalOpen(false);
//     setSelectedUser(null);
//   };

//   const confirmDelete = async () => {
//     try {
//       const id = deleteDialog.user.id;
//       const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) throw new Error();
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//     } catch (err) {
//       console.error("Failed to delete user:", err);
//       // For dummy data, still remove from local state
//       const id = deleteDialog.user.id;
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//     } finally {
//       setDeleteDialog({ open: false, user: null });
//     }
//   };

//   const handleRoleChange = async (userId, newRole) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ role: newRole }),
//       });

//       if (!res.ok) throw new Error();

//       // Update local state
//       setUsers((prev) =>
//         prev.map((user) =>
//           user.id === userId ? { ...user, role: newRole } : user
//         )
//       );
//     } catch (err) {
//       console.error("Failed to update role:", err);
//       // For dummy data, still update local state
//       setUsers((prev) =>
//         prev.map((user) =>
//           user.id === userId ? { ...user, role: newRole } : user
//         )
//       );
//     }
//   };

//   const handlePermissionChange = async (userId, newPermission) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/permission`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ permission: newPermission }),
//       });

//       if (!res.ok) throw new Error();

//       // Update local state
//       setUsers((prev) =>
//         prev.map((user) =>
//           user.id === userId ? { ...user, permission: newPermission } : user
//         )
//       );
//     } catch (err) {
//       console.error("Failed to update permission:", err);
//       // For dummy data, still update local state
//       setUsers((prev) =>
//         prev.map((user) =>
//           user.id === userId ? { ...user, permission: newPermission } : user
//         )
//       );
//     }
//   };

//   return (
//     <Box p={3}>
//       <Box display="flex" justifyContent="space-between" mb={3}>
//         <Typography variant="h5" fontWeight="bold">
//           🧑‍💻 Clients
//         </Typography>
//         <Button
//           variant="contained"
//           onClick={handleOpenModal}
//           sx={{
//             background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
//             color: "#fff",
//             fontWeight: "bold",
//             borderRadius: "8px",
//             px: 3,
//             py: 1,
//             textTransform: "uppercase",
//           }}
//         >
//           Add User
//         </Button>
//       </Box>

//       <table
//         ref={tableRef}
//         className="display stripe"
//         style={{
//           width: "100%",
//           textAlign: "center",
//           borderCollapse: "collapse",
//           border: "1px solid #ddd",
//         }}
//       >
//         <thead>
//           <tr>
//             <th style={{ border: "1px solid #ccc", padding: 10 }}>Name</th>
//             <th style={{ border: "1px solid #ccc", padding: 10 }}>Email</th>
//             <th style={{ border: "1px solid #ccc", padding: 10 }}>Role</th>
//             <th style={{ border: "1px solid #ccc", padding: 10 }}>Permission</th>
//             <th style={{ border: "1px solid #ccc", padding: 10 }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user) => (
//             <tr key={user.id}>
//               <td style={{ border: "1px solid #ddd", padding: 8 }}>{user.name}</td>
//               <td style={{ border: "1px solid #ddd", padding: 8 }}>{user.email}</td>
//               <td style={{ border: "1px solid #ddd", padding: 0 }}>
//                 <FormControl size="small" sx={{ width: "100%", minWidth: 120 }}>
//                   <Select
//                     value={user.role || "User"}
//                     onChange={(e) => handleRoleChange(user.id, e.target.value)}
//                     sx={{
//                       "& .MuiSelect-select": {
//                         padding: "8px 12px",
//                         fontSize: "14px",
//                         border: "none",
//                         borderRadius: 0,
//                       },
//                       "& .MuiOutlinedInput-notchedOutline": {
//                         border: "none",
//                       },
//                       "&:hover .MuiOutlinedInput-notchedOutline": {
//                         border: "none",
//                       },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                         border: "none",
//                       },
//                       height: "100%",
//                       minHeight: "40px",
//                     }}
//                     MenuProps={{
//                       PaperProps: {
//                         sx: {
//                           "& .MuiMenuItem-root.Mui-selected.user-role": {
//                             backgroundColor: "#fce4f6",
//                             color: "#ec008c",
//                             fontWeight: "bold",
//                           },
//                           "& .MuiMenuItem-root.Mui-selected.maint-role": {
//                             backgroundColor: "#fce4f6",
//                             color: "#ec008c",
//                             fontWeight: "bold",
//                           },
//                           "& .MuiMenuItem-root.Mui-selected": {
//                             backgroundColor: "#fce4f6",
//                           },
//                         },
//                       },
//                     }}
//                   >
//                     <MenuItem value="User" className="user-role">User</MenuItem>
//                     <MenuItem value="Maintenance User" className="maint-role">Maintenance User</MenuItem>
//                   </Select>
//                 </FormControl>
//               </td>
//               <td style={{ border: "1px solid #ddd", padding: 0 }}>
//                 <FormControl size="small" sx={{ width: "100%", minWidth: 120 }}>
//                   <Select
//                     value={user.permission || "Read Only"}
//                     onChange={(e) => handlePermissionChange(user.id, e.target.value)}
//                     sx={{
//                       "& .MuiSelect-select": {
//                         padding: "8px 12px",
//                         fontSize: "14px",
//                         border: "none",
//                         borderRadius: 0,
//                       },
//                       "& .MuiOutlinedInput-notchedOutline": {
//                         border: "none",
//                       },
//                       "&:hover .MuiOutlinedInput-notchedOutline": {
//                         border: "none",
//                       },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                         border: "none",
//                       },
//                       height: "100%",
//                       minHeight: "40px",
//                     }}
//                     MenuProps={{
//                       PaperProps: {
//                         sx: {
//                           "& .MuiMenuItem-root.Mui-selected.permission-read": {
//                             backgroundColor: "#fce4f6",
//                             color: "#ec008c",
//                             fontWeight: "bold",
//                           },
//                           "& .MuiMenuItem-root.Mui-selected.permission-launch": {
//                             backgroundColor: "#fce4f6",
//                             color: "#ec008c",
//                             fontWeight: "bold",
//                           },
//                         },
//                       },
//                     }}
//                   >
//                     <MenuItem value="Launch" className="permission-launch">Launch</MenuItem>
//                     <MenuItem value="Read Only" className="permission-read">Read Only</MenuItem>
//                   </Select>
//                 </FormControl>


//               </td>
//               <td style={{ border: "1px solid #ddd", padding: 8 }}>
//                 <Tooltip title="Edit">
//                   <IconButton color="primary" onClick={() => handleEditUser(user)}>
//                     <EditIcon />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Delete">
//                   <IconButton
//                     color="error"
//                     onClick={() => setDeleteDialog({ open: true, user })}
//                   >
//                     <DeleteIcon />
//                   </IconButton>
//                 </Tooltip>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Modal for New/Edit */}
//       <NewUserModel
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSave={handleSaveSuccess}
//         user={selectedUser}
//       />

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteDialog.open}
//         onClose={() => setDeleteDialog({ open: false, user: null })}
//       >
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete{" "}
//             <strong>{deleteDialog.user?.name}</strong>?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
//             Cancel
//           </Button>
//           <Button onClick={confirmDelete} color="error">
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default S_AllUsers;



import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  Button,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

// Dummy data for development
const DUMMY_USERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "User",
    permission: "Launch",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Maintenance User",
    permission: "Read Only",
  },
];

const API_BASE_URL = import.meta.env.VITE_API_URL;

const S_AllUsers = () => {
  const [users, setUsers] = useState(DUMMY_USERS);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  const tableRef = useRef(null);
  const dataTable = useRef(null);

  useEffect(() => {
    // fetchUsers(); // Uncomment if API needed
  }, []);

  useEffect(() => {
    if (dataTable.current) {
      dataTable.current.destroy();
    }

    if (users.length > 0 && tableRef.current) {
      dataTable.current = $(tableRef.current).DataTable({
        pageLength: 10,
        searching: true,
        ordering: true,
        lengthChange: true,
        destroy: true,
        columnDefs: [
          { targets: [2, 3, 4], orderable: false },
        ],
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers(DUMMY_USERS);
    }
  };

  const confirmDelete = async () => {
    try {
      const id = deleteDialog.user.id;
      const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.user.id));
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
    }
  };

  const handlePermissionChange = async (userId, newPermission) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/permission`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission: newPermission }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, permission: newPermission } : user
        )
      );
    } catch (err) {
      console.error("Failed to update permission:", err);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, permission: newPermission } : user
        )
      );
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🧑‍💻 Clients
        </Typography>
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
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Role</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Permission</th>
            <th style={{ border: "1px solid #ccc", padding: 10 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{user.name}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{user.email}</td>
              <td style={{ border: "1px solid #ddd", padding: 0 }}>
                <FormControl size="small" sx={{ width: "100%", minWidth: 120 }}>
                  <Select
                    value={user.role || "User"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    sx={{
                      "& .MuiSelect-select": {
                        padding: "8px 12px",
                        fontSize: "14px",
                        border: "none",
                        borderRadius: 0,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      height: "100%",
                      minHeight: "40px",
                    }}
                  >
                    <MenuItem value="User" className="user-role">User</MenuItem>
                    <MenuItem value="Maintenance User" className="maint-role">Maintenance User</MenuItem>
                  </Select>
                </FormControl>
              </td>
              <td style={{ border: "1px solid #ddd", padding: 0 }}>
                <FormControl size="small" sx={{ width: "100%", minWidth: 120 }}>
                  <Select
                    value={user.permission || "Read Only"}
                    onChange={(e) => handlePermissionChange(user.id, e.target.value)}
                    sx={{
                      "& .MuiSelect-select": {
                        padding: "8px 12px",
                        fontSize: "14px",
                        border: "none",
                        borderRadius: 0,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      height: "100%",
                      minHeight: "40px",
                    }}
                  >
                    <MenuItem value="Launch" className="permission-launch">Launch</MenuItem>
                    <MenuItem value="Read Only" className="permission-read">Read Only</MenuItem>
                  </Select>
                </FormControl>
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                <Tooltip title="Edit">
                  <IconButton color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, user })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteDialog.user?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default S_AllUsers;
