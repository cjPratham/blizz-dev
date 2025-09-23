const Class = require("../models/Class");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const Student = require("../models/User"); 
const User = require("../models/User"); // Teacher Profile
const mongoose = require("mongoose");

// ===================== Teacher Profile =====================
exports.getTeacherProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Unauthorized: No user info" });
    }

    const teacher = await User.findById(req.user.id).select("-password");
    if (!teacher) return res.status(404).json({ msg: "Teacher not found" });
    if (teacher.role !== "teacher") return res.status(403).json({ msg: "Access denied: Not a teacher" });

    res.json({
      teacherId: teacher._id,
      username: teacher.username,
      email: teacher.email,
      role: teacher.role,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    });
  } catch (err) {
    console.error("Error in getTeacherProfile:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ===================== Class Management =====================
exports.createClass = async (req, res) => {
  try {
    const { name, subject } = req.body;
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();

    const newClass = new Class({
      name,
      subject,
      code,
      teacher: req.user.id,
    });

    await newClass.save();
    res.status(201).json({ msg: "Class created successfully", class: newClass });
  } catch (err) {
    res.status(500).json({ msg: "Error creating class", error: err.message });
  }
};

exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user.id }).populate("students", "username email");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching classes", error: err.message });
  }
};

exports.getClassDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await Class.findOne({ _id: id, teacher: req.user.id })
      .populate("students", "username email");

    if (!cls) return res.status(404).json({ msg: `Class not found ${id}` });
    res.json(cls);
  } catch (err) {
    console.log("Error in getClassDetails:", err);
    res.status(500).json({ msg: "Error fetching class details", error: err.message });
  }
};

// ===================== Session Management =====================
exports.createSession = async (req, res) => {
  try {
    const { classId, startTime, endTime } = req.body;

    if (!classId || !startTime || !endTime) {
      return res.status(400).json({ msg: "classId, startTime, endTime are required" });
    }

    const session = new Session({
      classId,
      teacherId: req.user.id,
      startTime,
      endTime,
      method: "geo",
      geoLocation: { lat: 0, lng: 0 },
      active: false,
    });

    await session.save();
    res.status(201).json({ msg: "Session created", session });
  } catch (err) {
    res.status(500).json({ msg: "Error creating session", error: err.message });
  }
};

exports.startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    if (session.method === "geo") {
      const { lat, lng } = req.body;
      if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({ msg: "Latitude and longitude required for geo session" });
      }
      session.geoLocation = { lat, lng };
    }

    session.active = true;
    await session.save();
    res.json({ msg: "Session started", session });
  } catch (err) {
    res.status(500).json({ msg: "Error starting session", error: err.message });
  }
};

exports.stopSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    session.active = false;
    await session.save();
    res.json({ msg: "Session stopped", session });
  } catch (err) {
    res.status(500).json({ msg: "Error stopping session", error: err.message });
  }
};

exports.getSessionByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    if (!classId) return res.status(400).json({ msg: "classId is required" });

    const sessions = await Session.find({ classId, teacherId: req.user.id }).sort({ startTime: -1 });
    res.status(200).json({ msg: "Sessions fetched", sessions });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching sessions", error: err.message });
  }
};

exports.getSessionAttendanceCount = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const count = await Attendance.countDocuments({ sessionId });
    res.json({ sessionId, count });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching count", error: err.message });
  }
};

// ===================== Attendance Management =====================
exports.markManualAttendance = async (req, res) => {
  try {
    const { sessionId, studentId, status } = req.body;

    const record = await Attendance.findOneAndUpdate(
      { sessionId, studentId },
      { status },
      { new: true, upsert: true }
    );

    res.json({ msg: "Manual attendance updated", record });
  } catch (err) {
    res.status(500).json({ msg: "Error updating attendance", error: err.message });
  }
};

exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Attendance.findOne({ sessionId });
    if (!session) return res.status(404).json({ msg: "Session not found" });

    const classId = session.classId;
    const students = await Student.find({ classId }).select("name _id");
    const records = await Attendance.find({ sessionId }).select("studentId status -_id");

    const recordMap = {};
    records.forEach(r => (recordMap[r.studentId.toString()] = r.status));

    const attendanceList = students.map(student => ({
      studentName: student.name,
      status: recordMap[student._id.toString()] || "absent",
    }));

    res.json({ sessionId, attendance: attendanceList });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching attendance", error: err.message });
  }
};

exports.getClassAttendanceReport = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await Class.findById(classId).populate("students", "username email");
    if (!cls) return res.status(404).json({ msg: "Class not found" });

    const students = cls.students;
    const sessions = await Session.find({ classId });
    const totalSessions = sessions.length;

    const reportPromises = students.map(async (student) => {
      const attendedCount = await Attendance.countDocuments({
        classId,
        studentId: student._id,
        status: "present",
      });

      const percentage = totalSessions === 0 ? 0 : (attendedCount / totalSessions) * 100;

      return {
        studentId: student._id,
        studentName: student.username,
        email: student.email,
        attendancePercentage: percentage.toFixed(2),
      };
    });

    const report = await Promise.all(reportPromises);

    res.json({
      classId,
      className: cls.name,
      totalSessions,
      report,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching attendance report", error: err.message });
  }
};

exports.getStudentAttendanceDetails = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const cls = await Class.findById(classId).populate("students", "username email");
    if (!cls) return res.status(404).json({ msg: "Class not found" });

    const student = cls.students.find(s => s._id.toString() === studentId);
    if (!student) return res.status(404).json({ msg: "Student not found in this class" });

    const sessions = await Session.find({ classId }).sort({ startTime: 1 });
    const attendanceRecords = await Attendance.find({ classId, studentId });

    const attendanceMap = {};
    attendanceRecords.forEach(rec => (attendanceMap[rec.sessionId.toString()] = rec.status));

    const report = sessions.map(session => ({
      sessionId: session._id,
      date: session.startTime.toISOString().split("T")[0],
      startTime: session.startTime,
      endTime: session.endTime,
      status: attendanceMap[session._id.toString()] || "absent",
    }));

    const presentCount = report.filter(r => r.status === "present").length;
    const absentCount = report.filter(r => r.status === "absent").length;

    res.json({
      classId,
      className: cls.name,
      subject: cls.subject,
      studentId,
      studentName: student.username,
      totalSessions: sessions.length,
      presentCount,
      absentCount,
      report,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getClassesForAttendanceReport = async (req, res) => {
  try {
    const teacherId = new mongoose.Types.ObjectId(req.user.id);

    // Aggregate classes with session count
    const classes = await Class.aggregate([
      { $match: { teacher: teacherId } },
      {
        $lookup: {
          from: "sessions",           // MongoDB collection name
          localField: "_id",
          foreignField: "classId",
          as: "sessions",
        },
      },
      {
        $project: {
          classId: "$_id",
          className: "$name",
          subject: 1,
          sessionsCount: { $size: "$sessions" },
        },
      },
    ]);

    res.json({ classes });
  } catch (err) {
    console.error("Error fetching classes for attendance report:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get detailed class report for all students
exports.getClassAttendanceReportById = async (req, res) => {
  try {
    const { classId } = req.params;

    // 1. Fetch class with teacher & students
    const cls = await Class.findById(classId)
      .populate("teacher", "username email")
      .populate("students", "username email");

    if (!cls) return res.status(404).json({ msg: "Class not found" });

    const totalSessions = await Session.countDocuments({ classId });

    // 2. Build report for each student
    const reportPromises = cls.students.map(async (student) => {
      const presentCount = await Attendance.countDocuments({
        classId,
        studentId: student._id,
        status: "present",
      });

      const absentCount = totalSessions - presentCount;
      const attendancePercentage = totalSessions
        ? ((presentCount / totalSessions) * 100).toFixed(2)
        : 0;

      return {
        studentId: student._id,
        studentName: student.username,
        email: student.email,
        presentCount,
        absentCount,
        totalSessions,
        attendancePercentage,
      };
    });

    const report = await Promise.all(reportPromises);

    res.json({
      classId,
      className: cls.name,
      subject: cls.subject,
      teacherName: cls.teacher.username,
      totalSessions,
      report,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching class report", error: err.message });
  }
};

// Detailed class report for all students
exports.getDetailedClassReport = async (req, res) => {
  try {
    const { classId } = req.params;

    // 1. Get class with teacher & students
    const cls = await Class.findById(classId)
      .populate("teacher", "username email")
      .populate("students", "username email");

    if (!cls) return res.status(404).json({ msg: "Class not found" });

    // 2. Get all sessions of this class
    const sessions = await Session.find({ classId }).sort({ startTime: 1 });

    // 3. Build detailed report per student
    const reportPromises = cls.students.map(async (student) => {
      let presentCount = 0;
      let absentCount = 0;

      // Session-wise stats
      const sessionStats = await Promise.all(
        sessions.map(async (session) => {
          const attendance = await Attendance.findOne({
            classId,
            sessionId: session._id,
            studentId: student._id,
          });

          const status = attendance ? attendance.status : "absent";
          if (status === "present") presentCount++;
          else absentCount++;

          return {
            sessionId: session._id,
            date: session.startTime,
            status,
          };
        })
      );

      const totalSessions = sessions.length;
      const attendancePercentage = totalSessions
        ? ((presentCount / totalSessions) * 100).toFixed(2)
        : 0;

      return {
        studentId: student._id,
        studentName: student.username,
        email: student.email,
        sessionStats, // list of session date & status
        totalPresent: presentCount,
        totalAbsent: absentCount,
        totalSessions,
        attendancePercentage,
      };
    });

    const report = await Promise.all(reportPromises);

    res.json({
      classId,
      className: cls.name,
      subject: cls.subject,
      teacherName: cls.teacher.username,
      totalSessions: sessions.length,
      sessions: sessions.map((s) => ({
        sessionId: s._id,
        date: s.startTime,
        endTime: s.endTime,
      })),
      report,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Error fetching detailed class report",
      error: err.message,
    });
  }
};
