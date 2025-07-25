import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  TablePagination,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useTheme } from "../../context/ThemeContext";

import CampaignTimeline from "./CampaignTimeline"; // Import the new timeline component

const headCells = [
  { id: "first_name", label: "First Name" },
  { id: "last_name", label: "Last Name" },
  { id: "email", label: "Email" },
  { id: "position", label: "Position" },
  { id: "status", label: "Status" },
  { id: "reported", label: "Reported" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Submitted Data":
      return "#dc3545"; // Red
    case "Clicked Link":
      return "#fd7e14"; // Orange
    case "Email Sent":
    case "Scheduled":
      return "#10b981"; // Green
    default:
      return "#6c757d"; // Gray
  }
};

const CampaignTable = ({
  results,
  page,
  rowsPerPage,
  order,
  orderBy,
  handleRequestSort,
  handleChangePage,
  expandedRows,
  setExpandedRows,
  detailsExpanded,
  setDetailsExpanded,
  campaignTimeline, // Prop for the overall timeline
}) => {
  const handleToggleExpand = (email) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(email)) {
      newExpandedRows.delete(email);
    } else {
      newExpandedRows.add(email);
    }
    setExpandedRows(newExpandedRows);
  };

  const displayedResults = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const { darkMode } = useTheme();

  return (
    <Box sx={{ border: "1px solid #ddd", borderRadius: 1, overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          borderBottom: "1px solid #ddd",
          minHeight: "50px",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "40px", textAlign: "center", borderRight: "1px solid #ddd" }}>
          <IconButton size="small" disabled>
            <KeyboardArrowRightIcon style={{ color: darkMode ? '#fff' : '#000' }} />
          </IconButton>
        </Box>

        {headCells.map((headCell, index) => (
          <Box
            key={headCell.id}
            sx={{
              flex: 1,
              px: 2,
              py: 1,
              borderRight: index < headCells.length - 1 ? "1px solid #ddd" : "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "0.875rem",
            }}
            onClick={() => handleRequestSort(headCell.id)}
          >
            {headCell.label}
            {orderBy === headCell.id && (
              <Box sx={{ ml: 1, fontSize: "0.75rem" }}>
                {order === "asc" ? "▲" : "▼"}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Rows */}
      {displayedResults.length > 0 ? (
        displayedResults.map((row, rowIndex) => (
          <React.Fragment key={row.email}>
            {/* Main Row */}
            <Box
              sx={{
                display: "flex",
                borderBottom: "1px solid #ddd",
                minHeight: "50px",
                alignItems: "center",
              }}
            >
              <Box sx={{ width: "40px", textAlign: "center", borderRight: "1px solid #ddd" }}>
                <IconButton size="small" onClick={() => handleToggleExpand(row.email)}>
                  {expandedRows.has(row.email) ? <KeyboardArrowDownIcon style={{ color: darkMode ? '#fff' : '#000' }} /> : <KeyboardArrowRightIcon style={{ color: darkMode ? '#fff' : '#000' }} />}
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, px: 2, borderRight: "1px solid #ddd", textAlign: "center" }}>
                {row.first_name}
              </Box>
              <Box sx={{ flex: 1, px: 2, borderRight: "1px solid #ddd", textAlign: "center" }}>
                {row.last_name}
              </Box>
              <Box sx={{ flex: 1, px: 2, borderRight: "1px solid #ddd", textAlign: "center" }}>
                {row.email}
              </Box>
              <Box sx={{ flex: 1, px: 2, borderRight: "1px solid #ddd", textAlign: "center" }}>
                {row.position || "—"}
              </Box>
              <Box sx={{ flex: 1, px: 2, borderRight: "1px solid #ddd", textAlign: "center" }}>
                <Box
                  sx={{
                    backgroundColor: getStatusColor(row.status),
                    color: "#fff",
                    fontWeight: "bold",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                    minWidth: "100px",
                    fontSize: "12px",
                  }}
                >
                  {row.status}
                </Box>
              </Box>
              <Box sx={{ flex: 1, px: 2, textAlign: "center" }}>
                {row.reported ? (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: "#28a745",
                      color: "#fff",
                    }}
                  >
                    <CheckIcon sx={{ fontSize: "1rem" }} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: "#e0e0e0",
                      color: "#6c757d",
                    }}
                  >
                    <CloseIcon sx={{ fontSize: "1rem" }} />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Expanded Row - CampaignTimeline component */}
            <Collapse in={expandedRows.has(row.email)} timeout="auto" unmountOnExit>
              <Box
                sx={{
                  borderBottom: "1px solid #ddd",
                  p: 3,
                }}
              >
                <CampaignTimeline
                  email={row.email}
                  firstName={row.first_name}
                  lastName={row.last_name}
                  resultId={row.id}
                  reported={row.reported}
                  timeline={campaignTimeline} // Pass the full timeline to filter
                  detailsExpanded={detailsExpanded}
                  setDetailsExpanded={setDetailsExpanded}
                />
              </Box>
            </Collapse>
          </React.Fragment>
        ))
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "#6c757d",
            borderBottom: "1px solid #ddd",
          }}
        >
          No results yet.
        </Box>
      )}

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="body2" sx={{ color: darkMode ? '#fff' : '#000' , }}>
          Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, results.length)} of {results.length} entries
        </Typography>

        <TablePagination
          component="div"
          count={results.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          showFirstButton
          showLastButton
          sx={{
            '& .MuiTablePagination-toolbar': {
              minHeight: '40px',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              display: 'none',
            },
            '& .MuiTablePagination-actions svg': {
              color: darkMode ? '#fff' : 'inherit',
            },
          }}
        />

      </Box>
    </Box>
  );
};

export default CampaignTable;