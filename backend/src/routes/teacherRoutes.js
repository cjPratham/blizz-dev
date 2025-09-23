const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const teacherController = require("../controllers/teacherController");

const router = express.Router();

// ====================== TEACHER PROFILE ====================== //
router.get("/profile", protect, authorize("teacher"), teacherController.getTeacherProfile);
router.put("/profile", protect, authorize("teacher"), teacherController.updateTeacherProfile);
router.delete("/profile", protect, authorize("teacher"), teacherController.deleteTeacherProfile);

// ====================== CLASS ROUTES ====================== //
router.get("/classes/attendance-report", protect, authorize("teacher"), teacherController.getClassesForAttendanceReport);

// Create a class
router.post("/classes", protect, authorize("teacher"), teacherController.createClass);

// Get all classes for the teacher
router.get("/classes", protect, authorize("teacher"), teacherController.getTeacherClasses);

// Get class details by ID
router.get("/classes/:id", protect, authorize("teacher"), teacherController.getClassDetails);

// Update a class
router.put("/classes/:id", protect, authorize("teacher"), teacherController.updateClass);

// Delete a class
router.delete("/classes/:id", protect, authorize("teacher"), teacherController.deleteClass);


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
// Get class attendance report for download
router.get("/classes/:classId/attendance",protect ,authorize("teacher"), teacherController.getClassAttendanceReportById
);

// Get detailed class attendance report for download
router.get("/classes/:classId/detailed-attendance",protect ,authorize("teacher"), teacherController.getDetailedClassReport
);


// Get attendance report for a class
router.get("/classes/:classId/attendance-report", protect, authorize("teacher"), teacherController.getClassAttendanceReport);
// Get detailed attendance report for a student in a class
router.get(
  "/classes/:classId/students/:studentId/attendance-details",
  teacherController.getStudentAttendanceDetails
);


module.exports = router;
