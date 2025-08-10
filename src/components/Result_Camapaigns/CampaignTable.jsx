import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Paper,
  alpha,
  Chip,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";
import CampaignTimeline from "./CampaignTimeline";

const CampaignTable = ({
  results,
  page,
  rowsPerPage,
  order,
  orderBy,
  handleRequestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  expandedRows,
  setExpandedRows,
  detailsExpanded,
  setDetailsExpanded,
  campaignTimeline,
}) => {
  const { darkMode } = useTheme();

  const headCells = [
    { id: "expand", label: "", sortable: false, width: 60 },
    { id: "first_name", label: "First Name", sortable: true },
    { id: "last_name", label: "Last Name", sortable: true },
    { id: "email", label: "Email", sortable: true },
    { id: "position", label: "Position", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "reported", label: "Reported", sortable: true, width: 100 },
  ];

  const getStatusChip = (status) => {
    const statusConfig = {
      "Submitted Data": { color: "#dc3545", label: "Submitted Data" },
      "Clicked Link": { color: "#fd7e14", label: "Clicked Link" },
      "Email Sent": { color: "#10b981", label: "Email Sent" },
      "Email Opened": { color: "#3b82f6", label: "Email Opened" },
      "Scheduled": { color: "#10b981", label: "Scheduled" },
    };

    const config = statusConfig[status] || { color: "#6c757d", label: status || "Unknown" };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: alpha(config.color, 0.1),
          color: config.color,
          border: `1px solid ${alpha(config.color, 0.3)}`,
          fontWeight: 'medium',
        }}
      />
    );
  };

  const handleToggleExpand = (email) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(email)) {
      newExpandedRows.delete(email);
      advancedToast.info(
        `Timeline collapsed for ${email}`,
        "Timeline Collapsed",
        { icon: "📊" }
      );
    } else {
      newExpandedRows.add(email);
      advancedToast.info(
        `Timeline expanded for ${email}`,
        "Timeline Expanded",
        { icon: "📈" }
      );
    }
    setExpandedRows(newExpandedRows);
  };

  const displayedResults = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      {/* ✅ Custom Scrollbar Styling */}
      <style jsx global>{`
        .campaign-table-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .campaign-table-container::-webkit-scrollbar-track {
          background: ${darkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'
          };
          border-radius: 4px;
        }
        
        .campaign-table-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ec008c, #fc6767);
          border-radius: 4px;
          border: 1px solid ${darkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'
          };
        }
        
        .campaign-table-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #d6007a, #e55555);
          box-shadow: 0 2px 8px rgba(236, 0, 140, 0.3);
        }
      `}</style>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: darkMode ? alpha('#1e1e2f', 0.6) : alpha('#ffffff', 0.8),
          backdropFilter: 'blur(12px)',
          border: `2px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.12)}`,
          boxShadow: darkMode 
            ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(236, 0, 140, 0.15)' 
            : '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(236, 0, 140, 0.1)',
        }}
      >
        <TableContainer 
          className="campaign-table-container"
          sx={{ 
            maxHeight: 'none',
            backgroundColor: 'transparent',
          }}
        >
          <Table stickyHeader>
            {/* ✅ Enhanced Table Header */}
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sx={{
                      backgroundColor: darkMode 
                        ? '#1a1a2e !important'
                        : '#f5f5f5 !important',
                      borderBottom: `2px solid #ec008c`,
                      color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      py: 2,
                      width: headCell.width || 'auto',
                      '&:first-of-type': {
                        borderTopLeftRadius: '16px',
                      },
                      '&:last-of-type': {
                        borderTopRightRadius: '16px',
                      },
                    }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                        sx={{
                          color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                          '& .MuiTableSortLabel-icon': {
                            color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                          },
                          '&:hover': {
                            color: '#ec008c !important',
                          },
                          '&.Mui-active': {
                            color: '#ec008c !important',
                            '& .MuiTableSortLabel-icon': {
                              color: '#ec008c !important',
                            },
                          },
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* ✅ FIXED: Single Table Body with Timeline Integration */}
            <TableBody>
              {displayedResults.length > 0 ? (
                displayedResults.map((row, rowIndex) => (
                  <React.Fragment key={`${row.email}-${rowIndex}`}>
                    {/* ✅ Main Data Row */}
                    <TableRow
                      sx={{
                        backgroundColor: darkMode ? 'transparent' : '#fff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: darkMode 
                            ? alpha('#ec008c', 0.08) 
                            : alpha('#ec008c', 0.04),
                        },
                        '& > *': {
                          borderBottom: expandedRows.has(row.email) 
                            ? 'none !important' 
                            : `1px solid ${darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.08)} !important`,
                        },
                      }}
                    >
                      {/* Expand/Collapse Button */}
                      <TableCell sx={{ width: 60, py: 2 }}>
                        <Tooltip title={expandedRows.has(row.email) ? "Collapse Timeline" : "Expand Timeline"}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleExpand(row.email)}
                            sx={{
                              color: darkMode ? '#e1e1e1' : '#333',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: alpha('#ec008c', 0.1),
                                color: '#ec008c',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            {expandedRows.has(row.email) ? 
                              <KeyboardArrowDownIcon /> : 
                              <KeyboardArrowRightIcon />
                            }
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      {/* First Name */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" sx={{ color: '#ec008c' }} />
                          <Typography
                            sx={{
                              color: darkMode ? '#e1e1e1' : '#333',
                              fontWeight: 'medium',
                            }}
                          >
                            {row.first_name || '—'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Last Name */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          sx={{
                            color: darkMode ? '#e1e1e1' : '#333',
                            fontWeight: 'medium',
                          }}
                        >
                          {row.last_name || '—'}
                        </Typography>
                      </TableCell>

                      {/* Email */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" sx={{ color: '#2196f3' }} />
                          <Typography
                            sx={{
                              color: darkMode ? '#e1e1e1' : '#333',
                              fontWeight: 'medium',
                              fontSize: '0.875rem',
                            }}
                          >
                            {row.email || '—'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Position */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkIcon fontSize="small" sx={{ color: '#ff9800' }} />
                          <Typography
                            sx={{
                              color: darkMode ? '#e1e1e1' : '#333',
                              fontWeight: 'medium',
                            }}
                          >
                            {row.position || '—'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={{ py: 2 }}>
                        {getStatusChip(row.status)}
                      </TableCell>

                      {/* Reported */}
                      <TableCell align="center" sx={{ py: 2 }}>
                        {row.reported ? (
                          <Tooltip title="Email was reported as phishing">
                            <Chip
                              icon={<CheckIcon fontSize="small" />}
                              label="Yes"
                              size="small"
                              sx={{
                                backgroundColor: alpha('#4caf50', 0.1),
                                color: '#4caf50',
                                border: `1px solid ${alpha('#4caf50', 0.3)}`,
                                fontWeight: 'medium',
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Email was not reported">
                            <Chip
                              icon={<CloseIcon fontSize="small" />}
                              label="No"
                              size="small"
                              sx={{
                                backgroundColor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                                color: darkMode ? '#ccc' : '#666',
                                border: `1px solid ${darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
                                fontWeight: 'medium',
                              }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* ✅ FIXED: Timeline Row - NOT a table, just content */}
                    {expandedRows.has(row.email) && (
                      <TableRow>
                        <TableCell 
                          colSpan={headCells.length}
                          sx={{
                            py: 0,
                            px: 0,
                            border: 'none',
                            backgroundColor: darkMode 
                              ? alpha('#1a1a2e', 0.3) 
                              : alpha('#f8f9fa', 0.6),
                          }}
                        >
                          <Box sx={{ p: 3 }}>
                            <CampaignTimeline
                              email={row.email}
                              firstName={row.first_name}
                              lastName={row.last_name}
                              resultId={row.id}
                              reported={row.reported}
                              timeline={campaignTimeline}
                              detailsExpanded={detailsExpanded}
                              setDetailsExpanded={setDetailsExpanded}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={headCells.length} 
                    sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      color: darkMode ? '#ccc' : '#666',
                      fontSize: '1.1rem',
                      fontWeight: 'medium',
                    }}
                  >
                    📭 No results found for this campaign.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ✅ Enhanced Table Pagination */}
        <Box
          sx={{
            borderTop: `2px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
            backgroundColor: darkMode 
              ? alpha('#1a1a2e', 0.8) 
              : alpha('#fafafa', 0.9),
            borderRadius: '0 0 16px 16px',
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={results.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              color: darkMode ? 'grey.300' : 'grey.800',
              '& .MuiIconButton-root': {
                color: darkMode ? 'grey.300' : 'grey.800',
                '&:hover': {
                  backgroundColor: alpha('#ec008c', 0.1),
                  color: '#ec008c',
                },
              },
              '& .MuiSelect-icon': {
                color: darkMode ? 'grey.300' : 'grey.800',
              },
            }}
          />
        </Box>
      </Paper>

      {/* ✅ Results Summary */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          borderRadius: '12px',
          background: darkMode ? alpha('#1a1a2e', 0.3) : alpha('#f8f9fa', 0.5),
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: darkMode ? '#ccc' : '#666',
            textAlign: 'center',
            fontWeight: 'medium',
          }}
        >
          📊 Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, results.length)} of {results.length} participants
          {expandedRows.size > 0 && (
            <> • {expandedRows.size} timeline{expandedRows.size !== 1 ? 's' : ''} expanded</>
          )}
        </Typography>
      </Paper>
    </>
  );
};

export default CampaignTable;
