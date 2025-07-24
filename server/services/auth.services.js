import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import { AUTH_ERRORS } from "../constants/error.constants.js";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(AUTH_ERRORS.INVALID_TOKEN);
  }
};

// new refresh token 
// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d', // Refresh tokens last longer
  });
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
