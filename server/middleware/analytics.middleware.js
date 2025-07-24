import geoip from "geoip-lite";
import UAParser from "ua-parser-js";
import AnalyticsEvent from "../models/analytics.model.js";
import logger from "../utils/logger.js";

/**
 * Middleware to track analytics for authentication events
 */
export const trackAuthEvent = (eventType) => async (req, res, next) => {
  // Store original end function
  const originalEnd = res.end;

  // Override end function
  res.end = async function (...args) {
    // Restore original end function
    res.end = originalEnd;

    try {
      // Parse user agent
      const parser = new UAParser(req.headers["user-agent"]);
      const userAgentData = parser.getResult();

      // Get geolocation from IP
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const geo = geoip.lookup(ip) || {};

      // Create analytics event
      const event = new AnalyticsEvent({
        eventType,
        userId: req.user?.userId,
        email: req.body.email,
        status: res.statusCode < 400 ? "success" : "failure",
        ip,
        userAgent: req.headers["user-agent"],
        browser: {
          name: userAgentData.browser.name,
          version: userAgentData.browser.version,
        },
        os: {
          name: userAgentData.os.name,
          version: userAgentData.os.version,
        },
        device: userAgentData.device.type || "desktop",
        location: {
          country: geo.country,
          region: geo.region,
          city: geo.city,
          timezone: geo.timezone,
        },
      });

      // Save event without blocking response
      event.save().catch((err) => {
        logger.error("Failed to save analytics event", {
          error: err.message,
          eventType,
        });
      });
    } catch (error) {
      logger.error("Error in analytics middleware", {
        error: error.message,
      });
    }

    // Call the original end function
    return originalEnd.apply(this, args);
  };

  next();
};
