// middleware/auth.js

// This middleware ensures the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (!req.user) {
    return res.status(401).send("Authentication required.");
  }
  next();
}

// This middleware restricts access based on user role
function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).send("Forbidden: Insufficient permissions.");
    }
    next();
  };
}

module.exports = {
  ensureAuthenticated,
  requireRole
};

