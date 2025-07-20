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

//ADDED NEW CODE NEED REVIEW
//Added Flag response
router.post("moderate/:flag_id/approve", async (req, res) => {
  const flag_id = req.params.flag_id;
  //Approve and remove post/comment
  try {
    if (flag_id.target_type === 'post') {
      await pool.execute("UPDATE post SET status = ? WHERE post_id = ?", ['removed', flag_id]);
    } else if (flag_id.target_type === 'comment') {
      await pool.execute("UPDATE comment SET status = ? WHERE post_id = ?", ['removed', flag_id]);
    }

    await pool.execute("UPDATE flag_id SET status = ? WHERE flag_id = ?", ['approved', flag_id]);

    //Log into moderationlog
    await pool.execute(
      "INSERT INTO moderationlog (moderator_id, target_type, target_id, action, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.user_id, flag_id.target_type, flag_id.target_id, 'removed', "Content removed by moderator"]
    );

    res.redirect("/");
  } catch (err) {
    console.error("Moderation error:", err);
    res.status(500).send("Failed to moderate");
  }
});
//Remove flag
router.post("moderate/:flag_id/remove", async (req, res) => {
  const flag_id = req.params.flag_id;

  try {
    await pool.execute("DELETE FROM flag WHERE flag_id = ?", [flag_id]);
  
    //Log into moderationlog
    await pool.execute(
      "INSERT INTO moderationlog (moderator_id, target_type, target_id, action, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.user_id, flag_id.target_type, flag_id.target_id, 'removed', MOD_NOTES]
    );

    res.redirect("/");
  } catch (err) {
    console.error("Moderation error:", err);
    res.status(500).send("Failed to moderate");
  }
});
//Ignore flag
router.post("moderate/:flag_id/ignore", async (req, res) => {
  const flag_id = req.params.flag_id;

  try {
    await pool.execute("UPDATE flag SET status = ? WHERE flag_id = ?", ['rejected', flag_id]);
  
    //Log into moderationlog
    await pool.execute(
      "INSERT INTO moderationlog (moderator_id, target_type, target_id, action, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.user_id, flag_id.target_type, flag_id.target_id, 'approved', "Flag ignored by moderator"]
    );

    res.redirect("/");
  } catch (err) {
    console.error("Moderation error:", err);
    res.status(500).send("Failed to moderate");
  }
});

module.exports = router;
