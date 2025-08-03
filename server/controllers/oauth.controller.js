import {
  generateTokenPair,
  storeRefreshToken,
} from "../services/auth.services.js";

/**
 * Handle successful OAuth authentication
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Redirects to frontend with tokens
 */
export const oauthCallback = async (req, res) => {
  try {
    const user = req.user;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    // Create device session
    const deviceInfo = {
      deviceInfo: req.headers["user-agent"] || "Unknown Device",
      ipAddress: req.ip,
      lastActive: new Date(),
      userAgent: req.headers["user-agent"],
      tokenIdentifier: refreshToken.substring(refreshToken.length - 20),
    };

    await user.addSession(deviceInfo);

    // Set cookies if same domain
    if (process.env.FRONTEND_URL.includes(req.get("host"))) {
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: 30 * 60 * 1000, // 30 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend with success
      return res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
    }

    // If different domain, redirect with tokens in URL
    // Note: This is less secure, consider using a one-time code exchange pattern instead
    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth-callback?` +
        `token=${encodeURIComponent(accessToken)}&` +
        `refreshToken=${encodeURIComponent(refreshToken)}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

/**
 * Handle OAuth failure
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Redirects to frontend with error
 */
export const oauthFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
};
