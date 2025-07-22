const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET: Flag form
router.get("/flag/:postId", async (req, res) => {
    if (!req.user) return res.redirect("/login");
    const { postId } = req.params;
    res.render("flagForm", { postId });
});

// POST: Submit flag
router.post("/flag/:postId", async (req, res) => {
    const { postId } = req.params;
    const { reason, details } = req.body;

    if (!req.user) return res.redirect("/login");

    try {
        // Insert into flag table, mark as pending for moderator review
        await pool.execute(
            `INSERT INTO flag (target_type, target_id, user_id, reason, details, status)
             VALUES ('post', ?, ?, ?, ?, 'pending')`,
            [postId, req.user.user_id, reason, details]
        );

        res.redirect(`/post/${postId}?flagged=success`);
    } catch (err) {
        console.error("Failed to flag post:", err);
        res.status(500).send("Failed to flag post.");
    }
});

module.exports = router;
