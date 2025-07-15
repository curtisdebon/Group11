//  Added a new route for moderating flagged posts. /moderate/:flagId) handles 
//    the test case by updating the post status and logging the action.

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

// POST: Moderator approves flag and removes post
router.post("/moderate/:flagId", async (req, res) => {
    if (!req.user) return res.redirect("/login");
    
    // Check if user is a moderator (adjust based on your auth setup)
    if (!req.user.isModerator) {
        return res.status(403).send("Unauthorized: Moderator access required");
    }

    const { flagId } = req.params;

    try {
        // Get the post ID from the Flag table
        const [flagRows] = await pool.execute(
            `SELECT target_id FROM Flag WHERE flag_id = ? AND target_type = 'post'`,
            [flagId]
        );

        if (flagRows.length === 0) {
            return res.status(404).send("Flag not found");
        }

        const postId = flagRows[0].target_id;

        // Update post status to 'Removed'
        await pool.execute(
            `UPDATE Post SET status = 'Removed' WHERE post_id = ?`,
            [postId]
        );

        // Insert moderation log entry
        await pool.execute(
            `INSERT INTO ModerationLog (moderator_id, action, target_type, target_id, timestamp)
             VALUES (?, ?, ?, ?, NOW())`,
            [req.user.user_id, 'remove_post', 'post', postId]
        );

        res.redirect("/?moderation=success");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to process moderation action");
    }
});

module.exports = router;
