import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GithubStrategy } from "passport-github2";
import userModel from "../models/user.model.js";
import logger from "../utils/logger.js";
import { generateTokenPair } from "../services/auth.services.js";

// Configure Passport Google Strategy with proper settings
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        `${process.env.API_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
      // Add these options for more reliability
      proxy: true, // Important if behind a proxy
      state: true, // Helps prevent CSRF
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info("Google auth callback received", { profileId: profile.id });

        // Get email from profile
        const email = profile.emails && profile.emails[0]?.value;

        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        // Check if user already exists
        let user = await userModel.findOne({
          $or: [{ email }, { "socialAuth.google.id": profile.id }],
        });

        if (!user) {
          // Create new user
          user = new userModel({
            name: profile.displayName || email.split("@")[0],
            email,
            password:
              Math.random().toString(36).slice(-10) +
              Math.random().toString(36).slice(-10), // Random password
            isAccountVerified: true, // Verified by Google
            socialAuth: {
              google: {
                id: profile.id,
                email,
                name: profile.displayName,
                picture: profile.photos?.[0]?.value || null,
              },
            },
          });
          await user.save();
          logger.info("New user created from Google auth", { email });
        } else if (!user.socialAuth?.google?.id) {
          // Link Google account to existing user
          user.socialAuth = {
            ...(user.socialAuth || {}),
            google: {
              id: profile.id,
              email,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value || null,
            },
          };
          await user.save();
          logger.info("Linked Google account to existing user", {
            userId: user._id,
          });
        }

        // Generate tokens for the user
        const tokens = generateTokenPair(user._id);

        return done(null, { user, tokens });
      } catch (error) {
        logger.error("Error in Google auth strategy", {
          error: error.message,
          stack: error.stack,
        });
        return done(error, null);
      }
    }
  )
);

// [Rest of your Passport configuration remains the same]

passport.serializeUser((userData, done) => {
  // For user object from OAuth
  if (userData && userData.user) {
    return done(null, userData.user._id);
  }

  // For direct user object
  if (userData && userData._id) {
    return done(null, userData._id);
  }

  // Fallback
  done(new Error("Invalid user data format"), null);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id).select("-password");
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
