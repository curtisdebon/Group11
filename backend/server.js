// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const flagRoutes = require("./routes/flagRoutes");
const { ensureAuthenticated } = require("./middleware/auth");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

// JWT Auth middleware
app.use(async (req, res, next) => {
  res.locals.errors = [];
  try {
    const decoded = jwt.verify(req.cookies.WebReviews, process.env.JWTSECRET);
    req.user = decoded;
  } catch {
    req.user = false;
  }
  res.locals.user = req.user;
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/", flagRoutes);

// Homepage
app.get("/", async (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("homepage");
});

// Dashboard (for all logged-in users)
app.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const [posts] = await pool.execute(
      `SELECT p.*, u.username, c.name AS company_name, c.company_id,
              (SELECT COUNT(*) FROM vote WHERE post_id = p.post_id AND vote_type = 'up') AS upvotes,
              (SELECT COUNT(*) FROM vote WHERE post_id = p.post_id AND vote_type = 'down') AS downvotes
       FROM post p
       JOIN user u ON p.user_id = u.user_id
       JOIN company c ON p.company_id = c.company_id
       WHERE p.status = 'active'
       ORDER BY p.timestamp DESC`
    );
    res.render("dashboard", { posts });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.render("dashboard", { posts: [] });
  }
});

// Post Detail Page
app.get("/post/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const [[post]] = await pool.execute(
      `SELECT p.*, u.username AS author, c.name AS company_name, c.company_id
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

// Vote on Post
app.post("/vote/post/:postId", ensureAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const { vote_type } = req.body;
  try {
    await pool.execute(
      `INSERT INTO vote (user_id, post_id, vote_type)
       VALUES (?, ?, ?)`,
      [req.user.user_id, postId, vote_type]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error voting:", err);
    res.redirect("back");
  }
});

// Comment on Post
app.post("/comment/:postId", ensureAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  try {
    await pool.execute(
      `INSERT INTO comment (user_id, post_id, content)
       VALUES (?, ?, ?)`,
      [req.user.user_id, postId, content]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error commenting:", err);
    res.redirect("back");
  }
});

// Company Response to Post
app.post("/respond/:postId", ensureAuthenticated, async (req, res) => {
  if (req.user.role !== "company") return res.status(403).send("Access denied");

  const { postId } = req.params;
  const { content } = req.body;

  try {
    await pool.execute(
      `INSERT INTO response (post_id, company_id, content)
       VALUES (?, ?, ?)`,
      [postId, req.user.company_id, content]
    );
    res.redirect(`/post/${postId}`);
  } catch (err) {
    console.error("Error submitting response:", err);
    res.status(500).send("Error submitting response");
  }
});

// User Profile Page
app.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const [posts] = await pool.execute(
      `SELECT * FROM post WHERE user_id = ? ORDER BY timestamp DESC`,
      [req.user.user_id]
    );

    const [comments] = await pool.execute(
      `SELECT c.*, p.title FROM comment c
       JOIN post p ON c.post_id = p.post_id
       WHERE c.user_id = ?
       ORDER BY c.timestamp DESC`,
      [req.user.user_id]
    );

    res.render("profile", { posts, comments });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Failed to load profile");
  }
});

// Company Public Profile Page
app.get("/company/:id", async (req, res) => {
  const companyId = req.params.id;
  try {
    const [[company]] = await pool.execute(
      `SELECT * FROM company WHERE company_id = ?`,
      [companyId]
    );

    const [posts] = await pool.execute(
      `SELECT p.*, u.username,
              (SELECT COUNT(*) FROM vote WHERE post_id = p.post_id AND vote_type = 'up') AS upvotes,
              (SELECT COUNT(*) FROM vote WHERE post_id = p.post_id AND vote_type = 'down') AS downvotes
       FROM post p
       JOIN user u ON p.user_id = u.user_id
       WHERE p.company_id = ? AND p.status = 'active'
       ORDER BY p.timestamp DESC`,
      [companyId]
    );

    res.render("companyProfile", { company, posts });
  } catch (err) {
    console.error("Error loading company profile:", err);
    res.status(500).send("Error loading company page");
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
