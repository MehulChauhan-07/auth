import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import { AUTH_ERRORS } from "../constants/error.constants.js";
import crypto from "crypto";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30m", // Access tokens last for 30 minutes
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(AUTH_ERRORS.INVALID_TOKEN);
  }
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  // ! Important: Use a secure method to generate refresh tokens
  const tokenData = userId + crypto.randomBytes(40).toString("hex");
  return jwt.sign(
    { id: userId, data: tokenData },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d", // Refresh tokens last longer
    }
  );
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }
};

// Generate token pair (access + refresh)
export const generateTokenPair = (userId) => {
  return {
    accessToken: generateToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

// ! store the refresh token in the database
export const storeRefreshToken = async (userId, refreshToken) => {
  await userModel.findByIdAndUpdate(userId, {
    refreshToken,
    refreshTokenCreatedAt: new Date(),
  });
};

// ! invalidate/remove the refresh token
export const invalidateRefreshToken = async (userId) => {
  await userModel.findByIdAndUpdate(userId, {
    $unset: {
      refreshToken: 1,
      refreshTokenCreatedAt: 1,
    },
  });
};

// !check if the refresh token is valid
export const isRefreshTokenValid = async (userId, refreshToken) => {
  const user = await userModel.findById(userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  // Check if the refresh token is expired
  const tokenAge = (new Date() - user.refreshTokenCreatedAt) / 1000; // in seconds
  if (tokenAge > 7 * 24 * 60 * 60) {
    // 7 days
    throw new Error(AUTH_ERRORS.REFRESH_TOKEN_EXPIRED);
  }

  return user && user.refreshToken === refreshToken;
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const findUserByEmail = async (email) => {
  const user = await userModel.findOne({ email });
  return user;
};

export const createUser = async (userData) => {
  const hashedPassword = await hashPassword(userData.password);
  const user = new userModel({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
  });

  await user.save();
  return user;
};

export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
};
