import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const useCampaignData = (campaignId) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaignData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/results`, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  const refreshCampaign = () => {
    fetchCampaignData();
  };

  const deleteCampaign = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campaign.");
      }
      console.log("Campaign deleted successfully.");
      return true; // Indicate success
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting campaign.");
      return false; // Indicate failure
    }
  };

  return { campaign, loading, error, deleteCampaign, refreshCampaign };
};

export default useCampaignData;