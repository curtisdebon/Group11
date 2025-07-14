const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login page
router.get("/login", (req, res) => {
    res.render("login");
});

// Logout
router.get("/logout", (req, res) => {
    res.clearCookie("WebReviews");
    res.redirect("/");
});

// Login logic
router.post("/login", async (req, res) => {
    let errors = [];
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string" || username.trim() === "") {
        errors.push("Invalid username and/or password.");
        return res.render("login", { errors });
    }

    try {
        const [rows] = await pool.execute("SELECT * FROM user WHERE username = ?", [username]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
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

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("login", { errors: ["Login failed."] });
    }
});

// Register logic
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

