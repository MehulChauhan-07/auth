// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { AlertCircle, Mail, ArrowLeft, Check } from "lucide-react";
import axios from "axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${baseUrl}/api/auth/forgot-password`, { email });

      setIsSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We've sent password reset instructions to your email
              </p>
            </div>

            <Card className="shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                  Email sent!
                </CardTitle>
                <CardDescription className="text-center">
                  We've sent a password reset link to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Click the link in the email to reset your password. If you
                    don't see the email, check your spam folder.
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email?
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Try again
                  </Button>
                </div>
              </CardContent>

              <CardFooter>
                <div className="text-sm text-center w-full">
                  <Link
                    to="/login"
                    className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Forgot password?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No worries! Enter your email and we'll send you reset instructions
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Reset password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a link to reset your
                password
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
                    className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Mail className="w-4 h-4 mr-2 animate-pulse" />
                      Sending email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send reset link
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter>
              <div className="text-sm text-center w-full">
                <Link
                  to="/login"
                  className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
