// ============================================================
// backend/middleware/auth.js  —  JWT verification middleware
// ============================================================

const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'study_planner_secret');
    req.user = decoded;   // { id, role, student_id }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};