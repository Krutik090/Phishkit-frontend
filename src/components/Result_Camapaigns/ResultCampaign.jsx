import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import useCampaignData from "./useCampaignData";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { stableSort, getComparator } from "./utils";
import CampaignTable from "./CampaignTable";
import TimelineGraph from "./TimelineGraph";
import { useTheme } from "../../context/ThemeContext";

const pink = "#e91e63";

const CampaignResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { campaign, loading, error, deleteCampaign, refreshCampaign } = useCampaignData(id);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("first_name");
  const [searchText, setSearchText] = useState("");
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [detailsExpanded, setDetailsExpanded] = useState(new Set());

  const { darkMode } = useTheme();

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setPage(0);
  };

  const exportToCSV = () => {
    if (!campaign?.results || campaign.results.length === 0) {
      console.log("No data to export.");
      return;
    }

    const headers = ["First Name", "Last Name", "Email", "Position", "Status", "Reported"];
    const rows = campaign.results.map((r) => [
      r.first_name,
      r.last_name,
      r.email,
      r.position || "",
      r.status,
      r.reported ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${campaign.name.replace(/\s+/g, "_")}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCampaign = async () => {
    setOpenDeleteConfirm(false);
    const success = await deleteCampaign();
    if (success) {
      navigate("/");
    }
  };

  const countByMilestone = (milestone) => {
    if (!campaign?.results) return 0;
    return campaign.results.filter((r) => {
      switch (milestone) {
        case "Email Sent":
          return ["Email Sent", "Clicked Link", "Submitted Data"].includes(r.status);
        case "Clicked Link":
          return ["Clicked Link", "Submitted Data"].includes(r.status);
        case "Submitted Data":
          return r.status === "Submitted Data";
        case "Email Reported":
          return r.reported === true;
        default:
          return false;
      }
    }).length;
  };

  const filteredAndSortedResults = useMemo(() => {
    if (!campaign?.results) return [];

    let filtered = campaign.results.filter((result) =>
      Object.values(result).some(
        (value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
    return stableSort(filtered, getComparator(order, orderBy));
  }, [campaign?.results, order, orderBy, searchText]);

  const totalSent = campaign?.results?.length || 1;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <Typography variant="h6" color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <Typography variant="h6" color="text.secondary">Campaign not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4, py: 3, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: pink, mb: 4 }}>
          🎯 Results for {campaign.name}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ textTransform: "none" }}>
            🔙 Back
          </Button>
          <Button variant="contained" color="success" onClick={exportToCSV} sx={{ textTransform: "none" }}>
            📊 Export CSV
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenDeleteConfirm(true)}
            sx={{ textTransform: "none" }}
          >
            🗑 Delete
          </Button>
          <Button variant="outlined" color="primary" onClick={refreshCampaign} sx={{ textTransform: "none" }}>
            🔄 Refresh
          </Button>
        </Box>
      </Box>

      {/* Timeline */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
          📅 Campaign Timeline
        </Typography>
        <Box
          sx={{
            backgroundColor: "#f9fafb",
            borderRadius: 2,
            p: 3,
            border: "1px solid #e5e7eb",
            position: "relative",
          }}
        >
          <TimelineGraph timeline={campaign.timeline} />
        </Box>
      </Box>

      {/* Progress Rings */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 6, mb: 4, flexWrap: "wrap" }}>
        <CircularProgressWithLabel
          value={countByMilestone("Email Sent")}
          total={totalSent}
          color="#10b981"
          label="Email Sent"
        />
        <CircularProgressWithLabel
          value={countByMilestone("Clicked Link")}
          total={totalSent}
          color="#f97316"
          label="Clicked Link"
        />
        <CircularProgressWithLabel
          value={countByMilestone("Submitted Data")}
          total={totalSent}
          color="#ef4444"
          label="Submitted Data"
        />
        <CircularProgressWithLabel
          value={countByMilestone("Email Reported")}
          total={totalSent}
          color="#6366f1"
          label="Email Reported"
        />
      </Box>

      {/* Results Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Details
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Show</Typography>
            <TextField
              select
              size="small"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              SelectProps={{ native: true }}
              sx={{
                width: "70px",
                '& .MuiInputBase-root': {
                  color: darkMode ? '#fff' : '#000',
                  backgroundColor: darkMode ? '#2c2c3e' : '#fff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#888' : '#ccc',
                },
                '& svg': {
                  color: darkMode ? '#fff' : '#000',
                },
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </TextField>
            <Typography>entries</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Search:</Typography>
            <TextField
              size="small"
              value={searchText}
              onChange={handleSearchChange}
              sx={{
                width: "200px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkMode ? "#fff" : undefined,
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "#fff" : undefined,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: darkMode ? "#fff" : undefined,
                  },
                },
                input: {
                  color: darkMode ? "#fff" : undefined,
                },
              }}
            />
          </Box>
        </Box>

        <CampaignTable
          results={filteredAndSortedResults}
          page={page}
          rowsPerPage={rowsPerPage}
          order={order}
          orderBy={orderBy}
          handleRequestSort={handleRequestSort}
          handleChangePage={handleChangePage}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          detailsExpanded={detailsExpanded}
          setDetailsExpanded={setDetailsExpanded}
          campaignTimeline={campaign.timeline}
        />
      </Box>

      <DeleteConfirmationDialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={handleDeleteCampaign}
        title="Confirm Deletion"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
      />
    </Box>
  );
};

export default CampaignResults;
