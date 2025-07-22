const express = require("express");
const router = express.Router();
const pool = require("../db");
const { ensureAuthenticated } = require("../middleware/auth");

// Comment on Post with Authentication
router.post("/comment/:postId", ensureAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    await pool.execute(
      "INSERT INTO comment (post_id, user_id, content) VALUES (?, ?, ?)",
      [postId, req.user.user_id, content]
    );
    res.redirect("/post/" + postId);
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).send("Failed to comment");
  }
});

module.exports = router;
