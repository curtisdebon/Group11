const express = require("express");
const router = express.Router();
const pool = require("../db");
const { ensureAuthenticated } = require("../middleware/auth");

// GET: Generic Create Post Page with company dropdown
router.get("/createPost", ensureAuthenticated, async (req, res) => {
  try {
    const [companies] = await pool.execute("SELECT * FROM company");
    res.render("createPost", { companies, company: null, errors: [] });
  } catch (err) {
    console.error("Error loading company list:", err);
    res.status(500).send("Error loading post form");
  }
});

// GET: Create Post Page for a Specific Company
router.get("/company/:id/createPost", ensureAuthenticated, async (req, res) => {
  const company_id = req.params.id;
  try {
    const [[company]] = await pool.execute("SELECT * FROM company WHERE company_id = ?", [company_id]);
    if (!company) return res.status(404).send("Company not found");

    res.render("createPost", { company, companies: null, errors: [] });
  } catch (err) {
    console.error("Error loading company:", err);
    res.status(500).send("Error loading company");
  }
});

// POST: Handle New Post Submission
router.post("/createPost", ensureAuthenticated, async (req, res) => {
  const { title, category = "review", rating, body, company_id } = req.body;
  const user_id = req.user.user_id;

  if (!title || !rating || !body || !company_id) {
    try {
      if (company_id) {
        const [[company]] = await pool.execute("SELECT * FROM company WHERE company_id = ?", [company_id]);
        return res.render("createPost", {
          company,
          companies: null,
          errors: ["All fields are required."]
        });
      } else {
        const [companies] = await pool.execute("SELECT * FROM company");
        return res.render("createPost", {
          companies,
          company: null,
          errors: ["All fields are required."]
        });
      }
    } catch (err) {
      console.error("Error reloading form:", err);
      return res.status(500).send("Form reload error");
    }
  }

  try {
    await pool.execute(
      `INSERT INTO post (user_id, company_id, category, title, content, rating, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [user_id, company_id, category, title, body, rating]
    );
    res.redirect(`/company/${company_id}`);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Failed to create post");
  }
});

// GET: View Post Detail Page
router.get("/post/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const [[post]] = await pool.execute(
      `SELECT p.*, u.username AS author, c.name AS company_name, c.company_id,
              (SELECT COUNT(*) FROM vote WHERE target_type = 'post' AND target_id = p.post_id AND vote_type = 'up') AS upvotes,
              (SELECT COUNT(*) FROM vote WHERE target_type = 'post' AND target_id = p.post_id AND vote_type = 'down') AS downvotes
       FROM post p
       JOIN user u ON p.user_id = u.user_id
       JOIN company c ON p.company_id = c.company_id
       WHERE p.post_id = ?`,
      [postId]
    );

    const [comments] = await pool.execute(
      `SELECT cm.*, u.username
       FROM comment cm
       JOIN user u ON cm.user_id = u.user_id
       WHERE cm.post_id = ?
       ORDER BY cm.timestamp ASC`,
      [postId]
    );

    const [[response]] = await pool.execute(
      `SELECT * FROM response WHERE post_id = ?`,
      [postId]
    );

    res.render("postDetail", {
      post,
      comments,
      response: response || null
    });
  } catch (err) {
    console.error("Error loading post detail:", err);
    res.status(500).send("Error loading post.");
  }
});

// GET: Edit Post Form
router.get("/post/:id/edit", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;
  try {
    const [[post]] = await pool.execute("SELECT * FROM post WHERE post_id = ?", [postId]);
    if (!post || post.user_id !== req.user.user_id) {
      return res.status(403).send("Unauthorized");
    }

    res.render("editPost", { post, errors: [] });
  } catch (err) {
    console.error("Error loading post for edit:", err);
    res.status(500).send("Error loading post");
  }
});

// POST: Submit Post Edits
router.post("/post/:id/edit", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const { title, rating, body } = req.body;

  if (!title || !rating || !body) {
    const [[post]] = await pool.execute("SELECT * FROM post WHERE post_id = ?", [postId]);
    return res.render("editPost", { post, errors: ["All fields are required."] });
  }

  try {
    const [[post]] = await pool.execute("SELECT * FROM post WHERE post_id = ?", [postId]);
    if (!post || post.user_id !== req.user.user_id) {
      return res.status(403).send("Unauthorized");
    }

    await pool.execute(
      `UPDATE post SET title = ?, content = ?, rating = ? WHERE post_id = ?`,
      [title, body, rating, postId]
    );

    if (req.user.role === "company") {
  res.redirect("/dashboard");
} else {
  res.redirect(`/post/${postId}`);
}

  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).send("Failed to update post");
  }
});

// POST: Delete Post
router.post("/post/:id/delete", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;

  try {
    const [[post]] = await pool.execute("SELECT * FROM post WHERE post_id = ?", [postId]);
    if (!post || post.user_id !== req.user.user_id) {
      return res.status(403).send("Unauthorized");
    }

    await pool.execute("DELETE FROM post WHERE post_id = ?", [postId]);
    res.redirect("/profile");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Failed to delete post");
  }
});

// POST: Company Response to Post
router.post("/respond/:postId", ensureAuthenticated, async (req, res) => {
  if (req.user.role !== "company") return res.status(403).send("Access denied");

  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.user_id;

  try {
    // Fetch company_id based on user_id
    const [companyRows] = await pool.execute("SELECT company_id FROM company WHERE user_id = ?", [userId]);
    if (companyRows.length === 0) return res.status(400).send("Company not found");

    const companyId = companyRows[0].company_id;

    // Insert response
    await pool.execute(
      `INSERT INTO response (post_id, company_id, content)
       VALUES (?, ?, ?)`,
      [postId, companyId, content]
    );

    res.redirect(`/post/${postId}`);
  } catch (err) {
    console.error("Error submitting response:", err);
    res.status(500).send("Error submitting response");
  }
});


module.exports = router;
