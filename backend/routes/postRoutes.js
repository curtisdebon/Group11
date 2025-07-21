const express = require('express');
const router = express.Router();
const pool = require('../db');
const { ensureAuthenticated } = require('../middleware/auth');

// GET: Show form to create a new post for a specific company
router.get('/company/:id/createPost', ensureAuthenticated, async (req, res) => {
  const company_id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM company WHERE company_id = ?', [company_id]);
    if (!rows.length) return res.status(404).send('Company not found');
    res.render('createPost', { company: rows[0], errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading company");
  }
});

// POST: Handle new post submission
router.post('/createPost', ensureAuthenticated, async (req, res) => {
  const { title, category = 'review', rating, body, company_id } = req.body;
  const user_id = req.user.user_id;

  if (!title || !rating || !body || !company_id) {
    return res.render("createPost", { company: { company_id }, errors: ["All fields are required."] });
  }

  try {
    await pool.query(
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

module.exports = router;
