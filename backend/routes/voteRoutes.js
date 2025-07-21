const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/vote/:type/:id", async (req, res) => {
  if (!req.user) return res.status(403).send("Login required");

  const { type, id } = req.params;
  const { vote_type } = req.body;

  try {
    await pool.execute(
      `INSERT INTO vote (target_type, target_id, user_id, vote_type)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE vote_type = ?`,
      [type, id, req.user.user_id, vote_type, vote_type]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).send("Vote failed");
  }
});

module.exports = router;
