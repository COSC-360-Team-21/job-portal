import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    // Check if user still exists
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Check if user account is disabled
    if (req.user.isActive === false) {
      return res.status(403).json({ message: 'Account has been disabled. Contact an administrator.' });
    }

    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Middleware to authorize based on user roles
export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    next();
  };

export default protect;
