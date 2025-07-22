// voteRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { ensureAuthenticated } = require("../middleware/auth"); 

// Use ensureAuthenticated as middleware to protect the route
router.post("/vote/:type/:id", ensureAuthenticated, async (req, res) => {
  const { type, id } = req.params;
  const { vote_type } = req.body;

  try {
    await pool.execute(
      `INSERT INTO vote (target_type, target_id, user_id, vote_type)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE vote_type = ?`,
      [type, id, req.user.user_id, vote_type, vote_type]
    );
    res.redirect(req.get("Referer") || "/dashboard");
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).send("Vote failed");
  }
});

module.exports = router;
