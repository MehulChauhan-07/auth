// import { date, string } from "joi";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpireAt: {
    type: Number,
    default: false,
  },
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  resetOtp: {
    type: String,
    default: "",
  },
  resetOtpExpireAt: {
    type: Number,
    default: 0,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  accountLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: {
    type: Date,
    default: null,
  },

  // refresh token fields
  refreshToken: {
    type: String,
    default: null,
  },
  refreshTokenCreatedAt: {
    type: Date,
    default: null,
  },

  // MFA related fields
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
    default: null,
  },
  backupCodes: [
    {
      code: String,
      used: {
        type: Boolean,
        default: false,
      },
    },
  ],

  // active session fields
  activeSessions: [
    {
      deviceInfo: String,
      ipAddress: String,
      lastActive: Date,
      userAgent: String,
      tokenIdentifier: String,
    },
  ],

  // Social auth fields
  socialAuth: {
    google: {
      id: String,
      email: String,
      name: String,
      picture: String,
    },
    github: {
      id: String,
      email: String,
      name: String,
      picture: String,
    },
  },
});

// Add methods to the user schema
userSchema.methods.incrementLoginAttempts = async function () {
  // Increment login attempts
  this.loginAttempts += 1;

  // Lock account after 5 failed attempts
  if (this.loginAttempts >= 5 && !this.accountLocked) {
    this.accountLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }

  return await this.save();
};

// Add compound index for auth lookups
userSchema.index({ email: 1, accountLocked: 1 });

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.accountLocked = false;
  this.lockUntil = null;

  await this.save();
};

// Add device to active sessions
userSchema.methods.addSession = async function (sessionData) {
  // Limit to last 10 sessions
  if (this.activeSessions.length >= 10) {
    // Remove the oldest session
    this.activeSessions.shift();
  }

  this.activeSessions.push(sessionData);
  await this.save();
};

// Remove a session by identifier
userSchema.methods.removeSession = async function (tokenIdentifier) {
  this.activeSessions = this.activeSessions.filter(
    (session) => session.tokenIdentifier !== tokenIdentifier
  );
  await this.save();
};

// Add index for social auth lookups
userSchema.index({ "socialAuth.google.id": 1 });
userSchema.index({ "socialAuth.github.id": 1 });

// Add TTL index for OTP expiration
userSchema.index({ verifyOtpExpireAt: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ resetOtpExpireAt: 1 }, { expireAfterSeconds: 0 });

// Add text index for search functionality
userSchema.index({ name: "text", email: "text" });

const userModal = mongoose.models.user || mongoose.model("User", userSchema);

export default userModal;
