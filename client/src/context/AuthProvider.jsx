// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api, { authAPI } from "../lib/api.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use the user data endpoint which gives us full user info
        const response = await api.get("/user/data");

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        // If the request fails, user is not authenticated or token is invalid
        console.log("Auth check failed:", err.response?.status);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);

      if (response.data.success) {
        await fetchUser();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed");
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);

      if (response.data.success) {
        if (response.data.mfaRequired) {
          return {
            success: true,
            mfaRequired: true,
            userId: response.data.userId,
          };
        }

        await fetchUser();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      console.log("🔍 Starting logout process...");
      const response = await authAPI.logout();

      if (response.data.success) {
        console.log("✅ Logout successful on server");
      } else {
        console.warn("⚠️ Server logout returned error:", response.data.message);
      }

      // Clear user state regardless of server response
      setUser(null);
      setError(null);

      console.log("✅ User state cleared");
      return { success: true };
    } catch (err) {
      console.error("❌ Logout error:", err);
      // Even if server logout fails, clear local state
      setUser(null);
      setError(null);

      return {
        success: true, // Return success to allow frontend logout
        message:
          "Logged out locally (server error: " +
          (err.response?.data?.message || err.message) +
          ")",
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data
  const fetchUser = async () => {
    try {
      const response = await api.get("/user/data");

      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      }

      return null;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  // MFA setup functions
  const setupMfa = async () => {
    setLoading(true);
    try {
      const response = await api.post("/mfa/setup");

      if (response.data.success) {
        return {
          success: true,
          secret: response.data.data.secret,
          qrCode: response.data.data.qrCode,
        };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to setup MFA");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to setup MFA",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async (token) => {
    setLoading(true);
    try {
      const response = await api.post("/mfa/verify", { token });

      if (response.data.success) {
        await fetchUser();
        return {
          success: true,
          backupCodes: response.data.data.backupCodes,
        };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify MFA");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to verify MFA",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyMfaLogin = async (userId, token, backupCode) => {
    setLoading(true);
    try {
      const response = await api.post("/mfa/verify-login", {
        userId,
        token: token || undefined,
        backupCode: backupCode || undefined,
      });

      if (response.data.success) {
        await fetchUser();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify MFA");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to verify MFA",
      };
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async (password) => {
    setLoading(true);
    try {
      const response = await api.post("/mfa/disable", { password });

      if (response.data.success) {
        await fetchUser();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to disable MFA");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to disable MFA",
      };
    } finally {
      setLoading(false);
    }
  };

  // Session management
  const getSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/sessions");
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sessions");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      const response = await api.delete(`/sessions/${sessionId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to revoke session");
      throw err;
    }
  };

  const revokeAllSessions = async () => {
    try {
      const response = await api.delete("/sessions");
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to revoke all sessions");
      throw err;
    }
  };

  // OAuth methods
  const oauthLogin = (provider) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  // Profile update
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/user/update", profileData);

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        fetchUser,
        setupMfa,
        verifyMfa,
        verifyMfaLogin,
        disableMfa,
        getSessions,
        revokeSession,
        revokeAllSessions,
        oauthLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
