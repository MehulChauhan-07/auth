import userModel from "../models/user.model.js";
import { AUTH_ERRORS } from "../constants/error.constants.js";

/**
 * Get all active sessions for a user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with active sessions
 */
export const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_ERRORS.USER_NOT_FOUND,
      });
    }

    // Get active sessions without sensitive data
    const sessions = user.activeSessions.map((session) => ({
      id: session._id,
      deviceInfo: session.deviceInfo,
      ipAddress: maskIpAddress(session.ipAddress), // Mask IP for privacy
      lastActive: session.lastActive,
      isCurrent: session.tokenIdentifier === req.currentSessionId,
    }));

    return res.json({
      success: true,
      data: {
        sessions,
      },
    });
  } catch (error) {
    console.error("Error in getActiveSessions:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Revoke a specific session
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.sessionId - Session ID to revoke
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 */
export const revokeSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_ERRORS.USER_NOT_FOUND,
      });
    }

    // Find the session
    const sessionIndex = user.activeSessions.findIndex(
      (session) => session._id.toString() === sessionId
    );

    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if trying to revoke current session
    const sessionToRemove = user.activeSessions[sessionIndex];
    if (sessionToRemove.tokenIdentifier === req.currentSessionId) {
      return res.status(400).json({
        success: false,
        message: "Cannot revoke current session. Use logout instead.",
      });
    }

    // Remove the session
    user.activeSessions.splice(sessionIndex, 1);
    await user.save();

    return res.json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    console.error("Error in revokeSession:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Revoke all sessions except current
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 */
export const revokeAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_ERRORS.USER_NOT_FOUND,
      });
    }

    // Keep only current session
    const currentSession = user.activeSessions.find(
      (session) => session.tokenIdentifier === req.currentSessionId
    );

    user.activeSessions = currentSession ? [currentSession] : [];
    await user.save();

    return res.json({
      success: true,
      message: "All other sessions revoked successfully",
    });
  } catch (error) {
    console.error("Error in revokeAllSessions:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper to mask IP address for privacy
function maskIpAddress(ip) {
  if (!ip) return "Unknown";

  // For IPv4
  if (ip.includes(".")) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.*.*`;
  }

  // For IPv6
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts[0]}:${parts[1]}:****:****`;
  }

  return ip;
}
