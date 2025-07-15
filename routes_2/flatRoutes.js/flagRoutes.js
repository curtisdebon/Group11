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
        await pool.execute(
            `INSERT INTO Flag (target_type, target_id, user_id, reason, details)
             VALUES ('post', ?, ?, ?, ?)`,
            [postId, req.user.user_id, reason, details]
        );

        await pool.execute(`UPDATE Post SET status = 'flagged' WHERE post_id = ?`, [postId]);
        res.redirect("/?flagged=success");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to flag post.");
    }
});

module.exports = router;
