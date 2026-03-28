const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'rumi-jwt-secret-change-in-production';

/**
 * Verify JWT and attach user to req.user. Use for protected routes.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ success: false, message: 'User not found.' });
        }
        req.user = user;
        req.userId = user._id;
        next();
      })
      .catch(() => res.status(401).json({ success: false, message: 'Invalid token.' }));
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Optional auth: if token present and valid, set req.user; otherwise continue without it.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findById(decoded.userId)
      .then((user) => {
        if (user) {
          req.user = user;
          req.userId = user._id;
        }
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}

/**
 * signToken accepts a payload object (e.g. { userId, role }) and returns a signed JWT.
 */
function signToken(payload) {
  // Ensure payload.userId is string
  const data = { ...(payload || {}) };
  if (data.userId) data.userId = data.userId.toString();
  return jwt.sign(data, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

module.exports = {
  authenticate,
  optionalAuth,
  signToken,
};

/**
 * authorize: middleware factory to restrict access based on role(s).
 * Usage: app.get('/admin', authenticate, authorize(['admin']), handler)
 */
function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (!Array.isArray(allowedRoles)) allowedRoles = [allowedRoles];
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role.' });
    }
    return next();
  };
}

module.exports.authorize = authorize;
