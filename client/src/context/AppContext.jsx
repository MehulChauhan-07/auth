import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

// Configure axios defaults
axios.defaults.withCredentials = true;

// Configure axios to handle 401 errors silently (for auth checks)
axios.interceptors.response.use(
  response => response, 
  error => {
    // Don't show toast for 401 errors from authentication checks
    if (error.response?.status === 401 && 
        (error.config.url.includes('/is-authenticated') || 
         error.config.url.includes('/user/data'))) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Configure axios to always include credentials
  axios.defaults.withCredentials = true;

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/auth/is-authenticated`, {
        withCredentials: true
      });
      
      if(data.success) {
        setIsLoggedIn(true);
        await getUserData();
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching auth state:", error);
      // Don't show error toast here, just handle the error gracefully
      setIsLoggedIn(false);
      setUserData(null);
    }
  };
  
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user/data`, {
        withCredentials: true,
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);
  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };
  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};
