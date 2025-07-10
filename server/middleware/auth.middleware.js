import jwt from "jsonwebtoken";
import { AUTH_ERRORS } from "../constants/error.constants.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: AUTH_ERRORS.UNAUTHORIZED,
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.user = { userId: tokenDecode.id };
    } else {
      return res.status(401).json({
        success: false,
        message: AUTH_ERRORS.INVALID_TOKEN,
      });
    }
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: AUTH_ERRORS.INVALID_TOKEN });
  }
};

export default userAuth;
