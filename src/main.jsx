import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext"; // ✅ Add this line
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider> {/* ✅ Wrap your App in AuthProvider */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
