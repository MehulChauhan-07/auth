// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Separator } from "../../components/ui/separator";
import { AlertCircle, Check, Loader, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // MFA related states
  const [showMfa, setShowMfa] = useState(false);
  const [userId, setUserId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  const navigate = useNavigate();
  const { user, login, verifyMfaLogin, oauthLogin } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({ email, password, rememberMe });

      if (result.success) {
        if (result.mfaRequired) {
          setShowMfa(true);
          setUserId(result.userId);
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let result;

      if (useBackupCode) {
        result = await verifyMfaLogin(userId, null, backupCode);
      } else {
        result = await verifyMfaLogin(userId, mfaCode);
      }

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "MFA verification failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    oauthLogin(provider);
  };

  if (showMfa) {
    return (
      <div className="flex min-h-screen bg-muted/20">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="mt-6 text-2xl font-bold text-center text-gray-900">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-sm text-center text-gray-600">
              {useBackupCode
                ? "Enter a backup code"
                : "Enter the code from your authenticator app"}
            </p>

            <form onSubmit={handleMfaSubmit} className="mt-6 space-y-6">
              {error && (
                <div className="flex items-center p-3 text-sm text-red-800 border border-red-300 rounded-md bg-red-50">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {!useBackupCode ? (
                <div>
                  <label
                    htmlFor="mfaCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Authentication Code
                  </label>
                  <Input
                    id="mfaCode"
                    name="mfaCode"
                    type="text"
                    value={mfaCode}
                    onChange={(e) =>
                      setMfaCode(
                        e.target.value.replace(/\D/g, "").substring(0, 6)
                      )
                    }
                    placeholder="6-digit code"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="backupCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Backup Code
                  </label>
                  <Input
                    id="backupCode"
                    name="backupCode"
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    required
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => setUseBackupCode(!useBackupCode)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {useBackupCode
                    ? "Use authenticator app instead"
                    : "Use a backup code instead"}
                </button>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Sign in</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthLogin("google")}
                    className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <img
                      src={assets.google_icon}
                      alt="Google"
                      className="w-4 h-4 mr-2"
                    />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthLogin("github")}
                    className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <img
                      src={assets.github_icon}
                      alt="GitHub"
                      className="w-4 h-4 mr-2"
                    />
                    GitHub
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter>
              <div className="text-sm text-center w-full">
                <span className="text-muted-foreground">
                  Don't have an account?
                </span>{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
