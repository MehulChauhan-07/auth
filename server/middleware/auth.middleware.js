import jwt from "jsonwebtoken";
import { AUTH_ERRORS } from "../constants/error.constants.js";

const userAuth = async (req, res, next) => {
  // Check for token in cookies, auth header, or request body
  let token = req.cookies?.token;
  let refreshToken = req.cookies?.refreshToken;

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token && req.body?.token) {
    token = req.body.token;
  }

  if (!token) {
    console.log("No token found in request");
    return res.status(401).json({
      success: false,
      message: AUTH_ERRORS.UNAUTHORIZED,
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.user = { userId: tokenDecode.id };
      // Track current session ID for session management
      if (refreshToken) {
        req.currentSessionId = refreshToken.substring(refreshToken.length - 20);
      }
    } else {
      return res.status(401).json({
        success: false,
        message: AUTH_ERRORS.INVALID_TOKEN,
      });
    }
    next();
  } catch (error) {
    console.error("Token validation error:", error.message);
    // If token is expired but refresh token exists, return special code
    if (error.name === "TokenExpiredError" && refreshToken) {
      return res.status(401).json({
        success: false,
        message: AUTH_ERRORS.INVALID_TOKEN,
        tokenExpired: true,
      });
    }
    res
      .status(401)
      .json({ success: false, message: AUTH_ERRORS.INVALID_TOKEN });
  }
};

export default userAuth;
