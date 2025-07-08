// src/components/login/MFAVerify.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MFAVerify = ({ token: passedToken }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = passedToken || localStorage.getItem("token");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("❌ JWT token missing. Cannot verify MFA.");
      console.error("❌ No JWT token found in props or localStorage.");
      return;
    }

    try {
      console.log("🔐 Sending token:", token);
      const res = await axios.post(
        "http://localhost:5000/api/auth/mfa/verify",
        { token: code.trim() }, // trim input for safety
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ MFA Verified:", res.data);
      navigate("/campaigns"); // ✅ redirect on success
    } catch (err) {
      console.error(
        "❌ MFA verification failed:",
        err.response?.data?.message || err.message
      );
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
