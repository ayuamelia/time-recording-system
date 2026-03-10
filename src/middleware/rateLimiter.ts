import rateLimit from 'express-rate-limit';

/**
 * Strict limiter for auth endpoints — prevents brute force attacks.
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,  // returns RateLimit-* headers in response
  legacyHeaders: false,   // disables X-RateLimit-* headers
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes',
  },
  skipSuccessfulRequests: true, // only count failed attempts
});

/**
 * General limiter for all other API routes.
 * 100 requests per minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please slow down',
  },
});