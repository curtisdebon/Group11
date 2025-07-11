require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser')
const express = require("express")
const db = require("better-sqlite3")("webReview.db")
db.pragma("journal_mode = WAL")

//sample database setup
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        email STRING NOT NULL UNIQUE,
        password STRING NOT NULL    
        )
        `).run()
})

createTables()

//db setup end

const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(function (req, res, next) {
    res.locals.errors = []

    //decode cookie
    try {
        const decoded = jwt.verify(req.cookies.WebReviews, process.env.JWTSECRET)
        req.user = decoded
    } catch(err) {
        req.user = false
    }

    res.locals.user = req.user
    console.log(req.user)

    next()
})

app.get("/", (req, res) => {
    if (req.user) {
        return res.render("dashboard")
    }

    res.render("homepage")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/logout", (req, res) => {
    res.clearCookie("WebReviews")
    res.redirect("/")
})

app.post("/login", (req, res) => {
    let errors = []

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.username !== "string") req.body.password = ""

    if (req.body.username.trim() == "") errors = ["Invalid username and/or password."]
    if (req.body.username == "") errors = ["Invalid username and/or password."]

    if (errors.length) {
        return res.render("login", {errors})
    }

    const isUserInDB = db.prepare("SELECT * FROM users WHERE USERNAME = ?")
    const userInDB = isUserInDB.get(req.body.username)

    if (!userInDB) {
        errors = ["Invalid username and/or password."]
        return res.render("login", {errors})
    }

    const isMatch = bcrypt.compareSync(req.body.password, userInDB.password)
    if (!isMatch) {
        errors = ["Invalid username and/or password."]
        return res.render("login", {errors})
    }

    //Sucess login, cookie and redirect
    const tokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,skyColor: "blue", userid: userInDB.id}, process.env.JWTSECRET)
    res.cookie("WebReviews", tokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.redirect("/")
})

app.post("/register", (req, res) => {
    const errors = []

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.username !== "string") req.body.email = ""
    if (typeof req.body.username !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("Username is required.")
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be at least 3 characters.")
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username may only contain letters and numbers")

    if (!req.body.email) errors.push("Email is required.")
    if (req.body.email && !(req.body.email.indexOf('@') > -1)) errors.push("Must be valid email.")

    if (!req.body.password) errors.push("Password is required.")
    if (req.body.password && req.body.password.length < 7) errors.push("Password must be at least 7 characters.")

    if (errors.length) {
        return res.render("homepage", {errors})
    } 

    // save user into Database
    const salt = bcrypt.genSaltSync(10)
    req.body.password = bcrypt.hashSync(req.body.password, salt)

    const statement = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)")
    const result = statement.run(req.body.username, req.body.email, req.body.password)
    
    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?")
    const ourUser = lookupStatement.get(result.lastInsertRowid)

    //log user with cookie
    const tokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,skyColor: "blue", userid: ourUser.id}, process.env.JWTSECRET)
    res.cookie("WebReviews", tokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.redirect("/")
    
})

app.listen("3000")