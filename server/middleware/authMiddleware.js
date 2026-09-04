import jwt from 'jsonwebtoken';
import { db } from '../data/store.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized. Please login to access this resource.');
  }

  try {
    const secret = process.env.JWT_SECRET || 'edupulse_school_jwt_secret_key_2026_production_grade';
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB
    const user = await db.users.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'User account associated with this token no longer exists.');
    }

    if (user.isActive === false) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact the administrator.');
    }

    // Attach user to req (without sensitive password)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authenticated');
    }

    // Super Admin has universal access
    if (req.user.role === 'Super Admin') {
      return next();
    }

    // Role hierarchy / aliases: School Admin often has same privileges as Principal/Admin
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${userRole}' does not have permission to perform this action.`
      );
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'edupulse_school_jwt_secret_key_2026_production_grade';
      const decoded = jwt.verify(token, secret);
      const user = await db.users.findById(decoded.id);
      if (user && user.isActive !== false) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    } catch (e) {
      // Ignore optional auth error
    }
  }
  next();
};
