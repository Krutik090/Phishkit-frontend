import React, { useState, useEffect } from "react";
import axios from "axios";

const MFASetup = () => {
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ No token found in localStorage");
      console.error("❌ No token found in localStorage");
      return;
    }

    console.log("✅ Using token:", token);

    axios
      .post(
        "http://localhost:5000/api/auth/mfa/setup", 
        {}, // <-- POST body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log("✅ QR Response:", res.data);
        setQrCode(res.data.qr);
      })
      .catch((err) => {
        console.error("❌ Error fetching MFA setup:", err);
        if (err.response) {
          setError(
            `Server Error ${err.response.status}: ${err.response.data.message}`
          );
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
