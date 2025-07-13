import React, { useState, useContext } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);
  const [state, setState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault(); // Call this as a function, not a property

      // Check the state case-insensitively
      if (state.toLowerCase() === "sign up") {
        const response = await axios.post(
          `${backendUrl}/auth/register`,
          {
            name,
            email,
            password,
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          // Store the token in localStorage as a backup
          if (response.data.token) {
            localStorage.setItem("authToken", response.data.token);
          }
          setIsLoggedIn(true);
          getUserData();
          toast.success("Registration successful! You are now logged in.");
          navigate("/");
        }
      } else {
        const response = await axios.post(`${backendUrl}/auth/login`, {
          email,
          password,
        });

        if (response.data.success) {
          setIsLoggedIn(true);
          getUserData();
          toast.success("Login successful!");
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred during authentication"
      );
      console.error("Error during authentication:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400 ">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 top-5 sm:left-20 w-28 sm:w-32 cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Sign up" : "Sign In"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up" ? "Create an account" : "Login to your account"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state.toLowerCase() === "sign up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 bg-[#333A5C] rounded-full">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full name"
                className="bg-transparent outline-none"
                required
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 bg-[#333A5C] rounded-full">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="text"
              placeholder="Email"
              className="bg-transparent outline-none"
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 bg-[#333A5C] rounded-full">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none"
              required
            />
          </div>
          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer"
          >
            Forgot password?
          </p>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to bg-indigo-900 rounded-full text-white font-medium"
          >
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer underline"
              onClick={() => setState("Login")}
            >
              Login
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer underline"
              onClick={() => setState("Sign Up")}
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
