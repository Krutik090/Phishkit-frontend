// utils/toast.jsx
import { toast } from "react-toastify";
import React from "react";

/**
 * Custom Toast Component with advanced styling and icons
 */
const CustomToast = ({ type, message, title, icon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '4px 0',
    width: '100%'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      flexShrink: 0,
      marginTop: '2px',
      background: type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                 type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                 type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                 type === 'info' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      color: 'white',
      boxShadow: type === 'success' ? '0 4px 12px rgba(16, 185, 129, 0.3)' :
                 type === 'error' ? '0 4px 12px rgba(239, 68, 68, 0.3)' :
                 type === 'warning' ? '0 4px 12px rgba(245, 158, 11, 0.3)' :
                 '0 4px 12px rgba(59, 130, 246, 0.3)'
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
          fontSize: '15px',
          marginBottom: '6px',
          color: 'inherit',
          lineHeight: '1.3'
        }}>
          {title}
        </div>
      )}
      <div style={{
        fontSize: '14px',
        lineHeight: '1.4',
        color: 'inherit',
        opacity: title ? 0.85 : 1,
        wordBreak: 'break-word'
      }}>
        {message}
      </div>
    </div>
  </div>
);

/**
 * Advanced toast notification system with modern styling and animations
 */
export const advancedToast = {
  /**
   * Success toast with optional title
   */
  success: (message, title, options = {}) => {
    return toast.success(
      <CustomToast 
        type="success" 
        message={message} 
        title={title} 
        icon={options.icon}
      />,
      {
        autoClose: options.autoClose || 4000,
        ...options
      }
    );
  },

  /**
   * Error toast with optional title
   */
  error: (message, title, options = {}) => {
    return toast.error(
      <CustomToast 
        type="error" 
        message={message} 
        title={title} 
        icon={options.icon}
      />,
      {
        autoClose: options.autoClose || 5000,
        ...options
      }
    );
  },

  /**
   * Warning toast with optional title
   */
  warning: (message, title, options = {}) => {
    return toast.warning(
      <CustomToast 
        type="warning" 
        message={message} 
        title={title} 
        icon={options.icon}
      />,
      {
        autoClose: options.autoClose || 4500,
        ...options
      }
    );
  },

  /**
   * Info toast with optional title
   */
  info: (message, title, options = {}) => {
    return toast.info(
      <CustomToast 
        type="info" 
        message={message} 
        title={title} 
        icon={options.icon}
      />,
      {
        autoClose: options.autoClose || 4000,
        ...options
      }
    );
  },

  /**
   * Custom toast with custom styling
   */
  custom: (message, title, type = 'info', options = {}) => {
    return toast(
      <CustomToast 
        type={type} 
        message={message} 
        title={title} 
        icon={options.icon}
      />,
      {
        autoClose: options.autoClose || 4000,
        ...options
      }
    );
  },

  /**
   * Promise toast for async operations
   */
  promise: async (promise, messages = {}, options = {}) => {
    const defaultMessages = {
      pending: "Loading...",
      success: "Operation completed successfully!",
      error: "Something went wrong!"
    };

    const finalMessages = { ...defaultMessages, ...messages };

    return toast.promise(
      promise,
      {
        pending: {
          render: () => <CustomToast 
            type="info" 
            message={finalMessages.pending} 
            title="Please wait"
            icon="⏳"
          />,
          ...options.pending
        },
        success: {
          render: ({ data }) => <CustomToast 
            type="success" 
            message={finalMessages.success} 
            title="Success!"
          />,
          ...options.success
        },
        error: {
          render: ({ data }) => <CustomToast 
            type="error" 
            message={data?.message || finalMessages.error} 
            title="Error"
          />,
          ...options.error
        }
      },
      options.global || {}
    );
  },

  /**
   * Dismiss all toasts
   */
  dismiss: () => {
    toast.dismiss();
  },

  /**
   * Dismiss specific toast by ID
   */
  dismissById: (toastId) => {
    toast.dismiss(toastId);
  },

  /**
   * Check if toast is active
   */
  isActive: (toastId) => {
    return toast.isActive(toastId);
  }
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

// Export individual toast functions for convenience
export const {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  custom: toastCustom,
  promise: toastPromise
} = advancedToast;

export default advancedToast;