const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/moderate/post/:id", async (req, res) => {
  if (!req.user || req.user.role !== "moderator") return res.status(403).send("Forbidden");

  const { id } = req.params;
  const { action } = req.body;
  const status = action === "approve" ? "active" : "removed";

  try {
    await pool.execute("UPDATE post SET status = ? WHERE post_id = ?", [status, id]);
    await pool.execute(
      "INSERT INTO moderationlog (moderator_id, target_type, target_id, action, notes) VALUES (?, 'post', ?, ?, ?)",
      [req.user.user_id, id, action, `Moderator ${action}d post.`]
    );

    await pool.execute("UPDATE flag SET status = ? WHERE target_type = 'post' AND target_id = ?", [action, id]);

    res.redirect("/");
  } catch (err) {
    console.error("Moderation error:", err);
    res.status(500).send("Failed to moderate");
  }
});

module.exports = router;
