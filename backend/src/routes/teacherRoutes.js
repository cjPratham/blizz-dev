const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const teacherController = require("../controllers/teacherController");

const router = express.Router();

// ====================== CLASS ROUTES ====================== //

// Create a class
router.post("/classes", protect, authorize("teacher"), teacherController.createClass);

// Get all classes for the teacher
router.get("/classes", protect, authorize("teacher"), teacherController.getTeacherClasses);

// Get class details by ID
router.get("/classes/:id", protect, authorize("teacher"), teacherController.getClassDetails);

// ====================== SESSION ROUTES ====================== //

// Create a session with geo-location
router.post("/sessions", protect, authorize("teacher"), teacherController.createSession);

// get all the sessions for a class
router.get("/sessions/:classId", protect, authorize("teacher"), teacherController.getSessionByClassId);

// Start a session
router.patch("/sessions/:id/start", protect, authorize("teacher"), teacherController.startSession);

// Stop a session
router.patch("/sessions/:id/stop", protect, authorize("teacher"), teacherController.stopSession);

// Get attendance count for a session
router.get("/sessions/:sessionId/count", protect, authorize("teacher"), teacherController.getSessionAttendanceCount);

// ====================== ATTENDANCE ROUTES ====================== //

// Manually mark attendance
router.post("/attendance/manual", protect, authorize("teacher"), teacherController.markManualAttendance);

// Get detailed attendance for a session (all students, present/absent)
router.get("/attendance/:sessionId", protect, authorize("teacher"), teacherController.getSessionAttendance);


// ====================== ATTENDANCE REPORT ====================== //
router.get("/classes/:classId/attendance-report", protect, authorize("teacher"), teacherController.getClassAttendanceReport);


module.exports = router;
