const express = require("express");
const router = express.Router();
const pool = require("../db");

// Submit a response to a post by a company user
router.post("/respond/:postId", async (req, res) => {
  // Only allow logged-in company users
  if (!req.user || req.user.role !== "company") {
    return res.status(403).send("Unauthorized");
  }

  const { postId } = req.params;
  const { content } = req.body;

  try {
    // Fetch company_id linked to the logged-in user
    const [companyRow] = await pool.execute(
      "SELECT company_id FROM company WHERE user_id = ?",
      [req.user.user_id]
    );

    if (companyRow.length === 0) {
      console.error("Company not found for user:", req.user.user_id);
      return res.status(400).send("Company not found");
    }

    const companyId = companyRow[0].company_id;

    // Debugging output
    console.log("Submitting response with:", {
      postId,
      companyId,
      content
    });

    // Fail-safe check before inserting
    if (!postId || !companyId || !content) {
      return res.status(400).send("Missing required fields");
    }

    // Insert the response
    await pool.execute(
      "INSERT INTO response (post_id, company_id, content) VALUES (?, ?, ?)",
      [postId, companyId, content]
    );

    // Redirect back to the post page
    res.redirect(`/post/${postId}`);
  } catch (err) {
    console.error("Error submitting response:", err);
    res.status(500).send("Error submitting response");
  }
});

module.exports = router;
