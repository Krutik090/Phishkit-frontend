// utils/toast.jsx
import { toast, ToastContainer } from "react-toastify";
import React from "react";
import "react-toastify/dist/ReactToastify.css";

/**
 * Custom Toast Component with advanced styling and icons
 */
const CustomToast = ({ type, message, title, icon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '0',
    width: '100%'
  }}>
    <div style={{
      width: '28px',
      height: '28px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      flexShrink: 0,
      marginTop: '2px',
      background: type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                 type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                 type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                 type === 'info' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      color: 'white',
      boxShadow: type === 'success' ? '0 4px 12px rgba(16, 185, 129, 0.25)' :
                 type === 'error' ? '0 4px 12px rgba(239, 68, 68, 0.25)' :
                 type === 'warning' ? '0 4px 12px rgba(245, 158, 11, 0.25)' :
                 '0 4px 12px rgba(59, 130, 246, 0.25)'
    }}>
      {icon || (
        type === 'success' ? '✓' : 
        type === 'error' ? '✕' :
        type === 'warning' ? '⚠' : 
        type === 'info' ? 'ℹ' : '🔔'
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      {title && (
        <div style={{
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '4px',
          color: 'inherit',
          lineHeight: '1.3'
        }}>
          {title}
        </div>
      )}
      <div style={{
        fontSize: '13px',
        lineHeight: '1.4',
        color: 'inherit',
        opacity: title ? 0.9 : 1,
        wordBreak: 'break-word'
      }}>
        {message}
      </div>
    </div>
  </div>
);

/**
 * Toast Provider Component to wrap your app.
 * This component includes the ToastContainer and all necessary global styles.
 */
export const ToastProvider = ({ children, darkMode = false }) => {
  const isDark = darkMode;

  // This is a workaround to inject global styles without a .css file.
  const GlobalStyles = () => (
    <style>{`
        .custom-toast {
          background: ${isDark ? 
            'linear-gradient(135deg, rgba(30, 30, 47, 0.95), rgba(42, 42, 59, 0.95))' : 
            'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))'} !important;
          backdrop-filter: blur(12px) !important;
          border: ${isDark ? 
            '1px solid rgba(255, 255, 255, 0.1)' : 
            '1px solid rgba(0, 0, 0, 0.05)'} !important;
          border-radius: 12px !important;
          box-shadow: ${isDark ? 
            '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' : 
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'} !important;
          color: ${isDark ? '#f1f5f9' : '#334155'} !important;
          min-height: 65px !important;
          margin-bottom: 8px !important;
        }

        .custom-toast:hover {
          transform: translateY(-2px) !important;
          box-shadow: ${isDark ? 
            '0 25px 30px -5px rgba(0, 0, 0, 0.5), 0 15px 15px -5px rgba(0, 0, 0, 0.3)' : 
            '0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08)'} !important;
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }

        .custom-toast-body {
          padding: 16px !important;
          margin: 0 !important;
        }
    `}</style>
  );

  return (
    <>
      <GlobalStyles />
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        limit={5}
        theme={isDark ? "dark" : "light"}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </>
  );
};

/**
 * Advanced toast notification system with modern styling and animations
 */
export const advancedToast = {
  success: (message, title, options = {}) => {
    return toast(
      <CustomToast type="success" message={message} title={title} icon={options.icon} />,
      { ...options, type: 'success', icon: false }
    );
  },
  error: (message, title, options = {}) => {
    return toast(
      <CustomToast type="error" message={message} title={title} icon={options.icon} />,
      { ...options, type: 'error', icon: false }
    );
  },
  warning: (message, title, options = {}) => {
    return toast(
      <CustomToast type="warning" message={message} title={title} icon={options.icon} />,
      { ...options, type: 'warning', icon: false }
    );
  },
  info: (message, title, options = {}) => {
    return toast(
      <CustomToast type="info" message={message} title={title} icon={options.icon} />,
      { ...options, type: 'info', icon: false }
    );
  },
  dismiss: () => toast.dismiss(),
  dismissById: (toastId) => toast.dismiss(toastId),
  isActive: (toastId) => toast.isActive(toastId),
};

/**
 * Predefined toast messages for common scenarios
 */
export const toastMessages = {
  // Authentication
  auth: {
    loginSuccess: () => advancedToast.success("Welcome back!", "Login Successful", { icon: "👋" }),
    loginError: () => advancedToast.error("Please check your credentials and try again.", "Login Failed"),
    logoutSuccess: () => advancedToast.success("You have been logged out successfully.", "Goodbye!", { icon: "👋" }),
    sessionExpired: () => advancedToast.warning("Please log in again to continue.", "Session Expired"),
    unauthorized: () => advancedToast.error("You don't have permission to access this resource.", "Access Denied")
  },
  // CRUD Operations
  crud: {
    createSuccess: (item) => advancedToast.success(`${item} has been created successfully.`, "Created!", { icon: "✨" }),
    createError: (item) => advancedToast.error(`Failed to create ${item}. Please try again.`, "Creation Failed"),
    updateSuccess: (item) => advancedToast.success(`${item} has been updated successfully.`, "Updated!", { icon: "📝" }),
    updateError: (item) => advancedToast.error(`Failed to update ${item}. Please try again.`, "Update Failed"),
    deleteSuccess: (item) => advancedToast.success(`${item} has been deleted successfully.`, "Deleted!", { icon: "🗑️" }),
    deleteError: (item) => advancedToast.error(`Failed to delete ${item}. Please try again.`, "Delete Failed"),
    fetchError: () => advancedToast.error("Unable to load data. Please refresh the page.", "Loading Failed")
  },
  // File Operations
  file: {
    uploadSuccess: () => advancedToast.success("Your file has been uploaded successfully.", "Upload Complete!", { icon: "📁" }),
    uploadError: () => advancedToast.error("Upload failed. Please check the file and try again.", "Upload Failed"),
    downloadStart: () => advancedToast.info("Your download will start shortly.", "Preparing Download", { icon: "⬇️" }),
    downloadError: () => advancedToast.error("Download failed. Please try again.", "Download Failed")
  },
  // Network
  network: {
    offline: () => advancedToast.warning("You appear to be offline. Some features may be limited.", "Connection Lost", { icon: "📶" }),
    online: () => advancedToast.success("Connection restored!", "Back Online", { icon: "🌐" }),
    slowConnection: () => advancedToast.info("Slow connection detected. Loading may take longer.", "Slow Connection", { icon: "⏰" })
  },
  // Form Validation
  validation: {
    requiredFields: () => advancedToast.warning("Please fill in all required fields.", "Missing Information"),
    invalidEmail: () => advancedToast.warning("Please enter a valid email address.", "Invalid Email"),
    passwordMismatch: () => advancedToast.warning("Passwords do not match.", "Password Error"),
    invalidFormat: (field) => advancedToast.warning(`Please enter a valid ${field}.`, "Invalid Format")
  },
  // System
  system: {
    maintenance: () => advancedToast.info("System maintenance in progress. Some features may be temporarily unavailable.", "Maintenance Mode", { icon: "🔧" }),
    updateAvailable: () => advancedToast.info("A new version is available. Please refresh to update.", "Update Available", { icon: "🔄" }),
    saveDraft: () => advancedToast.success("Your changes have been saved as a draft.", "Draft Saved", { icon: "💾" })
  }
};

export default advancedToast;
