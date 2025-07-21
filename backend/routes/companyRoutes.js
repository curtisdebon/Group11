const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/company/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [[company]] = await pool.execute("SELECT * FROM company WHERE company_id = ?", [id]);
    const [posts] = await pool.execute("SELECT * FROM post WHERE company_id = ? AND status = 'active'", [id]);

    res.render("companyProfile", { company, posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading company");
  }
});

module.exports = router;
