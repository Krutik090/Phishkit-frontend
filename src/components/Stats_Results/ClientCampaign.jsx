import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClientCampaign = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const [client, setClient] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientAndCampaigns();
  }, [projectId]);

  useEffect(() => {
    if (campaigns.length > 0 && tableRef.current) {
      $(tableRef.current).DataTable();
    }

    return () => {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, [campaigns]);

  const fetchClientAndCampaigns = async () => {
    try {
      setLoading(true);
      const clientRes = await fetch(`${API_BASE_URL}/projects/${projectId}`,{credentials : "include"});
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
        fetch(`${API_BASE_URL}/campaigns/${id}`)
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
    const campaignNames = campaigns.map((c) => c.name || "Unnamed Campaign");
    navigate(`/projects/${projectId}/insights`, { state: { campaignIds, campaignNames } });
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign/${campaignId}/details`);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{
              background: "linear-gradient(135deg, #fff, #fff) padding-box, linear-gradient(135deg, #ec008c, #ff6a9f) border-box",
              color: "#ec008c",
              border: "2px solid transparent",
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "uppercase",
              px: 3,
              py: 1,
              boxShadow: "0 4px 10px rgba(236, 0, 140, 0.2)",
              "&:hover": {
                background: "linear-gradient(135deg, #fdfdfd, #fdfdfd) padding-box, linear-gradient(135deg, #d6007a, #ff478a) border-box",
                boxShadow: "0 6px 12px rgba(236, 0, 140, 0.3)",
              },
            }}
          >
            Back
          </Button>

          <Typography variant="h5" fontWeight="bold">
            📊 Campaigns for Project: {client?.name || "Loading..."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleInsightsClick}
          sx={{
            background:
              "linear-gradient(135deg, #fff, #fff) padding-box, linear-gradient(135deg, #6a11cb, #2575fc) border-box",
            color: "#6a11cb",
            border: "2px solid transparent",
            borderRadius: "8px",
            fontWeight: "bold",
            textTransform: "uppercase",
            px: 3,
            py: 1,
            boxShadow: "0 4px 10px rgba(106, 17, 203, 0.2)",
            "&:hover": {
              background:
                "linear-gradient(135deg, #fdfdfd, #fdfdfd) padding-box, linear-gradient(135deg, #5e0dcf, #1459f5) border-box",
              boxShadow: "0 6px 12px rgba(106, 17, 203, 0.3)",
            },
          }}
        >
          Insights
        </Button>
      </Box>

      {/* Table or Loader */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          {campaigns.length === 0 ? (
            <Typography mt={4} align="center" color="textSecondary">
              🚫 No campaigns found for this client.
            </Typography>
          ) : (
            <div className="table-container">
              <table ref={tableRef} className="display stripe" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Campaign Name</th>
                    <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Status</th>
                    <th style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>Emails Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, idx) => (
                    <tr key={campaign.id || campaign._id || idx}>
                      <td
                        style={{ border: "1px solid #ccc", padding: 10, color: "#ec008c", cursor: "pointer", fontWeight: 500, textAlign: "center", verticalAlign: "middle" }}
                        onClick={() => handleCampaignClick(campaign.id || campaign._id)}
                      >
                        {campaign.name || "Unnamed Campaign"}
                      </td>
                      <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>{campaign.status || "Unknown"}</td>
                      <td style={{ border: "1px solid #ccc", padding: 10, textAlign: "center", verticalAlign: "middle" }}>{Array.isArray(campaign.results) ? campaign.results.length : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Box>
  );
};

export default ClientCampaign;
