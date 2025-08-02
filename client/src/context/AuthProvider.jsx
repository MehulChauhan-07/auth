import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Function to get CSRF token
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(
        `${backendUrl.replace("/auth", "")}/csrf-token`
      );
      const token = response.data.csrfToken;
      setCsrfToken(token);
      return token;
    } catch (error) {
      console.error("Error getting CSRF token:", error);
      return null;
    }
  };

  // Function to make authenticated POST requests with CSRF token
  const authenticatedPost = async (url, data) => {
    let token = csrfToken;

    // If no token, get a new one
    if (!token) {
      token = await getCsrfToken();
    }

    if (!token) {
      throw new Error("Failed to get CSRF token");
    }

    return axios.post(url, data, {
      headers: {
        "X-CSRF-Token": token,
      },
    });
  };

  // Axios interceptor for token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and token expired and not already retrying
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data.tokenExpired &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          setTokenRefreshing(true);
          // Call refresh token endpoint
          await axios.post(`${backendUrl}/auth/refresh-token`);
          setTokenRefreshing(false);

          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          setTokenRefreshing(false);
          // If refresh fails, log out
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Pre-fetch CSRF token
        await getCsrfToken();

        const response = await axios.get(`${backendUrl}/auth/is-authenticated`);

        if (response.data.success) {
          setIsLoggedIn(true);
          setUserData(response.data.user);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [backendUrl]);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await authenticatedPost(`${backendUrl}/auth/login`, {
        email,
        password,
        rememberMe,
      });

      if (response.data.success) {
        // Check if user has MFA enabled
        if (response.data.user?.mfaEnabled) {
          // Return MFA required status for UI to show MFA input
          return {
            success: true,
            mfaRequired: true,
            userId: response.data.user.id,
            email: email,
            password: password, // Store temporarily for MFA verification
          };
        }

        setIsLoggedIn(true);
        await getUserData();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await authenticatedPost(`${backendUrl}/auth/register`, {
        name,
        email,
        password,
      });

      if (response.data.success) {
        setIsLoggedIn(true);
        await getUserData();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authenticatedPost(`${backendUrl}/auth/logout`, {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state even if API call fails
      setIsLoggedIn(false);
      setUserData(null);
      setCsrfToken(null); // Clear CSRF token on logout
    }
  };

  // Get user data
  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/data`);

      if (response.data.success) {
        setUserData(response.data.user);
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Verify MFA token
  const verifyMfa = async (email, password, token, backupCode = null) => {
    try {
      const response = await authenticatedPost(
        `${backendUrl}/mfa/verify-login`,
        {
          email: email,
          password: password,
          token: token || undefined,
          backupCode: backupCode || undefined,
        }
      );

      if (response.data.success) {
        setIsLoggedIn(true);
        await getUserData();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("MFA verification error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "MFA verification failed",
      };
    }
  };

  // Setup MFA
  const setupMfa = async () => {
    try {
      const response = await authenticatedPost(`${backendUrl}/mfa/setup`, {});

      if (response.data.success) {
        return {
          success: true,
          secret: response.data.data.secret,
          qrCode: response.data.data.qrCode,
        };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("MFA setup error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "MFA setup failed",
      };
    }
  };

  // Enable MFA
  const enableMfa = async (token) => {
    try {
      const response = await authenticatedPost(`${backendUrl}/mfa/enable`, {
        token,
      });

      if (response.data.success) {
        // Update user data to reflect MFA status
        await getUserData();

        return {
          success: true,
          backupCodes: response.data.data.backupCodes,
        };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("MFA activation error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "MFA activation failed",
      };
    }
  };

  // Disable MFA
  const disableMfa = async (password) => {
    try {
      const response = await authenticatedPost(`${backendUrl}/mfa/disable`, {
        password,
      });

      if (response.data.success) {
        // Update user data to reflect MFA status
        await getUserData();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("MFA deactivation error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "MFA deactivation failed",
      };
    }
  };

  // Get active sessions
  const getActiveSessions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/sessions`);

      if (response.data.success) {
        return {
          success: true,
          sessions: response.data.data.sessions,
        };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch sessions",
      };
    }
  };

  // Revoke a session
  const revokeSession = async (sessionId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/sessions/${sessionId}`
      );

      if (response.data.success) {
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error revoking session:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to revoke session",
      };
    }
  };

  // Revoke all other sessions
  const revokeAllSessions = async () => {
    try {
      const response = await axios.delete(`${backendUrl}/sessions`);

      if (response.data.success) {
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error revoking sessions:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to revoke sessions",
      };
    }
  };

  // Handle OAuth login
  const oauthLogin = (provider) => {
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      const response = await axios.put(`${backendUrl}/user/update`, data);

      if (response.data.success) {
        setUserData(response.data.user);
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userData,
        loading,
        tokenRefreshing,
        backendUrl,
        login,
        register,
        logout,
        getUserData,
        verifyMfa,
        setupMfa,
        enableMfa,
        disableMfa,
        getActiveSessions,
        revokeSession,
        revokeAllSessions,
        oauthLogin,
        updateProfile,
        getCsrfToken, // Export for manual use if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
