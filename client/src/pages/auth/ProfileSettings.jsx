import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

export const ProfileSettings = () => {
  const {
    userData,
    updateProfile,
    setupMfa,
    enableMfa,
    disableMfa,
    backendUrl,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // MFA related states
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disableMfaPassword, setDisableMfaPassword] = useState("");
  const [showDisableMfa, setShowDisableMfa] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
    }
  }, [userData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile({ name, email });

      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSetup = async () => {
    setLoading(true);

    try {
      const result = await setupMfa();

      if (result.success) {
        setMfaSecret(result.secret);
        setMfaQrCode(result.qrCode);
        setShowMfaSetup(true);
      } else {
        toast.error(result.message || "Failed to setup MFA");
      }
    } catch (error) {
      console.error("MFA setup error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await enableMfa(mfaToken);

      if (result.success) {
        setBackupCodes(result.backupCodes);
        setShowBackupCodes(true);
        setShowMfaSetup(false);
        toast.success("MFA enabled successfully");
      } else {
        toast.error(result.message || "Failed to verify MFA token");
      }
    } catch (error) {
      console.error("MFA enable error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await disableMfa(disableMfaPassword);

      if (result.success) {
        setShowDisableMfa(false);
        toast.success("MFA disabled successfully");
      } else {
        toast.error(result.message || "Failed to disable MFA");
      }
    } catch (error) {
      console.error("MFA disable error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  if (showMfaSetup) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-slate-900 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Set up Two-Factor Authentication
        </h2>

        <div className="mb-8">
          <p className="text-indigo-300 mb-4">
            Scan this QR code with your authenticator app or enter the code
            manually:
          </p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-2 bg-white rounded-lg">
              <img src={mfaQrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            <div>
              <p className="text-indigo-300 mb-2">Manual entry code:</p>
              <div className="bg-[#333A5C] p-3 rounded-lg mb-4">
                <code className="text-indigo-200 break-all">{mfaSecret}</code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(mfaSecret);
                  toast.success("Secret copied to clipboard");
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleEnableMfa} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-indigo-300 mb-2">
              Enter the 6-digit code from your authenticator app:
            </label>
            <input
              id="token"
              type="text"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              className="w-full px-4 py-2 bg-[#333A5C] text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </button>
            <button
              type="button"
              onClick={() => setShowMfaSetup(false)}
              className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showBackupCodes) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-slate-900 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Save Your Backup Codes
        </h2>

        <div className="mb-6">
          <p className="text-indigo-300 mb-4">
            Store these backup codes in a safe place. You can use them to sign
            in if you lose access to your authenticator app. Each code can only
            be used once.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {backupCodes.map((code, index) => (
              <div key={index} className="bg-[#333A5C] p-3 rounded-lg">
                <code className="text-indigo-200">{code}</code>
              </div>
            ))}
          </div>

          <button
            onClick={copyBackupCodes}
            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
          >
            Copy All Codes
          </button>
        </div>

        <div>
          <button
            onClick={() => setShowBackupCodes(false)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            I've Saved My Backup Codes
          </button>
        </div>
      </div>
    );
  }

  if (showDisableMfa) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-slate-900 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Disable Two-Factor Authentication
        </h2>

        <form onSubmit={handleDisableMfa} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-indigo-300 mb-2">
              Enter your password to confirm:
            </label>
            <input
              id="password"
              type="password"
              value={disableMfaPassword}
              onChange={(e) => setDisableMfaPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#333A5C] text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Your password"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
            <button
              type="button"
              onClick={() => setShowDisableMfa(false)}
              className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Profile Settings
      </h2>

      <div className="mb-10">
        <h3 className="text-xl font-medium text-white mb-4">
          Profile Information
        </h3>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-indigo-300 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#333A5C] text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-indigo-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#333A5C] text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="pt-6 border-t border-gray-700">
        <h3 className="text-xl font-medium text-white mb-4">Security</h3>

        <div className="mb-6">
          <h4 className="text-lg font-medium text-indigo-300 mb-2">
            Two-Factor Authentication
          </h4>
          <p className="text-gray-400 mb-4">
            Add an extra layer of security to your account by enabling
            two-factor authentication.
          </p>

          {userData?.mfaEnabled ? (
            <div className="flex items-center">
              <span className="flex items-center text-green-400 mr-4">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Enabled
              </span>
              <button
                onClick={() => setShowDisableMfa(true)}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Disable
              </button>
            </div>
          ) : (
            <button
              onClick={handleMfaSetup}
              disabled={loading}
              className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Setup 2FA"}
            </button>
          )}
        </div>

        <div>
          <h4 className="text-lg font-medium text-indigo-300 mb-2">
            Connected Accounts
          </h4>
          <p className="text-gray-400 mb-4">
            Link your accounts for easier login and enhanced security.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#333A5C] rounded-lg">
              <div className="flex items-center">
                <img
                  src={assets.google_icon}
                  alt="Google"
                  className="w-6 h-6 mr-3"
                />
                <span className="text-white">Google</span>
              </div>
              {userData?.socialAuth?.google?.id ? (
                <span className="text-green-400">Connected</span>
              ) : (
                <button
                  onClick={() => {
                    // Use the auth provider function
                    window.location.href = `${backendUrl}/auth/google`;
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Connect
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-[#333A5C] rounded-lg">
              <div className="flex items-center">
                <img
                  src={assets.github_icon}
                  alt="GitHub"
                  className="w-6 h-6 mr-3"
                />
                <span className="text-white">GitHub</span>
              </div>
              {userData?.socialAuth?.github?.id ? (
                <span className="text-green-400">Connected</span>
              ) : (
                <button
                  onClick={() => {
                    // Use the auth provider function
                    window.location.href = `${backendUrl}/auth/github`;
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
