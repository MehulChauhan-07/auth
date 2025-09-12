import Joi from "joi";

/**
 * Validation schema for image generation prompt
 */
const imagePromptSchema = Joi.object({
  prompt: Joi.string()
    .min(3)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Image prompt is required',
      'string.min': 'Prompt must be at least 3 characters long',
      'string.max': 'Prompt must be less than 1000 characters',
      'any.required': 'Image prompt is required'
    }),
  
  style: Joi.string()
    .valid('realistic', 'artistic', 'cartoon', 'abstract', 'photographic', 'cinematic', 'anime', 'digital-art')
    .default('realistic')
    .messages({
      'any.only': 'Style must be one of: realistic, artistic, cartoon, abstract, photographic, cinematic, anime, digital-art'
    }),
  
  size: Joi.string()
    .valid('512x512', '1024x1024', '1024x1792', '1792x1024')
    .default('1024x1024')
    .messages({
      'any.only': 'Size must be one of: 512x512, 1024x1024, 1024x1792, 1792x1024'
    }),
    
  quality: Joi.string()
    .valid('standard', 'hd')
    .default('standard')
    .optional()
    .messages({
      'any.only': 'Quality must be either standard or hd'
    }),
    
  negative_prompt: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Negative prompt must be less than 500 characters'
    })
});

/**
 * Middleware to validate image generation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Next middleware function
 */
export const validateImagePrompt = (req, res, next) => {
  const { error, value } = imagePromptSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });

  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: "Please check your input and try again",
        fields: validationErrors
      }
    });
  }

  // Replace req.body with validated and sanitized data
  req.body = value;
  next();
};

/**
 * Validation schema for image history query parameters
 */
const imageHistoryQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
      'number.max': 'Page cannot exceed 1000'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer', 
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
    
  status: Joi.string()
    .valid('pending', 'processing', 'completed', 'failed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, processing, completed, failed'
    }),
    
  style: Joi.string()
    .valid('realistic', 'artistic', 'cartoon', 'abstract', 'photographic', 'cinematic', 'anime', 'digital-art')
    .optional()
    .messages({
      'any.only': 'Style filter must be one of: realistic, artistic, cartoon, abstract, photographic, cinematic, anime, digital-art'
    })
});

/**
 * Middleware to validate image history query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const validateImageHistoryQuery = (req, res, next) => {
  const { error, value } = imageHistoryQuerySchema.validate(req.query, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const validationErrors = error.details.map(detail => ({
      parameter: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      error: {
        code: "QUERY_VALIDATION_ERROR",
        details: "Please check your query parameters and try again",
        parameters: validationErrors
      }
    });
  }

  // Replace req.query with validated and sanitized data
  req.query = value;
  next();
};

/**
 * Advanced prompt validation for JSON prompts
 * @param {string} prompt - The prompt string to validate
 * @returns {Object} Validation result
 */
export const validateJsonPrompt = (prompt) => {
  try {
    const parsedPrompt = JSON.parse(prompt);
    
    const jsonPromptSchema = Joi.object({
      text: Joi.string().min(3).max(800).required(),
      style: Joi.string().valid('realistic', 'artistic', 'cartoon', 'abstract', 'photographic', 'cinematic', 'anime', 'digital-art').optional(),
      mood: Joi.string().max(100).optional(),
      colors: Joi.array().items(Joi.string().max(20)).max(10).optional(),
      composition: Joi.string().valid('portrait', 'landscape', 'square', 'wide', 'tall').optional(),
      lighting: Joi.string().max(100).optional(),
      camera_angle: Joi.string().max(100).optional(),
      artistic_medium: Joi.string().max(100).optional(),
      negative_prompt: Joi.string().max(500).optional()
    });
    
    const { error, value } = jsonPromptSchema.validate(parsedPrompt);
    
    return {
      isValid: !error,
      error: error ? error.details : null,
      parsedPrompt: value,
      isJsonPrompt: true
    };
    
  } catch (parseError) {
    return {
      isValid: true, // Not JSON, but that's okay - treat as text
      error: null,
      parsedPrompt: { text: prompt },
      isJsonPrompt: false
    };
  }
};
