// import { use } from "passport";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateMfaSecret,
  verifyMfaToken,
  enableMfa,
  disableMfa,
  verifyBackupCode,
} from "../services/mfa.services.js";
import logger from "../utils/logger.js";
import userModel from "../models/user.model.js";

/**
 * Setup MFA for a user (generates secret and QR code)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with MFA setup data
 */
export const setupMfa = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate MFA secret and QR code
    const { secret, qrCode } = await generateMfaSecret(userId);

    return res.json({
      success: true,
      message: "MFA setup initialized",
      data: { secret, qrCode },
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
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.token - Token from authenticator app
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with backup codes
 */
export const verifyAndEnableMfa = async (req, res) => {
  try {
    const userId = req.user.userId;
    const token = req.body.token;

    logger.info("MFA verification attempt", {
      userId,
      tokenLength: token?.length,
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Verify the MFA token
    const isValid = await verifyMfaToken(userId, token);
    logger.info("MFA token verification result", { userId, isValid });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Enable MFA and generate backup codes (token already verified above)
    const result = await enableMfa(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to enable MFA",
      });
    }

    return res.json({
      success: true,
      message: "MFA enabled successfully",
      data: { backupCodes: result.backupCodes },
    });
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
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.password - User's password for confirmation
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 */
export const disableMfaForUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: AUTH_ERRORS.PASSWORD_REQUIRED,
      });
    }

    // const result = await disableMfa(userId);
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_ERRORS.USER_NOT_FOUND,
      });
    }

    // Verify the password
    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: AUTH_ERRORS.INVALID_CREDENTIALS,
      });
    }

    // Disable MFA
    await disableMfa(userId);

    return res.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error) {
    console.error("Error in disableMfaController:", error);
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
    const { email, password, token, backupCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!token && !backupCode) {
      return res.status(400).json({
        success: false,
        message: "Verification code or backup code is required",
      });
    }

    // First, find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify either token or backup code
    let isValid = false;

    if (token) {
      isValid = await verifyMfaToken(user._id.toString(), token);
    } else if (backupCode) {
      isValid = await verifyBackupCode(user._id.toString(), backupCode);
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Generate JWT token (using the same approach as regular login)
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set cookies
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({
      success: true,
      message: "MFA verification successful",
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
