const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

const router = express.Router();

// ====================== PROFILE ROUTES ====================== //

// Get student profile
router.get("/profile", protect, authorize("student"), studentController.getProfile);

// ====================== CLASS ROUTES ====================== //

// Join a class with code
router.post("/classes/join", protect, authorize("student"), studentController.joinClass);

// Get all classes for the student
router.get("/classes", protect, authorize("student"), studentController.getStudentClasses);

// Get active sessions for a class
router.get("/classes/:classId/active-sessions", protect, authorize("student"), studentController.getActiveSessions);

// ====================== ATTENDANCE ROUTES ====================== //

// Mark attendance for a session
router.post("/attendance/mark", protect, authorize("student"), studentController.markAttendance);

// Get attendance history
router.get("/attendance/history", protect, authorize("student"), studentController.getAttendanceHistory);

//Get attendance percentage
router.get("/attendance-percentage/:classId", protect, authorize("student"), studentController.getAttendancePercentage);

module.exports = router;