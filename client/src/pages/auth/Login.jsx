import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthProvider";
import { assets } from "../../assets/assets";

export const Login = () => {
  const navigate = useNavigate();
  const { login, oauthLogin, verifyMfa, isLoggedIn } = useAuth();

  const [formType, setFormType] = useState("Sign In");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // MFA related states
  const [showMfa, setShowMfa] = useState(false);
  const [userId, setUserId] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [mfaEmail, setMfaEmail] = useState("");
  const [mfaPassword, setMfaPassword] = useState("");

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        if (result.mfaRequired) {
          // Show MFA verification screen
          setShowMfa(true);
          setUserId(result.userId);
          setMfaEmail(result.email);
          setMfaPassword(result.password);
          toast.info("Please enter the authentication code from your app");
        } else {
          // Regular login successful
          toast.success("Login successful!");
          navigate("/");
        }
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = useBackupCode
        ? await verifyMfa(mfaEmail, mfaPassword, null, backupCode)
        : await verifyMfa(mfaEmail, mfaPassword, mfaToken);

      if (result.success) {
        toast.success("Authentication successful!");
        navigate("/");
      } else {
        toast.error(result.message || "Authentication failed");
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during verification"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    oauthLogin(provider);
  };

  // Handle showing backup code form
  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setMfaToken("");
    setBackupCode("");
  };

  if (showMfa) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt=""
          className="absolute left-5 top-5 sm:left-20 w-28 sm:w-32 cursor-pointer"
        />
        <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
          <h2 className="text-3xl font-semibold text-white text-center mb-3">
            Two-Factor Authentication
          </h2>
          <p className="text-center text-sm mb-6">
            {useBackupCode
              ? "Enter a backup code from your list"
              : "Enter the 6-digit code from your authenticator app"}
          </p>

          <form onSubmit={handleMfaSubmit}>
            {!useBackupCode ? (
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 bg-[#333A5C] rounded-full">
                <img src={assets.shield_icon} alt="" />
                <input
                  onChange={(e) => setMfaToken(e.target.value)}
                  value={mfaToken}
                  type="text"
                  placeholder="Authentication code"
                  className="bg-transparent outline-none w-full"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 bg-[#333A5C] rounded-full">
                <img src={assets.key_icon} alt="" />
                <input
                  onChange={(e) => setBackupCode(e.target.value)}
                  value={backupCode}
                  type="text"
                  placeholder="Backup code (XXXX-XXXX-XXXX)"
                  className="bg-transparent outline-none w-full"
                  required
                  pattern="[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={toggleBackupCode}
                className="text-xs text-indigo-400 hover:underline"
              >
                {useBackupCode
                  ? "Use authentication app instead"
                  : "Use a backup code instead"}
              </button>
            </div>

            <button
              disabled={loading}
              className={`text-white bg-indigo-600 hover:bg-indigo-700 w-full py-2.5 rounded-full transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              type="submit"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 top-5 sm:left-20 w-28 sm:w-32 cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {formType === "Sign Up" ? "Sign up" : "Sign In"}
        </h2>
        <p className="text-center text-sm mb-6">
          {formType === "Sign Up"
            ? "Create an account"
            : "Login to your account"}
        </p>

        <form onSubmit={handleLoginSubmit}>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 bg-[#333A5C] rounded-full">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email address"
              className="bg-transparent outline-none w-full"
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
              className="bg-transparent outline-none w-full"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-xs text-gray-400"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-xs text-indigo-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            disabled={loading}
            className={`text-white bg-indigo-600 hover:bg-indigo-700 w-full py-2.5 rounded-full transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            type="submit"
          >
            {loading ? "Please wait..." : "Sign In"}
          </button>

          <div className="mt-5 text-center text-xs">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-400 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className="flex justify-center items-center py-2.5 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <img
                  src={assets.google_icon}
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                className="flex justify-center items-center py-2.5 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <img
                  src={assets.github_icon}
                  alt="GitHub"
                  className="w-5 h-5 mr-2"
                />
                GitHub
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
