// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const flagRoutes = require("./routes/flagRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const voteRoutes = require("./routes/voteRoutes");
const companyRoutes = require("./routes/companyRoutes");
const responseRoutes = require("./routes/responseRoutes");
const moderationRoutes = require("./routes/moderationRoutes");
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
app.use("/", postRoutes);
app.use("/", commentRoutes);
app.use("/", voteRoutes);
app.use("/", companyRoutes);
app.use("/", responseRoutes);
app.use("/", moderationRoutes);

// Homepage
app.get("/", async (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("homepage");
});

// Dashboard
app.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const [posts] = await pool.execute(
  `SELECT p.*, u.username, c.name AS company_name, c.company_id,
          (SELECT COUNT(*) FROM vote WHERE target_type = 'post' AND target_id = p.post_id AND vote_type = 'up') AS upvotes,
          (SELECT COUNT(*) FROM vote WHERE target_type = 'post' AND target_id = p.post_id AND vote_type = 'down') AS downvotes
   FROM post p
   JOIN user u ON p.user_id = u.user_id
   JOIN company c ON p.company_id = c.company_id
   WHERE p.status != 'removed'
   ORDER BY p.timestamp DESC`
);

    res.render("dashboard", { user: req.user, posts });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.render("dashboard", { user: req.user, posts: [] });
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


// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
