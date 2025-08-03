import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userModel from "../models/user.model.js";
import {
  generateTokenPair,
  storeRefreshToken,
} from "../services/auth.services.js";

// Configure passport with JWT strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies.token;
          }
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await userModel.findById(jwtPayload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google strategy
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
        // Check if user exists
        let user = await userModel.findOne({
          "socialAuth.google.id": profile.id,
        });

        if (!user) {
          // Check if email already exists
          user = await userModel.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link account
            user.socialAuth.google = {
              id: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              picture: profile.photos[0].value,
            };
            await user.save();
          } else {
            // Create new user
            user = new userModel({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: `OAUTH-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 15)}`, // Random password
              isAccountVerified: true, // Email is verified by Google
              socialAuth: {
                google: {
                  id: profile.id,
                  email: profile.emails[0].value,
                  name: profile.displayName,
                  picture: profile.photos[0].value,
                },
              },
            });
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// GitHub strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await userModel.findOne({
          "socialAuth.github.id": profile.id,
        });

        // Get primary email
        const primaryEmail =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `${profile.username}@github.user`;

        if (!user) {
          // Check if email already exists
          user = await userModel.findOne({ email: primaryEmail });

          if (user) {
            // Link account
            user.socialAuth.github = {
              id: profile.id,
              email: primaryEmail,
              name: profile.displayName || profile.username,
              picture: profile.photos[0].value,
            };
            await user.save();
          } else {
            // Create new user
            user = new userModel({
              name: profile.displayName || profile.username,
              email: primaryEmail,
              password: `OAUTH-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 15)}`, // Random password
              isAccountVerified: true, // Email is verified by GitHub
              socialAuth: {
                github: {
                  id: profile.id,
                  email: primaryEmail,
                  name: profile.displayName || profile.username,
                  picture: profile.photos[0].value,
                },
              },
            });
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
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
