import express from "express";
import passport from "../config/passport.config.js";
import logger from "../utils/logger.js";
import csrf from "csurf";

const oauthRouter = express.Router();

// Get URLs for OAuth providers (useful for testing)
oauthRouter.get("/oauth-urls", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json({
    success: true,
    urls: {
      google: `${baseUrl}/api/auth/google`,
      facebook: `${baseUrl}/api/auth/facebook`,
      github: `${baseUrl}/api/auth/github`,
    },
  });
});

// Google OAuth routes
// Skip CSRF for OAuth routes
oauthRouter.get("/google", (req, res, next) => {
  logger.info("Google OAuth request initiated");

  // Generate a state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);
  req.session.oauthState = state;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
    prompt: "select_account", // Force Google account selection
  })(req, res, next);
});

oauthRouter.get("/google/callback", (req, res, next) => {
  logger.info("Google OAuth callback received");

  // Verify state parameter if present
  if (
    req.query.state &&
    req.session.oauthState &&
    req.query.state !== req.session.oauthState
  ) {
    logger.error("OAuth state mismatch - potential CSRF attack");
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=invalid_state`
    );
  }

  passport.authenticate("google", { session: false }, (err, userData) => {
    // Clear OAuth state from session
    delete req.session.oauthState;

    if (err) {
      logger.error("Error in Google OAuth callback", { error: err.message });
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
          err.message
        )}`
      );
    }

    if (!userData) {
      logger.error("No user data returned from Google OAuth");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=authentication_failed`
      );
    }

    // Set cookies
    const { tokens, user } = userData;

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // For development, log success
    logger.info("Google OAuth login successful", {
      userId: user._id,
      email: user.email,
    });

    // Redirect to frontend with success
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?success=true&provider=google`
    );
  })(req, res, next);
});

// [Facebook and GitHub routes remain similar]

export default oauthRouter;
