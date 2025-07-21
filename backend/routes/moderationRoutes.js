const express = require("express");
const router = express.Router();
const pool = require("../db");

// Ensure only moderators can access
function ensureModerator(req, res, next) {
  if (req.user && req.user.role === "moderator") return next();
  return res.status(403).send("Forbidden");
}

// GET: Moderator Dashboard
router.get("/moderator", ensureModerator, async (req, res) => {
  try {
    const [flaggedPosts] = await pool.execute(
      `SELECT f.flag_id, f.reason, f.details, p.*
       FROM flag f
       JOIN post p ON f.target_id = p.post_id
       WHERE f.target_type = 'post' AND f.status = 'pending'`
    );

    const [flaggedComments] = await pool.execute(
      `SELECT f.flag_id, f.reason, f.details, c.*
       FROM flag f
       JOIN comment c ON f.target_id = c.comment_id
       WHERE f.target_type = 'comment' AND f.status = 'pending'`
    );

    res.render("moderatorDashboard", { flaggedPosts, flaggedComments });
  } catch (err) {
    console.error("Failed to load moderator dashboard:", err);
    res.status(500).send("Error loading moderator dashboard");
  }
});

// POST: Approve flagged content
router.post("/moderate/:flag_id/approve", ensureModerator, async (req, res) => {
  const flag_id = req.params.flag_id;

  try {
    const [[flag]] = await pool.execute("SELECT * FROM flag WHERE flag_id = ?", [flag_id]);
    if (!flag) return res.status(404).send("Flag not found");

    if (flag.target_type === "post") {
      await pool.execute("UPDATE post SET status = 'active' WHERE post_id = ?", [flag.target_id]);
    } else {
      await pool.execute("UPDATE comment SET status = 'active' WHERE comment_id = ?", [flag.target_id]);
    }

    await pool.execute("UPDATE flag SET status = 'approved' WHERE flag_id = ?", [flag_id]);

    await pool.execute(
      `INSERT INTO moderationlog (moderator_id, target_type, target_id, action, notes)
       VALUES (?, ?, ?, 'approve', ?)`,
      [req.user.user_id, flag.target_type, flag.target_id, "Moderator approved flagged content."]
    );

    res.redirect("/moderator");
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).send("Failed to approve content");
  }
});

// POST: Remove flagged content
router.post("/moderate/:flag_id/remove", ensureModerator, async (req, res) => {
  const flag_id = req.params.flag_id;

  try {
    const [[flag]] = await pool.execute("SELECT * FROM flag WHERE flag_id = ?", [flag_id]);
    if (!flag) return res.status(404).send("Flag not found");

    if (flag.target_type === "post") {
      await pool.execute("UPDATE post SET status = 'removed' WHERE post_id = ?", [flag.target_id]);
    } else {
      await pool.execute("UPDATE comment SET status = 'removed' WHERE comment_id = ?", [flag.target_id]);
    }

    await pool.execute("UPDATE flag SET status = 'removed' WHERE flag_id = ?", [flag_id]);

    await pool.execute(
      `INSERT INTO moderationlog (moderator_id, target_type, target_id, action, notes)
       VALUES (?, ?, ?, 'remove', ?)`,
      [req.user.user_id, flag.target_type, flag.target_id, "Content removed by moderator."]
    );

    res.redirect("/moderator");
  } catch (err) {
    console.error("Remove error:", err);
    res.status(500).send("Failed to remove content");
  }
});

// POST: Ignore flagged content
router.post("/moderate/:flag_id/ignore", ensureModerator, async (req, res) => {
  const flag_id = req.params.flag_id;

  try {
    const [[flag]] = await pool.execute("SELECT * FROM flag WHERE flag_id = ?", [flag_id]);
    if (!flag) return res.status(404).send("Flag not found");

    await pool.execute("UPDATE flag SET status = 'rejected' WHERE flag_id = ?", [flag_id]);

    await pool.execute(
      `INSERT INTO moderationlog (moderator_id, target_type, target_id, action, notes)
       VALUES (?, ?, ?, 'ignore', ?)`,
      [req.user.user_id, flag.target_type, flag.target_id, "Moderator ignored flag."]
    );

    res.redirect("/moderator");
  } catch (err) {
    console.error("Ignore error:", err);
    res.status(500).send("Failed to ignore flag");
  }
});

module.exports = router;
