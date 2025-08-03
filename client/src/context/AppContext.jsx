import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {AuthProvider} from "./AuthProvider.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

export const AppContext = createContext();

// Configure axios defaults
axios.defaults.withCredentials = true;

export const AppContextProvider = ({ children }) => {
  // const auth = useAuth();

  // const backendUrl =
  //   import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userData, setUserData] = useState(null);
  //
  // // Configure axios to always include credentials
  // axios.defaults.withCredentials = true;
  //
  // const getAuthState = async () => {
  //   try {
  //     const { data } = await axios.get(`${backendUrl}/auth/is-authenticated`, {
  //       withCredentials: true,
  //     });
  //
  //     if (data.success) {
  //       setIsLoggedIn(true);
  //       await getUserData();
  //     } else {
  //       setIsLoggedIn(false);
  //       setUserData(null);
  //     }
  //   } catch (error) {
  //     // Don't log 401 errors as they are expected when not authenticated
  //     if (error.response?.status !== 401) {
  //       console.error("Error fetching auth state:", error);
  //     }
  //     setIsLoggedIn(false);
  //     setUserData(null);
  //   }
  // };
  //
  // const getUserData = async () => {
  //   try {
  //     const { data } = await axios.get(`${backendUrl}/user/data`, {
  //       withCredentials: true,
  //     });
  //     if (data.success) {
  //       setUserData(data.userData);
  //     } else {
  //       toast.error(data.message || "Failed to fetch user data");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //     toast.error(error.response?.data?.message || error.message);
  //   }
  // };
  //
  // useEffect(() => {
  //   getAuthState();
  // }, []);
  //
  // const value = {
  //   backendUrl,
  //   isLoggedIn,
  //   setIsLoggedIn,
  //   userData,
  //   setUserData,
  //   getUserData,
  // };

    const value = {
      // ...auth,
    }
  return <AppContext.Provider value={value}>
    {children}
  </AppContext.Provider>;


};
