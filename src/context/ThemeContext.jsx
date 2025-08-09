import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

// Create the context with a default value
const ThemeContext = createContext();

/**
 * Provides the theme (dark/light mode) to its children components.
 * It synchronizes the theme with localStorage and the user's OS preference.
 */
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // 1. Check localStorage for a saved user preference
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return savedMode === "true";
    }

    // 2. If no preference is saved, check the user's OS/browser preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }

    // 3. Default to light mode if no preference is found
    return false;
  });

  useEffect(() => {
    // Update localStorage whenever the theme changes
    localStorage.setItem("darkMode", darkMode);

    // Update the class on the root HTML element for Tailwind CSS's 'dark' variant
    const root = window.document.documentElement;
    root.classList.remove(darkMode ? 'light' : 'dark');
    root.classList.add(darkMode ? 'dark' : 'light');

  }, [darkMode]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  // This is an optimization that becomes important in larger applications.
  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to easily access the theme context (darkMode state and setter).
 * @returns {{darkMode: boolean, setDarkMode: Function}}
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
