const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Proceed without user payload for public routes
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Attach user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    // PUBLIC BYPASS: If the route doesn't STRICTLY require auth, we just ignore the invalid token
    // For now, we will just proceed and let the route-level middleware handle the actual blocking if needed.
    next(); 
  }
};

module.exports = authMiddleware;
