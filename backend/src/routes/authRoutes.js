const express = require("express");
const { register, login } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// unprotected routes
router.post("/register", register);
router.post("/login", login);

// Example protected route
router.get("/profile", protect, (req, res) => {
  res.json({ msg: "Profile data", user: req.user });
});

// Example role-based route
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ msg: "Admin only data" });
});

module.exports = router;
