import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medikiosk_sih2026_binary_brains_secret_key_8842';

/**
 * Protect routes: Validates JWT token from Bearer header
 */
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, invalid token' });
    }
  }

  // Allow guest/demo access if header is missing, but tag as guest
  req.user = { id: 'guest', role: 'patient', name: 'Guest Walk-in Patient' };
  next();
};

/**
 * Role-Based Access Control (RBAC) middleware
 * e.g., authorize('doctor', 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user?.role || 'anonymous'}' is not authorized to perform this action.`
      });
    }
    next();
  };
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization || '',
      registrationNumber: user.registrationNumber || ''
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
