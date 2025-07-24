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

// Add index for social auth lookups
userSchema.index({ "socialAuth.google.id": 1 });
userSchema.index({ "socialAuth.facebook.id": 1 });
userSchema.index({ "socialAuth.github.id": 1 });

// Add TTL index for OTP expiration
userSchema.index({ verifyOtpExpireAt: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ resetOtpExpireAt: 1 }, { expireAfterSeconds: 0 });

// Add text index for search functionality
userSchema.index({ name: "text", email: "text" });
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.accountLocked = false;
  this.lockUntil = null;

  return await this.save();
};
const userModal = mongoose.models.user || mongoose.model("User", userSchema);

export default userModal;
