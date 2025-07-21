const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

console.log("✅ authRoutes.js loaded");

// Render Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Render Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("WebReviews");
  res.redirect("/");
});

// Login POST Handler
router.post("/login", async (req, res) => {
  console.log("🔐 POST /login hit");

  const username = req.body.username?.trim();
  const password = req.body.password;

  console.log("Submitted username:", username);
  console.log("Submitted password:", password);
  console.log("Password length:", password.length, "| Raw password:", JSON.stringify(password));

  if (typeof username !== "string" || typeof password !== "string" || username === "") {
    console.log("❌ Invalid input format.");
    return res.render("login", { errors: ["Invalid username and/or password."] });
  }

  try {
    const [rows] = await pool.execute("SELECT * FROM user WHERE username = ?", [username]);
    const user = rows[0];

    console.log("User from DB:", user);

    if (!user) {
      console.log("❌ No user found");
      return res.render("login", { errors: ["Invalid username and/or password."] });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      console.log("❌ Password mismatch");
      return res.render("login", { errors: ["Invalid username and/or password."] });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWTSECRET,
      { expiresIn: "1d" }
    );

    res.cookie("WebReviews", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24
    });

    console.log("✅ Login successful");
    res.redirect("/dashboard");
  } catch (err) {
    console.error("🚨 Login error:", err);
    res.render("login", { errors: ["Login failed."] });
  }
});

// Register POST Handler
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (typeof username !== "string" || username.trim().length < 3)
    errors.push("Username must be at least 3 characters.");
  if (!/^[a-zA-Z0-9]+$/.test(username))
    errors.push("Username may only contain letters and numbers.");
  if (!email.includes("@"))
    errors.push("Must be a valid email.");
  if (password.length < 7)
    errors.push("Password must be at least 7 characters.");

  if (errors.length) return res.render("homepage", { errors });

  try {
    const hashedPwd = await bcrypt.hash(password, 10);
    await pool.execute(
      "INSERT INTO user (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPwd, "consumer"]
    );

    const [rows] = await pool.execute("SELECT * FROM user WHERE user_id = LAST_INSERT_ID()");
    const newUser = rows[0];

    const token = jwt.sign(
      { user_id: newUser.user_id, role: newUser.role },
      process.env.JWTSECRET,
      { expiresIn: "1d" }
    );

    res.cookie("WebReviews", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24
    });

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("homepage", { errors: ["Registration failed. Username or email might already exist."] });
  }
});

module.exports = router;
