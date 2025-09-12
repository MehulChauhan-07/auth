import userModel from "../models/user.model.js";
import logger from "../utils/logger.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate image from text prompt (Protected Route)
 * Requires authentication token
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.prompt - Text prompt for image generation
 * @param {string} [req.body.style] - Image style (optional)
 * @param {string} [req.body.size] - Image size (optional)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with generated image data
 */
export const generateImage = async (req, res) => {
  const { prompt, style = "realistic", size = "1024x1024" } = req.body;
  const userId = req.userId; // From auth middleware

  try {
    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image prompt is required",
        error: {
          code: "INVALID_PROMPT",
          details: "Please provide a valid text prompt for image generation"
        }
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Prompt too long",
        error: {
          code: "PROMPT_TOO_LONG",
          details: "Prompt must be less than 1000 characters"
        }
      });
    }

    // Get user info
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user account is verified
    if (!user.isAccountVerified) {
      return res.status(403).json({
        success: false,
        message: "Account verification required",
        error: {
          code: "ACCOUNT_NOT_VERIFIED",
          details: "Please verify your email address to generate images"
        }
      });
    }

    // Check if prompt is in JSON format
    let parsedPrompt;
    let isJsonPrompt = false;
    
    try {
      parsedPrompt = JSON.parse(prompt);
      isJsonPrompt = true;
      console.log('📝 JSON Prompt detected:', parsedPrompt);
    } catch (e) {
      // Not a JSON prompt, use as regular text prompt
      parsedPrompt = { text: prompt };
      console.log('📝 Text Prompt received:', prompt);
    }

    // Log the image generation request
    logger.info("Image generation request", {
      userId: user._id,
      userEmail: user.email,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      style,
      size,
      isJsonPrompt,
      timestamp: new Date()
    });

    // Simulate processing time
    const processingStartTime = Date.now();
    const processingTime = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds

    // Generate unique image ID
    const imageId = uuidv4();
    const generatedAt = new Date().toISOString();

    // Create demo response with generated image data
    const imageData = {
      id: imageId,
      prompt: isJsonPrompt ? JSON.stringify(parsedPrompt) : prompt,
      originalPrompt: prompt,
      parsedPrompt: isJsonPrompt ? parsedPrompt : { text: prompt },
      promptType: isJsonPrompt ? 'json' : 'text',
      style: style,
      size: size,
      url: `https://demo-images.example.com/generated/${imageId}.jpg`,
      thumbnailUrl: `https://demo-images.example.com/thumbnails/${imageId}_thumb.jpg`,
      downloadUrl: `https://demo-images.example.com/downloads/${imageId}_full.jpg`,
      metadata: {
        generatedAt,
        processingTime,
        modelUsed: "DALL-E-3-Demo",
        resolution: size,
        format: "JPEG",
        fileSize: Math.floor(Math.random() * 2000000) + 500000, // 500KB - 2.5MB
        seedValue: Math.floor(Math.random() * 1000000)
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };

    // Comprehensive demo response
    const response = {
      success: true,
      message: `✅ Yes, your prompt is: "${prompt}" and the image has been generated!`,
      confirmation: {
        promptReceived: prompt,
        promptType: isJsonPrompt ? 'JSON Format' : 'Text Format',
        processedPrompt: isJsonPrompt 
          ? `JSON Prompt with ${Object.keys(parsedPrompt).length} parameters` 
          : `Enhanced: ${prompt} [${style} style, ${size} resolution]`,
        estimatedCredits: 1,
        processingStatus: "completed",
        acknowledgedBy: user.name
      },
      image: imageData,
      generation: {
        requestId: `req_${Date.now()}`,
        status: "success",
        processingTime: processingTime,
        queue: {
          position: 0,
          estimatedWait: 0
        }
      },
      usage: {
        creditsUsed: 1,
        creditsRemaining: Math.floor(Math.random() * 50) + 10,
        monthlyUsage: Math.floor(Math.random() * 100) + 1,
        plan: "free"
      },
      actions: {
        download: imageData.downloadUrl,
        share: `${req.protocol}://${req.get('host')}/api/images/share/${imageData.id}`,
        regenerate: `${req.protocol}://${req.get('host')}/api/images/regenerate`,
        variations: `${req.protocol}://${req.get('host')}/api/images/variations/${imageData.id}`
      }
    };

    // Add a delay to simulate processing
    setTimeout(() => {
      // Log successful generation
      logger.info("Image generation completed", {
        userId: user._id,
        imageId: imageData.id,
        processingTime
      });

      res.status(200).json(response);
    }, Math.floor(Math.random() * 1000) + 500); // 500-1500ms delay

  } catch (error) {
    console.error("Error in generateImage:", error);
    logger.error("Image generation failed", {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
      prompt: req.body.prompt
    });

    return res.status(500).json({
      success: false,
      message: "Image generation failed",
      error: {
        code: "GENERATION_ERROR",
        details: "An error occurred while processing your image generation request",
        requestId: `req_${Date.now()}`,
        supportMessage: "Please try again or contact support if the problem persists"
      }
    });
  }
};

/**
 * Get status of a previously generated image by ID
 * @async
 * @param {Object} req - Request object with imageId in params
 * @param {Object} res - Response object
 */
export const getImageStatus = async (req, res) => {
  const { imageId } = req.params;
  const userId = req.userId;

  try {
    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: 'Image ID is required'
      });
    }

    // Get user info
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Demo response for image status
    const statusResponse = {
      success: true,
      imageId,
      status: 'completed',
      imageUrl: `https://demo-images.example.com/generated/${imageId}.jpg`,
      thumbnailUrl: `https://demo-images.example.com/thumbnails/${imageId}_thumb.jpg`,
      generatedAt: new Date().toISOString(),
      user: {
        id: user._id,
        name: user.name
      },
      metadata: {
        processingTime: Math.floor(Math.random() * 3000) + 1000,
        format: "JPEG",
        resolution: "1024x1024",
        fileSize: Math.floor(Math.random() * 2000000) + 500000
      }
    };

    res.status(200).json(statusResponse);

  } catch (error) {
    console.error('Error getting image status:', error);
    logger.error('Failed to get image status', {
      error: error.message,
      imageId,
      userId: req.userId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get image status',
      error: {
        code: "STATUS_ERROR",
        details: "An error occurred while fetching image status"
      }
    });
  }
};

/**
 * Get user's image generation history (Protected Route)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with image history
 */
export const getImageHistory = async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 10 } = req.query;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Demo history data
    const demoHistory = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
      id: `img_${Date.now() - (index * 3600000)}_${user._id.toString().slice(-6)}${index}`,
      prompt: [
        "A beautiful sunset over mountains with golden light",
        "Futuristic city with flying cars and neon lights", 
        "Portrait of a wise old wizard with mystical aura",
        "Abstract art with vibrant colors and flowing shapes",
        "Peaceful lake with crystal clear reflection"
      ][index] || "Demo image prompt",
      style: ["realistic", "artistic", "cartoon", "abstract", "photographic"][Math.floor(Math.random() * 5)],
      size: "1024x1024",
      url: `https://demo-images.example.com/history/${Date.now() - (index * 3600000)}.jpg`,
      createdAt: new Date(Date.now() - (index * 3600000)).toISOString(),
      status: "completed",
      processingTime: Math.floor(Math.random() * 3000) + 1000
    }));

    return res.json({
      success: true,
      message: "Image history retrieved successfully",
      images: demoHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(15 / limit),
        totalImages: 15,
        hasNext: page < Math.ceil(15 / limit),
        hasPrevious: page > 1
      },
      user: {
        id: user._id,
        name: user.name,
        totalGenerations: 15
      }
    });

  } catch (error) {
    console.error("Error in getImageHistory:", error);
    logger.error("Failed to retrieve image history", {
      error: error.message,
      userId: req.userId
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve image history",
      error: {
        code: "HISTORY_ERROR",
        details: "An error occurred while fetching your image history"
      }
    });
  }
};
