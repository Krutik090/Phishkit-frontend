import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Adjust path as needed
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const useCampaignData = (campaignId) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Check if user is read-only
  const isReadOnly = user?.isReadOnly || false;

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
    // Check if user is read-only before attempting delete
    if (isReadOnly) {
      toast.error("You don't have permission to delete campaigns. Please contact your administrator.", {
        position: "top-right",
        autoClose: 5000,
      });
      return false; // Indicate failure due to permissions
    }

    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campaign.");
      }
      
      toast.success("Campaign deleted successfully.", {
        position: "top-right",
        autoClose: 3000,
      });
      
      console.log("Campaign deleted successfully.");
      return true; // Indicate success
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = "Error deleting campaign. Please try again.";
      setError(errorMessage);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      
      return false; // Indicate failure
    }
  };

  return { 
    campaign, 
    loading, 
    error, 
    deleteCampaign, 
    refreshCampaign,
    isReadOnly // Expose this so components can use it for UI decisions
  };
};

export default useCampaignData;