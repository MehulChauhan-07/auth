import Session from "../models/session.model.js";
import { AUTH_ERRORS } from "../constants/error.constants.js";
import logger from "../utils/logger.js";

/**
 * Get all active sessions for the current user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user sessions or error message
 */
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessions = await Session.find({
      userId,
      isActive: true,
    }).select("-refreshToken"); // Don't send tokens to client

    return res.json({
      success: true,
      sessions: sessions,
    });
  } catch (error) {
    logger.error("Error fetching user sessions:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Terminate a specific session
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.sessionId - ID of the session to terminate
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status or error message
 */
export const terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await Session.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Deactivate the session
    session.isActive = false;
    await session.save();

    return res.json({
      success: true,
      message: "Session terminated successfully",
    });
  } catch (error) {
    logger.error("Error terminating session:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Terminate all sessions except current one
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status or error message
 */
export const terminateAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentSessionId = req.sessionId; // This would be set in auth middleware

    // Deactivate all other sessions
    await Session.updateMany(
      { userId, isActive: true, _id: { $ne: currentSessionId } },
      { isActive: false }
    );

    return res.json({
      success: true,
      message: "All other sessions terminated successfully",
    });
  } catch (error) {
    logger.error("Error terminating all sessions:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};
