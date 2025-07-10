import Joi from "joi";

// Define validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(30),
  email: Joi.string().email(),
  // Add other fields as needed
});

// Middleware factory for validation
export const validateUpdateProfile = (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }

  next();
};
