import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import transporter from "../config/nodemailer.config.js";
import {
  comparePasswords,
  createUser,
  generateOTP,
  generateToken,
  generateTokenPair,
} from "../services/auth.services.js";
import {
  sendWelcomeEmail,
  sendEmail,
  sendOTPEmail,
} from "../services/email.services.js";
import { AUTH_ERRORS } from "../constants/error.constants.js";
import logger from "../utils/logger.js";

/**
 * User registration endpoint
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data or error message
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: AUTH_ERRORS.USER_ALREADY_EXISTS,
      });
    }

    const user = await createUser({ name, email, password });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // ! sending mail
    await sendWelcomeEmail(user);

    return res.json({
      success: true,
      message: "Registration successful",
      user: { token: token, id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error in register:", error);
    logger.error("Error in register:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * User login endpoint
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {boolean} [req.body.rememberMe=false] - Whether to extend token expiration
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with auth tokens or error message
 */
export const login = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  // Validation is now handled by the validator middleware
  // Just in case it's not used yet
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: AUTH_ERRORS.INVALID_CREDENTIALS,
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: AUTH_ERRORS.USER_NOT_FOUND });
    }

    // check is account is locked
    if (user.accountlocked && user.lockUntil > Date.now()) {
      return res.status(401).json({
        success: false,
        message: AUTH_ERRORS.ACCOUNT_LOCKED,
        unlockTime: user.lockUntil,
      });
    }
    // Use service function instead of direct bcrypt comparison
    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      // increment login attempts
      await user.incrementLoginAttempts();

      return res
        .status(400)
        .json({ success: false, message: AUTH_ERRORS.INVALID_CREDENTIALS });
    }

    // reset login attempts on successful login
    await user.resetLoginAttempts();

    // Check if MFA is enabled for this user
    if (user.mfaEnabled) {
      // Store user info in session for the second authentication step
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        requiresMfa: true,
      };

      return res.json({
        success: true,
        mfaRequired: true,
        userId: user._id,
        message: "MFA verification required",
      });
    }

    // // Use service function to generate token
    // const token = generateToken(user._id);
    // generate token with extended expiration if rememberMe is true
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Set cookie expiration time based on rememberMe
    const cookieExpiration = rememberMe
      ? 7 * 24 * 60 * 60 * 1000 // 7 days
      : 24 * 60 * 60 * 1000; // 1 day

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: cookieExpiration,
    });
    // Store refresh token in separate cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email },
      rememberMe: rememberMe,
    });
  } catch (error) {
    console.error("Error in login:", error);
    logger.error("Error in login:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
    });

    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_ERRORS.USER_NOT_FOUND,
      });
    }
    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: AUTH_ERRORS.ACCOUNT_ALREADY_VERIFIED,
      });
    }

    // const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP

    const otp = generateOTP();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Send OTP email using service
    await sendOTPEmail(user, otp, "verification");

    return res.json({
      success: true,
      message: "Account Verification OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in sendVerifyOtp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.userId;

  if (!userId || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "User ID and OTP are required" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: AUTH_ERRORS.USER_NOT_FOUND });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: AUTH_ERRORS.ACCOUNT_ALREADY_VERIFIED,
      });
    }

    if (user.verifyOtp !== otp || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = null;

    await user.save();

    return res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendResetPasswordOtp = async (req, res) => {
  console.log("Reset password OTP request received:", req.body);
  const { email } = req.body;

  if (!email) {
    console.log("Email is missing in the request");
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    console.log(`Looking up user with email: ${email}`);
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res
        .status(404)
        .json({ success: false, message: AUTH_ERRORS.USER_NOT_FOUND });
    }
    console.log(`User found: ${user._id}`);

    // const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP
    const otp = generateOTP();

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Send OTP email using service
    await sendOTPEmail(user, otp, "reset");

    console.log(`Sending OTP ${otp} to user ${user.email} for password reset`);

    try {
      await sendOTPEmail(user, otp, "reset");
      console.log("OTP email sent successfully");
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);

      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to send OTP email",
          error: emailError.message,
        });
    }

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in sendResetPasswordOtp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: AUTH_ERRORS.REQUIRED_ALL_FIELDS });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: AUTH_ERRORS.USER_NOT_FOUND });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: AUTH_ERRORS.INVALID_OTP });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: AUTH_ERRORS.OTP_EXPIRED });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successful",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
