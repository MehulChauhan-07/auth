import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GithubStrategy } from "passport-github2";
import userModel from "../models/user.model.js";
import logger from "../utils/logger.js";

// Configure Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await userModel.findOne({
          $or: [
            { email: profile.emails[0].value },
            { "socialAuth.google.id": profile.id },
          ],
        });

        if (!user) {
          // Create new user
          user = new userModel({
            name: profile.displayName,
            email: profile.emails[0].value,
            isAccountVerified: true, // Verified by Google
            socialAuth: {
              google: {
                id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos[0]?.value || null,
              },
            },
          });
          await user.save();
        } else if (!user.socialAuth?.google?.id) {
          // Link Google account to existing user
          user.socialAuth = {
            ...user.socialAuth,
            google: {
              id: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              picture: profile.photos[0]?.value || null,
            },
          };
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        logger.error("Error in Google auth strategy", { error: error.message });
        return done(error, null);
      }
    }
  )
);

// Configure Passport Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Implementation similar to Google strategy
        // ...
      } catch (error) {
        logger.error("Error in Facebook auth strategy", {
          error: error.message,
        });
        return done(error, null);
      }
    }
  )
);

// Configure Passport GitHub Strategy
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Implementation similar to Google strategy
        // ...
      } catch (error) {
        logger.error("Error in GitHub auth strategy", { error: error.message });
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
