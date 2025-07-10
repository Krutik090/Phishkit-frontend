import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MFAVerify = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/mfa/verify`,
        { token: code.trim() },
        { withCredentials: true } // ✅ send secure cookies
      );

      console.log("✅ MFA Verified:", res.data);
      navigate("/campaigns");
    } catch (err) {
      console.error("❌ MFA verification failed:", err.response?.data || err.message);
      setError("Invalid MFA code. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Multi-Factor Authentication</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength="6"
        />
        <br />
        <button type="submit">Verify</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default MFAVerify;
