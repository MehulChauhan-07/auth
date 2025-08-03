import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import { ResetPassword } from "./pages/auth/ResetPassword.jsx";
import { EmailVerify } from "./pages/auth/EmailVerify.jsx";
import Navbar from "./components/Layout/Navbar.jsx";
import Footer from "./components/Layout/Footer.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./hooks/useAuth.jsx";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import RegisterPage from "./pages/auth/Register.jsx";
import ProfilePage from "./pages/auth/Profile.jsx";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mern-auth-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <main className="flex-1">
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/email-verify" element={<EmailVerify />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
