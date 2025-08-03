import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// CSRF token management
let csrfToken = null;
let useTestRoutes = false;

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/csrf-token`, {
      withCredentials: true,
    });

    if (response.data.success) {
      csrfToken = response.data.csrfToken;
      console.log("✅ CSRF token obtained successfully");
      return csrfToken;
    }
  } catch (error) {
    console.warn("⚠️  CSRF token failed, will use test routes:", error.message);
    useTestRoutes = true;
    return null;
  }
};

// Auth API wrapper that automatically handles CSRF or falls back to test routes
export const authAPI = {
  async login(credentials) {
    if (useTestRoutes) {
      console.log("🧪 Using test route for login");
      return api.post("/auth/test/login", credentials);
    }

    // Try with CSRF first
    try {
      if (!csrfToken) {
        await getCsrfToken();
      }

      const config = csrfToken
        ? {
            headers: { "X-CSRF-Token": csrfToken },
          }
        : {};

      return await api.post("/auth/login", credentials, config);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log("🧪 CSRF failed, falling back to test route");
        useTestRoutes = true;
        return api.post("/auth/test/login", credentials);
      }

      // Log detailed error for debugging
      console.error("❌ Login failed:", {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url,
        errors: error.response?.data?.errors || [],
      });

      throw error;
    }
  },

  async register(userData) {
    if (useTestRoutes) {
      console.log("🧪 Using test route for register");
      return api.post("/auth/test/register", userData);
    }

    try {
      if (!csrfToken) {
        await getCsrfToken();
      }

      const config = csrfToken
        ? {
            headers: { "X-CSRF-Token": csrfToken },
          }
        : {};

      return await api.post("/auth/register", userData, config);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log("🧪 CSRF failed, falling back to test route");
        useTestRoutes = true;
        return api.post("/auth/test/register", userData);
      }
      throw error;
    }
  },

  async logout() {
    if (useTestRoutes) {
      console.log("🧪 Using test route for logout");
      return api.post("/auth/test/logout");
    }

    try {
      if (!csrfToken) {
        await getCsrfToken();
      }

      const config = csrfToken
        ? {
            headers: { "X-CSRF-Token": csrfToken },
          }
        : {};

      return await api.post("/auth/logout", {}, config);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log("🧪 CSRF failed for logout, falling back to test route");
        useTestRoutes = true;
        return api.post("/auth/test/logout");
      }
      throw error;
    }
  },
};

// User and session APIs
export const userAPI = {
  async getUserData() {
    return api.get("/user/data");
  },
};

export const sessionAPI = {
  async getSessions() {
    return api.get("/session");
  },

  async revokeSession(sessionId) {
    return api.delete(`/session/${sessionId}`);
  },

  async revokeAllSessions() {
    return api.delete("/session");
  },
};

// Initialize CSRF token on app start
getCsrfToken();

export default api;
export { getCsrfToken };
