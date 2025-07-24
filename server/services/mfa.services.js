import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import userModel from "../models/user.model.js";
import logger from "../utils/logger.js";

/**
 * Generate a new MFA secret for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Secret and QR code data
 */
export const generateMfaSecret = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Auth App:${user.email}`,
      issuer: "Auth System",
    });

    // Save the secret to user profile
    user.mfaSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  } catch (error) {
    logger.error("Error generating MFA secret", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Verify MFA token
 * @param {string} userId - User ID
 * @param {string} token - MFA token to verify
 * @returns {Promise<boolean>} Whether token is valid
 */
export const verifyMfaToken = async (userId, token) => {
  try {
    const user = await userModel.findById(userId);
    if (!user || !user.mfaSecret) return false;

    // Verify token
    return speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: token,
      window: 1, // Allow 1 step before/after for clock drift
    });
  } catch (error) {
    logger.error("Error verifying MFA token", { error: error.message, userId });
    throw error;
  }
};

/**
 * Enable MFA for a user account
 * @param {string} userId - User ID
 * @param {string} token - MFA token to verify before enabling
 * @returns {Promise<Object>} Success status and backup codes
 */
export const enableMfa = async (userId, token) => {
  try {
    // First verify token is valid
    const isValid = await verifyMfaToken(userId, token);
    if (!isValid) {
      return {
        success: false,
        message: "Invalid verification code",
      };
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString("hex");
      backupCodes.push({ code, used: false });
    }

    // Enable MFA and save backup codes
    const user = await userModel.findById(userId);
    user.mfaEnabled = true;
    user.backupCodes = backupCodes;
    await user.save();

    return {
      success: true,
      message: "MFA enabled successfully",
      backupCodes: backupCodes.map((code) => code.code),
    };
  } catch (error) {
    logger.error("Error enabling MFA", { error: error.message, userId });
    throw error;
  }
};

/**
 * Disable MFA for a user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success status
 */
export const disableMfa = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    user.mfaEnabled = false;
    user.mfaSecret = null;
    user.backupCodes = [];
    await user.save();

    return {
      success: true,
      message: "MFA disabled successfully",
    };
  } catch (error) {
    logger.error("Error disabling MFA", { error: error.message, userId });
    throw error;
  }
};

/**
 * Verify backup code
 * @param {string} userId - User ID
 * @param {string} backupCode - Backup code to verify
 * @returns {Promise<boolean>} Whether code is valid
 */
export const verifyBackupCode = async (userId, backupCode) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) return false;

    const codeIndex = user.backupCodes.findIndex(
      (code) => code.code === backupCode && !code.used
    );

    if (codeIndex === -1) return false;

    // Mark code as used
    user.backupCodes[codeIndex].used = true;
    await user.save();

    return true;
  } catch (error) {
    logger.error("Error verifying backup code", {
      error: error.message,
      userId,
    });
    throw error;
  }
};
