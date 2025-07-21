// middleware/auth.js
const jwt = require("jsonwebtoken");

function ensureAuthenticated(req, res, next) {
  if (req.user) {
    return next();
  }
  res.redirect("/");
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      return next();
    }
    return res.status(403).send("Forbidden: Insufficient role");
  };
}

module.exports = {
  ensureAuthenticated,
  requireRole,
};
