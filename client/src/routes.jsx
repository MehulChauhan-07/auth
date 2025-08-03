// src/routes.jsx
import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Auth Pages
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";

// Dashboard Pages
import DashboardPage from "./pages/Dashboard/Dashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import SecurityPage from "./pages/settings/SecurityPage";
import SessionsPage from "./pages/settings/SessionsPage";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public route wrapper (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Create and export the router configuration
export const createRouter = () => {
  return createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
      ],
    },
    {
      path: "/",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: (
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          ),
        },
        {
          path: "register",
          element: (
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          ),
        },
        {
          path: "forgot-password",
          element: (
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          ),
        },
        {
          path: "reset-password",
          element: (
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          ),
        },
        {
          path: "oauth-callback",
          element: <OAuthCallbackPage />,
        },
      ],
    },
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "settings/security",
          element: (
            <ProtectedRoute>
              <SecurityPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "settings/sessions",
          element: (
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);
};
