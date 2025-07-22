const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET: Company public profile with reviews and vote counts
router.get("/company/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Get company info
    const [[company]] = await pool.execute(
      "SELECT * FROM company WHERE company_id = ?",
      [id]
    );

    if (!company) {
      return res.status(404).send("Company not found");
    }

    // Get all active posts for the company with vote counts
    const [posts] = await pool.execute(
      `SELECT p.*, u.username,
              (SELECT COUNT(*) FROM vote WHERE target_type = 'post' AND target_id = p.post_id AND vote_type = 'up') AS upvotes,
              (SELECT COUNT(*) FROM vote WHERE target_type = 'post' AND target_id = p.post_id AND vote_type = 'down') AS downvotes
       FROM post p
       JOIN user u ON p.user_id = u.user_id
       WHERE p.company_id = ? AND p.status = 'active'
       ORDER BY p.timestamp DESC`,
      [id]
    );

    res.render("companyProfile", { company, posts });
  } catch (err) {
    console.error("Error loading company profile:", err);
    res.status(500).send("Error loading company profile");
  }
});

module.exports = router;
