import React, { useContext, useRef } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { useEffect } from "react";
import { toast } from "react-toastify";

// Configure axios to send credentials with requests
axios.defaults.withCredentials = true;

export const EmailVerify = () => {
  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContext);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

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

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      // Collect OTP from all input fields and join without spaces
      const otpArray = inputRefs.current.map((input) => input?.value || "");
      const otp = otpArray.join("");

      // Check if OTP is complete
      if (otp.length !== 6) {
        toast.error("Please enter the complete 6-digit OTP");
        return;
      }

      // Make API call with correct URL (adding /api/ prefix)
      const { data } = await axios.post(
        `${backendUrl}/auth/verify-otp`,
        {
          otp,
        },
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        // Use data.message instead of error.message
        toast.error(data.message || "Verification failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during verification"
      );
      console.error("Verification error:", error);
    }
  };

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedIn, userData]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your Email
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
          // onClick={(e) => {
          //   e.preventDefault();
          //   // Collect OTP from inputs
          //   const otpValue = Array.from(inputRefs.current)
          //     .map((input) => input?.value || "")
          //     .join("");

          //   if (otpValue.length === 6) {
          //     // Here you would call your API to verify the OTP
          //     console.log("Verifying OTP:", otpValue);
          //     // Example: verifyOTP(otpValue);
          //   } else {
          //     alert("Please enter the complete 6-digit OTP");
          //   }
          // }}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full"
        >
          Verify Email
        </button>
      </form>
    </div>
  );
};
