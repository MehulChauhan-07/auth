import userModel from "../models/user.model.js";

export const getUserData = async (req, res) => {
  try {
    // Debug logging
    console.log("🔍 getUserData called");
    console.log("🔍 req.user:", req.user);
    console.log("🔍 req.cookies:", req.cookies);

    // This line is causing the error because req.user is undefined
    const userId = req.user.userId;

    if (!userId) {
      console.log("❌ No userId found in req.user");
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      console.log("❌ User not found in database for ID:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User data fetched successfully for:", user.email);

    // Return user data without sensitive information
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isAccountVerified,
        mfaEnabled: user.mfaEnabled || false,
        // Add other fields as needed
      },
    });
  } catch (error) {
    console.error("❌ Error in getUserData:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
