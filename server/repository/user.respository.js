import userModel from "../models/user.model.js";
import logger from "../utils/logger.js";
import redisClient from "../config/redis.config.js";

/**
 * User Repository class for database operations
 */
class UserRepository {
  /**
   * Find a user by their email address
   * @param {string} email - User's email address
   * @returns {Promise<Object>} User document or null
   */
  async findByEmail(email) {
    try {
      // Try to get from cache first
      const cachedUser = await redisClient.get(`user:email:${email}`);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // Get from database
      const user = await userModel.findOne({ email });

      // Cache the result if found
      if (user) {
        await redisClient.set(
          `user:email:${email}`,
          JSON.stringify(user),
          { EX: 300 } // 5 minutes expiration
        );
        await redisClient.set(`user:id:${user._id}`, JSON.stringify(user), {
          EX: 300,
        });
      }

      return user;
    } catch (error) {
      logger.error("Error in findByEmail:", { error: error.message, email });
      throw error;
    }
  }

  /**
   * Find a user by their ID
   * @param {string} id - User's ID
   * @returns {Promise<Object>} User document or null
   */
  async findById(id) {
    try {
      // Try to get from cache first
      const cachedUser = await redisClient.get(`user:id:${id}`);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // Get from database
      const user = await userModel.findById(id);

      // Cache the result if found
      if (user) {
        await redisClient.set(
          `user:id:${id}`,
          JSON.stringify(user),
          { EX: 300 } // 5 minutes expiration
        );
        await redisClient.set(
          `user:email:${user.email}`,
          JSON.stringify(user),
          { EX: 300 }
        );
      }

      return user;
    } catch (error) {
      logger.error("Error in findById:", { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user document
   */
  async create(userData) {
    try {
      const user = new userModel(userData);
      const savedUser = await user.save();

      return savedUser;
    } catch (error) {
      logger.error("Error in create user:", { error: error.message, userData });
      throw error;
    }
  }

  /**
   * Update a user by ID
   * @param {string} id - User's ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user document
   */
  async updateById(id, updateData) {
    try {
      const user = await userModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      // Invalidate cache
      if (user) {
        await redisClient.del(`user:id:${id}`);
        await redisClient.del(`user:email:${user.email}`);
      }

      return user;
    } catch (error) {
      logger.error("Error in updateById:", {
        error: error.message,
        id,
        updateData,
      });
      throw error;
    }
  }
}

export default new UserRepository();
