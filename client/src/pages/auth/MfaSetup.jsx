// src/components/auth/MfaSetup.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AlertCircle, Check, Copy, Loader } from "lucide-react";

export const MfaSetup = () => {
  const { setupMfa, verifyMfa } = useAuth();

  const [step, setStep] = useState("setup"); // setup, verify, backup-codes
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await setupMfa();

      if (result.success) {
        setSecret(result.secret);
        setQrCode(result.qrCode);
        setStep("verify");
      } else {
        setError(result.message || "Failed to setup MFA");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await verifyMfa(token);

      if (result.success) {
        setBackupCodes(result.backupCodes);
        setStep("backup-codes");
      } else {
        setError(result.message || "Failed to verify MFA");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (step === "setup") {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900">
          Set up Two-Factor Authentication
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Two-factor authentication adds an extra layer of security to your
          account. When enabled, you'll need your password and an authentication
          code to sign in.
        </p>

        <div className="mt-6">
          <Button onClick={handleSetup} disabled={loading}>
            {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            Set up two-factor authentication
          </Button>
        </div>

        {error && (
          <div className="flex items-center p-3 mt-4 text-sm text-red-800 border border-red-300 rounded-md bg-red-50">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
        <p className="mt-2 text-sm text-gray-600">
          Scan the QR code with your authenticator app, then enter the
          verification code.
        </p>

        <div className="flex flex-col items-center mt-6 space-y-6 md:flex-row md:items-start md:space-y-0 md:space-x-6">
          <div className="p-3 bg-white border rounded-lg">
            <img src={qrCode} alt="QR Code" className="w-40 h-40" />
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Manual entry code:
              </h3>
              <div className="flex items-center mt-1">
                <code className="p-2 text-sm bg-gray-100 rounded">
                  {secret}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(secret)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleVerify}>
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verification Code
                </label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, "").substring(0, 6))
                  }
                  placeholder="000000"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  className="mt-1"
                />
              </div>

              <div className="flex mt-4 space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Verify
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("setup")}
                >
                  Cancel
                </Button>
              </div>
            </form>

            {error && (
              <div className="flex items-center p-3 mt-4 text-sm text-red-800 border border-red-300 rounded-md bg-red-50">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "backup-codes") {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-md mb-6">
          <Check className="w-5 h-5 mr-2" />
          <span>Two-factor authentication has been enabled!</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          Save Your Backup Codes
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Store these backup codes in a safe place. You can use them to sign in
          if you lose access to your authenticator app. Each code can only be
          used once.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className="p-2 text-sm font-mono bg-gray-100 rounded"
            >
              {code}
            </div>
          ))}
        </div>

        <div className="flex mt-6 space-x-4">
          <Button
            onClick={() => copyToClipboard(backupCodes.join("\n"))}
            variant="outline"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy codes
          </Button>
          <Button onClick={() => window.print()}>Print codes</Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={() => (window.location.href = "/settings/security")}
            variant="link"
          >
            Return to settings
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
