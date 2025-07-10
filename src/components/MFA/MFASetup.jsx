import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MFASetup = () => {
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .post(
        `${API_BASE_URL}/auth/mfa/setup`,
        {}, // empty body
        {
          withCredentials: true // ✅ send cookies
        }
      )
      .then((res) => {
        setQrCode(res.data.qr);
      })
      .catch((err) => {
        console.error("❌ Error fetching MFA setup:", err);
        if (err.response) {
          setError(`Server Error ${err.response.status}: ${err.response.data.message}`);
        } else {
          setError("❌ Could not connect to backend");
        }
      });
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Enable MFA</h2>
      <p>Scan the QR code below using Google or Microsoft Authenticator:</p>
      {qrCode && <img src={qrCode} alt="QR Code" />}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!qrCode && !error && <p>Loading QR code...</p>}
    </div>
  );
};

export default MFASetup;
