import {
  generateMfaSecret,
  verifyMfaToken,
  enableMfa,
  disableMfa,
  verifyBackupCode,
} from "../services/mfa.services.js";
import logger from "../utils/logger.js";

/**
 * Setup MFA for a user (generates secret and QR code)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const setupMfa = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await generateMfaSecret(userId);

    return res.json({
      success: true,
      message: "MFA setup initialized",
      data: result,
    });
  } catch (error) {
    logger.error("Error in setupMfa controller", { error: error.message });
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Verify MFA token and enable MFA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyAndEnableMfa = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.userId;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const result = await enableMfa(userId, token);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error("Error in verifyAndEnableMfa controller", {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Disable MFA for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const disableMfaForUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await disableMfa(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error("Error in disableMfaForUser controller", {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Verify MFA during login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyMfaLogin = async (req, res) => {
  try {
    const { userId, token, backupCode } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!token && !backupCode) {
      return res.status(400).json({
        success: false,
        message: "Verification code or backup code is required",
      });
    }

    let isValid = false;

    if (token) {
      isValid = await verifyMfaToken(userId, token);
    } else if (backupCode) {
      isValid = await verifyBackupCode(userId, backupCode);
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Get complete user info from session
    const user = req.session.user;

    // Generate tokens and complete login
    const { accessToken, refreshToken } = generateTokenPair(userId);

    // Set cookies and return response as in your regular login flow
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    logger.error("Error in verifyMfaLogin controller", {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
