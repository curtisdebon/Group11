const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/respond/:postId", async (req, res) => {
  if (!req.user || req.user.role !== "company") return res.status(403).send("Unauthorized");

  const { postId } = req.params;
  const { content } = req.body;

  try {
    // Get the company_id associated with the user
    const [companyRow] = await pool.execute("SELECT company_id FROM company WHERE user_id = ?", [req.user.user_id]);
    if (companyRow.length === 0) return res.status(400).send("Company not found");

    const companyId = companyRow[0].company_id;

    await pool.execute(
      "INSERT INTO response (post_id, company_id, content) VALUES (?, ?, ?)",
      [postId, companyId, content]
    );

    res.redirect("/");
  } catch (err) {
    console.error("Failed to post response:", err);
    res.status(500).send("Error responding");
  }
});

module.exports = router;
