// src/pages/settings/SessionsPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import {
  Laptop,
  Smartphone,
  Globe,
  AlertTriangle,
  Loader,
  RefreshCcw,
  X,
  Clock,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const SessionsPage = () => {
  const { getSessions, revokeSession, revokeAllSessions } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getSessions();
      if (result.success) {
        setSessions(result.data.sessions);
      } else {
        setError(result.message || "Failed to load sessions");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId) => {
    setActionInProgress(true);

    try {
      const result = await revokeSession(sessionId);
      if (result.success) {
        setSessions(sessions.filter((session) => session.id !== sessionId));
      } else {
        setError(result.message || "Failed to revoke session");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRevokeAll = async () => {
    if (
      !window.confirm("Are you sure you want to sign out of all other devices?")
    ) {
      return;
    }

    setActionInProgress(true);

    try {
      const result = await revokeAllSessions();
      if (result.success) {
        // Keep only the current session
        setSessions(sessions.filter((session) => session.isCurrent));
      } else {
        setError(result.message || "Failed to revoke all sessions");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setActionInProgress(false);
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent.toLowerCase().includes("mobile")) {
      return <Smartphone className="w-5 h-5" />;
    } else if (userAgent.toLowerCase().includes("tablet")) {
      return <Tablet className="w-5 h-5" />;
    } else {
      return <Laptop className="w-5 h-5" />;
    }
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const getTimeAgo = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 mb-4 text-primary animate-spin" />
        <p className="text-sm text-gray-600">Loading active sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Sessions</h2>
          <p className="text-sm text-gray-500">
            These are the devices that have logged into your account
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSessions}
          disabled={actionInProgress}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center p-3 text-sm text-red-800 border border-red-300 rounded-md bg-red-50">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="p-8 text-center bg-muted rounded-lg">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-medium">No active sessions</h3>
            <p className="text-sm text-muted-foreground">
              There are no other devices currently signed into your account.
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 border rounded-lg ${
                session.isCurrent ? "border-primary/20 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-muted rounded-full">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {session.deviceInfo || "Unknown Device"}
                      {session.isCurrent && (
                        <span className="ml-2 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      IP: {session.ipAddress}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Last active {getTimeAgo(session.lastActive)} -{" "}
                      {formatTime(session.lastActive)}
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(session.id)}
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Sign out
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {sessions.length > 1 && (
        <div className="pt-6 border-t">
          <Button
            variant="destructive"
            onClick={handleRevokeAll}
            disabled={actionInProgress}
          >
            {actionInProgress ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              "Sign out of all other devices"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
