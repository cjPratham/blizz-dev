const express = require("express");
const {
  joinClass,
  getMyClasses,
  markAttendance,
  getAttendanceHistory,
  getProfile,
  
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected and only for students
router.use(protect);
router.use(authorize("student"));

// Student profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Class-related routes
router.post("/join-class", joinClass);
router.get("/my-classes", getMyClasses);

// Attendance routes
router.post("/mark-attendance", markAttendance);
router.get("/attendance-history", getAttendanceHistory);

module.exports = router;