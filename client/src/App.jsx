import React from "react";
// import './App.css'
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { ResetPassword } from "./pages/auth/ResetPassword.jsx";
import { EmailVerify } from "./pages/auth/EmailVerify.jsx";
import Navbar from "./components/Layout/Navbar.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <div>
      {/* <Navbar /> */}
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerify />} />
      </Routes>
    </div>
  );
}

export default App;
