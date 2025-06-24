import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  Link,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ClientCampaign = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    fetchClientAndCampaigns();
  }, [clientId]);

  const fetchClientAndCampaigns = async () => {
    try {
      setLoading(true);
      const clientRes = await fetch(`http://localhost:5000/api/clients/${clientId}`);
      const text = await clientRes.text();

      let clientData;
      try {
        clientData = JSON.parse(text);
      } catch (jsonErr) {
        console.error("❌ Failed to parse client JSON. Raw response:", text);
        throw new Error("Invalid client JSON format.");
      }

      setClient(clientData);

      if (!Array.isArray(clientData.campaigns) || clientData.campaigns.length === 0) {
        setCampaigns([]);
        return;
      }

      const campaignPromises = clientData.campaigns.map((id) =>
        fetch(`http://localhost:5000/api/campaigns/${id}`)
          .then((res) => {
            if (!res.ok) throw new Error(`❌ Fetch failed for campaign ID: ${id}`);
            return res.json();
          })
          .catch((err) => {
            console.error("Campaign fetch error:", err.message);
            return null;
          })
      );

      const campaignDetails = await Promise.all(campaignPromises);
      const filtered = campaignDetails.filter(Boolean);
      setCampaigns(filtered);
    } catch (err) {
      console.error("❌ Failed to load client or campaigns:", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInsightsClick = () => {
    const campaignIds = campaigns.map((c) => c.id || c._id).filter(Boolean);
    navigate(`/client/${clientId}/insights`, { state: { campaignIds } });
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign/${campaignId}/details`);
  };

  const pageCount = Math.ceil(campaigns.length / entriesPerPage);
  const paginated = campaigns.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold" color="#343a40">
            📊 Campaigns for Client: {client?.name || "Loading..."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleInsightsClick}
          sx={{
            background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "uppercase",
            px: 3,
            py: 1,
            boxShadow: "0 4px 10px rgba(236, 0, 140, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #d6007a, #ff478a)",
              boxShadow: "0 6px 12px rgba(236, 0, 140, 0.5)",
            },
          }}
        >
          Insights
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["Campaign Name", "Status", "Emails Sent"].map((label) => (
                    <TableCell
                      key={label}
                      sx={{
                        backgroundColor: "#ffe0ef",
                        color: "#ec008c",
                        fontWeight: "bold",
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.length > 0 ? (
                  paginated.map((campaign, index) => (
                    <TableRow key={campaign.id || campaign._id || index}>
                      <TableCell>
                        <Link
                          component="button"
                          underline="hover"
                          sx={{ color: "#ec008c", fontWeight: "500" }}
                          onClick={() => handleCampaignClick(campaign.id || campaign._id)}
                        >
                          {campaign.name || "Unnamed Campaign"}
                        </Link>
                      </TableCell>
                      <TableCell>{campaign.status || "Unknown"}</TableCell>
                      <TableCell>
                        {Array.isArray(campaign.results) ? campaign.results.length : 0}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      No campaigns found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pageCount > 1 && (
            <Box mt={3} display="flex" justifyContent="center">
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ClientCampaign;
