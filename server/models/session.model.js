import mongoose from "mongoose";
const { Schema } = mongoose;

const sessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create TTL index that expires inactive sessions after 30 days
sessionSchema.index(
  { lastActivity: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
