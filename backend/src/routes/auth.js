const express = require("express");

const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

// Public routes
router.get('/', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});
router.post("/register", register);
router.post("/login", login);

module.exports = router;