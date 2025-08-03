import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { userAPI, sessionAPI } from "../../lib/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Shield,
  LogOut,
  User,
  Mail,
  CheckCircle,
  XCircle,
  Monitor,
  Smartphone,
  Globe,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data and sessions in parallel
      const [userResponse, sessionsResponse] = await Promise.all([
        userAPI.getUserData(),
        sessionAPI.getSessions(),
      ]);

      if (userResponse.data.success) {
        setUserStats(userResponse.data.user);
      }

      if (sessionsResponse.data.success) {
        setSessions(sessionsResponse.data.sessions || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const response = await sessionAPI.revokeSession(sessionId);
      if (response.data.success) {
        setSessions(sessions.filter((session) => session._id !== sessionId));
      }
    } catch (err) {
      console.error("Error revoking session:", err);
      setError(err.response?.data?.message || "Failed to revoke session");
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      const response = await sessionAPI.revokeAllSessions();
      if (response.data.success) {
        // This will log out the user since all sessions are revoked
        await logout();
      }
    } catch (err) {
      console.error("Error revoking all sessions:", err);
      setError(err.response?.data?.message || "Failed to revoke all sessions");
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🔍 Dashboard logout initiated...");
      const result = await logout();

      if (result.success) {
        console.log("✅ Logout successful, redirecting to login...");
        navigate("/login");
      } else {
        console.error("❌ Logout failed:", result.message);
        setError(result.message || "Logout failed");
      }
    } catch (err) {
      console.error("❌ Logout error:", err);
      // Even if there's an error, try to redirect since user state should be cleared
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name}!
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Account Status Card */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Status
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {userStats?.isVerified || user?.isAccountVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-2xl font-bold">
                  {userStats?.isVerified || user?.isAccountVerified
                    ? "Verified"
                    : "Unverified"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Email verification status
              </p>
            </CardContent>
          </Card>

          {/* MFA Status Card */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Two-Factor Auth
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {userStats?.mfaEnabled || user?.mfaEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-2xl font-bold">
                  {userStats?.mfaEnabled || user?.mfaEnabled
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Security enhancement status
              </p>
            </CardContent>
          </Card>

          {/* Active Sessions Card */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Sessions
              </CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Devices currently signed in
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Information Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your personal account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Full Name</span>
                </div>
                <p className="text-lg font-medium">
                  {userStats?.name || user?.name}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </div>
                <p className="text-lg font-medium">
                  {userStats?.email || user?.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Account Security</p>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      userStats?.isVerified || user?.isAccountVerified
                        ? "default"
                        : "secondary"
                    }
                    className="flex items-center space-x-1"
                  >
                    {userStats?.isVerified || user?.isAccountVerified ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span>
                      {userStats?.isVerified || user?.isAccountVerified
                        ? "Verified"
                        : "Unverified"}
                    </span>
                  </Badge>
                  <Badge
                    variant={
                      userStats?.mfaEnabled || user?.mfaEnabled
                        ? "default"
                        : "outline"
                    }
                    className="flex items-center space-x-1"
                  >
                    <Shield className="h-3 w-3" />
                    <span>
                      {userStats?.mfaEnabled || user?.mfaEnabled
                        ? "2FA Enabled"
                        : "2FA Disabled"}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions Management */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Session Management</span>
                </CardTitle>
                <CardDescription>
                  Monitor and manage your active sessions across all devices
                </CardDescription>
              </div>
              {sessions.length > 1 && (
                <Button
                  onClick={handleRevokeAllSessions}
                  variant="destructive"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Revoke All Sessions</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No active sessions found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <Card
                    key={session._id || index}
                    className="border border-muted"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(session.userAgent)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">
                                  {session.deviceInfo || "Unknown Device"}
                                </h4>
                                {session.isCurrent && (
                                  <Badge variant="default" className="text-xs">
                                    Current Session
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                              <Globe className="h-3 w-3" />
                              <span>IP: {session.ipAddress || "Unknown"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Last Active:{" "}
                                {session.lastActive
                                  ? new Date(
                                      session.lastActive
                                    ).toLocaleString()
                                  : "Unknown"}
                              </span>
                            </div>
                          </div>

                          {session.userAgent && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">User Agent:</span>
                              <p className="truncate mt-1">
                                {session.userAgent}
                              </p>
                            </div>
                          )}
                        </div>

                        {!session.isCurrent && (
                          <Button
                            onClick={() => handleRevokeSession(session._id)}
                            variant="outline"
                            size="sm"
                            className="ml-4 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
