import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { format, formatDistanceToNow } from "date-fns";

export const SessionsManagement = () => {
    const { getActiveSessions, revokeSession, revokeAllSessions } = useAuth();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);

        try {
            const result = await getActiveSessions();

            if (result.success) {
                setSessions(result.sessions);
            } else {
                toast.error(result.message || "Failed to fetch sessions");
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
            toast.error("An error occurred while fetching sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        setActionLoading(true);

        try {
            const result = await revokeSession(sessionId);

            if (result.success) {
                // Remove the session from the list
                setSessions(sessions.filter(session => session.id !== sessionId));
                toast.success("Session revoked successfully");
            } else {
                toast.error(result.message || "Failed to revoke session");
            }
        } catch (error) {
            console.error("Error revoking session:", error);
            toast.error("An error occurred while revoking the session");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeAllSessions = async () => {
        if (window.confirm("Are you sure you want to revoke all other sessions?")) {
            setActionLoading(true);

            try {
                const result = await revokeAllSessions();

                if (result.success) {
                    // Keep only the current session
                    setSessions(sessions.filter(session => session.isCurrent));
                    toast.success("All other sessions revoked successfully");
                } else {
                    toast.error(result.message || "Failed to revoke sessions");
                }
            } catch (error) {
                console.error("Error revoking all sessions:", error);
                toast.error("An error occurred while revoking sessions");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, "MMM d, yyyy 'at' h:mm a");
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-slate-900 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Active Sessions</h2>
                <button
                    onClick={fetchSessions}
                    disabled={loading}
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                    <svg
                        className="w-4 h-4 inline-block mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        ></path>
                    </svg>
                    Refresh
                </button>
            </div>

            <div className="mb-6">
                <p className="text-indigo-300 text-sm">
                    These are the devices that have logged into your account. Revoke any sessions that you don't recognize.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <svg
                        className="animate-spin h-8 w-8 mx-auto text-indigo-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <p className="text-indigo-300 mt-3">Loading sessions...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-indigo-300">No active sessions found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`p-4 rounded-lg ${
                                session.isCurrent
                                    ? "bg-indigo-900 bg-opacity-20 border border-indigo-700"
                                    : "bg-[#333A5C]"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-medium text-white">{session.deviceInfo}</div>
                                    <div className="text-gray-400 text-sm mt-1">
                                        IP: {session.ipAddress}
                                    </div>
                                    <div className="text-gray-400 text-sm mt-1">
                                        Last active: {getTimeAgo(session.lastActive)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(session.lastActive)}
                                    </div>
                                    {session.isCurrent && (
                                        <span className="inline-block mt-2 px-2 py-1 bg-indigo-700 bg-opacity-50 text-indigo-200 text-xs rounded">
                      Current Session
                    </span>
                                    )}
                                </div>

                                {!session.isCurrent && (
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        disabled={actionLoading}
                                        className={`px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 ${
                                            actionLoading ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        Revoke
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {sessions.length > 1 && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <button
                                onClick={handleRevokeAllSessions}
                                disabled={actionLoading}
                                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${
                                    actionLoading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                            >
                                Revoke All Other Sessions
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};