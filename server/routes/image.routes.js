import express from "express";
import {
  generateImage,
  getImageStatus,
  getImageHistory,
} from "../controllers/image.controller.js";
import userAuth from "../middleware/auth.middleware.js";
import { validateImagePrompt } from "../validators/image.validators.js";

const imageRouter = express.Router();

/**
 * @route POST /api/images/generate
 * @desc Generate image from text prompt
 * @access Protected (requires authentication)
 * @body {string} prompt - Text prompt for image generation
 * @body {string} [style] - Image style (optional)
 * @body {string} [size] - Image size (optional)
 */
imageRouter.post("/generate", userAuth, validateImagePrompt, generateImage);

/**
 * @route GET /api/images/:imageId/status
 * @desc Get status of a generated image
 * @access Protected (requires authentication)
 * @param {string} imageId - ID of the generated image
 */
imageRouter.get("/:imageId/status", userAuth, getImageStatus);

/**
 * @route GET /api/images/history
 * @desc Get user's image generation history
 * @access Protected (requires authentication)
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page
 */
imageRouter.get("/history", userAuth, getImageHistory);

/**
 * @route GET /api/images/demo
 * @desc Demo endpoint to test image generation without authentication
 * @access Public (for testing purposes only)
 * @body {string} prompt - Text prompt for image generation
 */
imageRouter.post("/demo", validateImagePrompt, async (req, res) => {
  const { prompt, style = "realistic", size = "1024x1024" } = req.body;

  try {
    // Simple demo response without authentication
    const response = {
      success: true,
      message: `✅ Demo: Your prompt "${prompt}" has been received!`,
      demo: true,
      confirmation: {
        promptReceived: prompt,
        style: style,
        size: size,
        note: "This is a demo response. Sign up and authenticate for full image generation.",
      },
      mockImage: {
        // url: `https://demo-images.example.com/demo/${Date.now()}.jpg`,
        url: `https://www.google.com/url?sa=i&url=https%3A%2F%2Fhuggingface.co%2Fspaces%2Fecarbo%2Ftext-generator-demo&psig=AOvVaw2y0MKxLO1YKqsmpsSyXTdQ&ust=1757744538377000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLj89OrK0o8DFQAAAAAdAAAAABAE`,
        prompt: prompt,
        style: style,
        size: size,
        generatedAt: new Date().toISOString(),
      },
      nextSteps: {
        register: "/api/auth/register",
        login: "/api/auth/login",
        fullGeneration: "/api/images/generate",
      },
    };

    // Add processing delay
    // setTimeout(() => {
    //   res.json(response);
    // }, Math.floor(Math.random() * 800) + 200); // 200-1000ms delay
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Demo generation failed",
      error: error.message,
    });
  }
});

export default imageRouter;
