const Class = require("../models/Class");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const Student = require("../models/User"); 

// Teacher creates a class
exports.createClass = async (req, res) => {
  try {
    const { name, subject } = req.body;
    const code = Math.random().toString(36).substr(2, 6).toUpperCase(); // e.g. "A1B2C3"

    const newClass = new Class({
      name,
      subject,
      code,
      teacher: req.user.id
    });

    await newClass.save();
    res.status(201).json({ msg: "Class created successfully", class: newClass });
  } catch (err) {
    res.status(500).json({ msg: "Error creating class", error: err.message });
  }
};

// Get classes for teacher
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user.id }).populate("students", "username email");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching classes", error: err.message });
  }
};

// Get class details by ID
exports.getClassDetails = async (req, res) => {
  try {
    const { id } = req.params; // route: /teacher/classes/:id
    const cls = await Class.findOne({
      _id: id,
      teacher: req.user.id, // ensure only the owner teacher can fetch it
    }).populate("students", "username email");

    if (!cls) {
      return res.status(404).json({ msg: `Class not found ${id}` });
    }

    res.json(cls);
  } catch (err) {
    console.log("Error in getClassDetails:", err);
    res.status(500).json({ msg: "Error fetching class details", error: err.message });
  }
};

// Create a session (no geo-location needed here)
exports.createSession = async (req, res) => {
  try {
    const { classId, startTime, endTime} = req.body;

    if (!classId || !startTime || !endTime) {
      return res.status(400).json({
        msg: "classId, startTime, endTime, and method are required"
      });
    }

    const session = new Session({
      classId,
      teacherId: req.user.id,
      startTime,
      endTime,
      method:"geo", // default method
      geoLocation: { lat: 0, lng: 0 }, // default placeholder
      active: false,
    });

    await session.save();
    res.status(201).json({ msg: "Session created", session });
  } catch (err) {
    res.status(500).json({ msg: "Error creating session", error: err.message });
  }
};

// Start session (geo-location required if method is 'geo')
exports.startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    if (session.method === "geo") {
      const { lat, lng } = req.body;
      if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({ msg: "Latitude and longitude are required to start geo session" });
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

// Stop session
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

// Get sessions by class ID
exports.getSessionByClassId = async (req, res) => {
  try {
    const { classId } = req.params; // assuming classId is passed as a URL param

    if (!classId) {
      return res.status(400).json({ msg: "classId is required" });
    }

    // Find all sessions for this class created by the logged-in teacher
    const sessions = await Session.find({
      classId,
      teacherId: req.user.id,
    }).sort({ startTime: -1 }); // optional: latest sessions first

    res.status(200).json({ msg: "Sessions fetched", sessions });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching sessions", error: err.message });
  }
};


// Get attendance count for a session
exports.getSessionAttendanceCount = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const count = await Attendance.countDocuments({ sessionId });
    res.json({ sessionId, count });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching count", error: err.message });
  }
};

// Manually mark attendance
exports.markManualAttendance = async (req, res) => {
  try {
    const { sessionId, studentId, status } = req.body;

    let record = await Attendance.findOneAndUpdate(
      { sessionId, studentId },
      { status },
      { new: true, upsert: true } // create if not exists
    );

    res.json({ msg: "Manual attendance updated", record });
  } catch (err) {
    res.status(500).json({ msg: "Error updating attendance", error: err.message });
  }
};

// Get detailed attendance for a session

exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1. Find the session to get classId
    const session = await Attendance.findOne({ sessionId });
    if (!session) return res.status(404).json({ msg: "Session not found" });

    const classId = session.classId;

    // 2. Get all students in the class
    const students = await Student.find({ classId }).select("name _id");

    // 3. Get attendance records for the session
    const records = await Attendance.find({ sessionId }).select("studentId status -_id");

    // 4. Map attendance records for quick lookup
    const recordMap = {};
    records.forEach(r => {
      recordMap[r.studentId.toString()] = r.status;
    });

    // 5. Build final attendance list
    const attendanceList = students.map(student => ({
      studentName: student.name,
      status: recordMap[student._id.toString()] || "absent"
    }));

    res.json({ sessionId, attendance: attendanceList });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching attendance", error: err.message });
  }
};




exports.getClassAttendanceReport = async (req, res) => {
  try {
    const { classId } = req.params;

    // 1. Get the class and its students
    const cls = await Class.findById(classId).populate("students", "name email");
    if (!cls) return res.status(404).json({ msg: "Class not found" });

    const students = cls.students;

    // 2. Get all sessions for this class
    const sessions = await Session.find({ classId });
    const totalSessions = sessions.length;

    // 3. Calculate attendance for each student
    const reportPromises = students.map(async (student) => {
      const attendedCount = await Attendance.countDocuments({
        classId,
        studentId: student._id,
        status: "present"
      });

      const percentage = totalSessions === 0 ? 0 : (attendedCount / totalSessions) * 100;

      return {
        studentName: student.name,
        email: student.email,
        attendancePercentage: percentage.toFixed(2)
      };
    });

    const report = await Promise.all(reportPromises);

    res.json({
      classId,
      className: cls.name,
      totalSessions,
      report
    });

  } catch (err) {
    res.status(500).json({ msg: "Error fetching attendance report", error: err.message });
  }
};


// // Student joins a class with code
// exports.joinClass = async (req, res) => {
//   try {
//     const { code } = req.body;
//     const cls = await Class.findOne({ code });
//     if (!cls) return res.status(404).json({ msg: "Class not found" });

//     if (cls.students.includes(req.user.id)) {
//       return res.status(400).json({ msg: "Already enrolled" });
//     }

//     cls.students.push(req.user.id);
//     await cls.save();

//     res.json({ msg: "Joined class successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Error joining class", error: err.message });
//   }
// };

// // Get active sessions for student
// exports.getActiveSessions = async (req, res) => {
//   try {
//     const { classId } = req.params;
//     const sessions = await AttendanceSession.find({ classId, active: true });
//     res.json(sessions);
//   } catch (err) {
//     res.status(500).json({ msg: "Error fetching sessions", error: err.message });
//   }
// };

// // Get classes for student
// exports.getStudentClasses = async (req, res) => {
//   try {
//     const classes = await Class.find({ students: req.user.id }).populate("teacher", "username email");
//     res.json(classes);
//   } catch (err) {
//     res.status(500).json({ msg: "Error fetching student classes", error: err.message });
//   }
// };