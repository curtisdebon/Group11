require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const flagRoutes = require("./routes/flagRoutes");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

// Auth middleware: decode JWT and store user in req.user
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

// Homepage or dashboard
app.get("/", async (req, res) => {
    if (req.user) {
        try {
            const [posts] = await pool.execute("SELECT * FROM post WHERE status = 'active'");
            return res.render("dashboard", { posts });
        } catch (err) {
            console.error("Error fetching posts:", err);
            return res.render("dashboard", { posts: [] });
        }
    }

    res.render("homepage");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
