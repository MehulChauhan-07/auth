import React, { useState, useContext, useRef } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContext);
  const inputRefs = useRef([]);

  // Handler to send the reset password OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    console.log("Starting reset password process for email:", email);
    console.log("Current backendUrl value:", backendUrl);
    setLoading(true);

    if (!email) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // For debugging
      // Remove the /api prefix since it's already in the backendUrl
      console.log(
        "Making API request to:",
        `${backendUrl}/auth/forgot-password`
      );

      // Add credentials and extra debugging for CORS issues
      const response = await axios.post(
        `${backendUrl}/auth/forgot-password`,
        { email },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Response received:", response);

      const { data } = response;
      if (data && data.success) {
        toast.success("OTP sent to your email");
        setIsEmailSent(true);
      } else {
        toast.error(data?.message || "Failed to send OTP");
        console.error("API returned error:", data);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // If we get an error but it's a 404 (user not found), show a generic message
      // to avoid revealing which emails are registered
      if (error.response?.status === 404) {
        toast.info(
          "If this email is registered, you will receive an OTP shortly"
        );
        // We'll still proceed to next step to avoid revealing if the email exists
        setTimeout(() => {
          setIsEmailSent(true);
        }, 2000);
      } else {
        toast.error(
          error.response?.data?.message || error.message || "Failed to send OTP"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler to verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Collect OTP from all inputs
    const otpValue = inputRefs.current.map((input) => input.value).join("");
    console.log("Verifying OTP:", otpValue, "for email:", email);

    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    // Since our verify-otp endpoint requires authentication, we'll just store the OTP
    // and move to the password reset step. The actual verification will happen when
    // we submit the new password along with the OTP.
    setOtp(otpValue);
    setIsOtpSubmitted(true);
    setLoading(false);
    toast.success("Proceed to set your new password");
  };

  // Handler to reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword || newPassword.length < 8) {
      toast.error("Please enter a valid password (minimum 8 characters)");
      setLoading(false);
      return;
    }

    try {
      console.log("Making reset password request with:", {
        email,
        otp,
        newPassword,
      });

      // Use consistent API url format and parameter names that match the server
      console.log(
        "Reset password endpoint:",
        `${backendUrl}/auth/reset-password`
      );
      const response = await axios.post(
        `${backendUrl}/auth/reset-password`,
        {
          email,
          otp,
          newPassword, // The server expects this as 'newPassword'
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Reset password response:", response);

      const { data } = response;
      if (data && data.success) {
        toast.success("Password reset successful");
        navigate("/login");
      } else {
        toast.error(data?.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Provide more specific error messages based on response
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes("OTP")) {
          toast.error("Invalid or expired OTP. Please request a new one.");
          setIsOtpSubmitted(false);
          setIsEmailSent(false);
        } else {
          toast.error(
            error.response?.data?.message || "Failed to reset password"
          );
        }
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to reset password"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e, index) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = value.substring(0, 1); // Take only first digit

    // Auto-focus next input if value is entered
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Fix the typo in 'target'
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    // Handle paste event (Ctrl+V or Cmd+V)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").substring(0, 6).split("");

        // Fill the inputs with pasted digits
        digits.forEach((digit, i) => {
          if (i < inputRefs.current.length && inputRefs.current[i]) {
            inputRefs.current[i].value = digit;
          }
        });

        // Focus the next empty input or the last one
        const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
        if (inputRefs.current[nextEmptyIndex]) {
          inputRefs.current[nextEmptyIndex].focus();
        }
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        onClick={() => navigate("/")}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        alt=""
      />
      {/* { enter email id} */}
      {!isEmailSent && (
        <form
          onSubmit={handleSendOTP}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your registered email address
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} className="w-3 h-3" alt="" />
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent outline-none text-white w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset OTP"}
          </button>
        </form>
      )}
      {/* { otp input form } */}
      {!isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={handleVerifyOTP}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your Email:{" "}
            <strong className="text-white">{email}</strong>
          </p>
          <div className="flex justify-between mb-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength={1}
                  key={index}
                  required
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            Verify OTP
          </button>
          <p className="text-center mt-4 text-indigo-300 text-sm">
            <button
              type="button"
              onClick={() => setIsEmailSent(false)}
              className="text-blue-400 underline cursor-pointer"
            >
              Change email
            </button>
          </p>
        </form>
      )}
      {/* { enter new password} */}
      {isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={handleResetPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Set New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your new password
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} className="w-3 h-3" alt="" />
            <input
              type="password"
              placeholder="Enter your new password"
              className="bg-transparent outline-none text-white w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <p className="text-center mt-4 text-indigo-300 text-sm">
            <button
              type="button"
              onClick={() => setIsOtpSubmitted(false)}
              className="text-blue-400 underline cursor-pointer"
            >
              Back to OTP verification
            </button>
          </p>
        </form>
      )}
    </div>
  );
};
