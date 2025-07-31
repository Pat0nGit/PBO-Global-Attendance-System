const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit to 5 requests per window
  message: {
    error: "Too many login attempts. Please try again in 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
