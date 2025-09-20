const Class = require("../models/Class");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const isWithinRadius = require("../utils/geolocation").isWithinRadius;


// @desc    Join class with code
// @route   POST /api/student/join-class
// @access  Private (Student)
exports.joinClass = async (req, res) => {
    try {
        const { code } = req.body;
        const cls = await Class.findOne({ code });

        if (!cls) {
            return res.status(404).json({ msg: "Class not found" });
        }

        if (cls.students.includes(req.user.id)) {
            return res.status(400).json({ msg: "Already enrolled in this class" });
        }

        cls.students.push(req.user.id);
        await cls.save();

        res.json({ msg: "Joined class successfully", class: cls });
    } catch (err) {
        res.status(500).json({ msg: "Error joining class", error: err.message });
    }
};

// @desc    Get student's classes
// @route   GET /api/student/my-classes
// @access  Private (Student)
exports.getStudentClasses = async (req, res) => {
    try {
        const classes = await Class.find({ students: req.user.id })
            .populate("teacher", "username email");
        res.json(classes);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching classes", error: err.message });
    }
};

// @desc    Get active sessions for student's class
// @route   GET /api/student/active-sessions/:classId
// @access  Private (Student)
exports.getActiveSessions = async (req, res) => {
    try {
        const { classId } = req.params;

        // Check if student is enrolled in the class
        const cls = await Class.findOne({ _id: classId, students: req.user.id });
        if (!cls) {
            return res.status(403).json({ msg: "Not enrolled in this class" });
        }

        const currentTime = new Date();
        const sessions = await Session.find({
            classId,
            active: true,
            startTime: { $lte: currentTime },
            endTime: { $gte: currentTime }
        });

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching sessions", error: err.message });
    }
};

// @desc    Mark attendance (with geolocation validation and session check)
// @route   POST /api/student/mark-attendance
// @access  Private (Student)
exports.markAttendance = async (req, res) => {
    try {
        const { sessionId, studentLat, studentLng } = req.body;
        const studentId = req.user.id;

        if (!sessionId || studentLat === undefined || studentLng === undefined) {
            return res.status(400).json({ msg: "Session ID and coordinates are required" });
        }

        // 1. Check if session exists and is active
        const session = await Session.findOne({
            _id: sessionId,
            active: true
        });

        if (!session) {
            return res.status(404).json({ msg: "Session not found or not active" });
        }

        // 2. Check if student is enrolled in the class
        const cls = await Class.findOne({
            _id: session.classId,
            students: studentId
        });

        if (!cls) {
            return res.status(403).json({ msg: "Not enrolled in this class" });
        }

        // 3. Check if session is within time window
        const currentTime = new Date();
        if (currentTime < session.startTime || currentTime > session.endTime) {
            return res.status(400).json({ msg: "Attendance can only be marked during session hours" });
        }

        // 4. Geolocation validation (if session method is 'geo')
        if (session.method === "geo") {
            if (!session.geoLocation) {
                return res.status(400).json({ msg: "Geo-location not set for this session" });
            }

            
            const withinRadius = isWithinRadius(
                { lat: studentLat, lng: studentLng },     // Student location
                { lat: session.geoLocation.lat, lng: session.geoLocation.lng }, // Teacher location
                100 // 100 meters threshold
            );

            if (!withinRadius) {
                return res.status(400).json({
                    msg: "You are too far from the class location",
                    required: "Come within 100m of the classroom"
                });
            }
        }

        // 5. Check if attendance already marked for this session
        const existingAttendance = await Attendance.findOne({
            sessionId,
            studentId
        });

        if (existingAttendance) {
            return res.status(400).json({ msg: "Attendance already marked for this session" });
        }

        // 6. Create attendance record
        const attendance = new Attendance({
            sessionId,
            classId: session.classId,
            studentId,
            status: "present",
            geoLocation: {
                lat: studentLat,
                lng: studentLng
            },
            markedAt: new Date()
        });

        await attendance.save();
        await attendance.populate("sessionId", "method geoLocation");

        res.status(200).json({
            msg: "Attendance marked successfully",
            attendance
        });

    } catch (err) {
        res.status(500).json({ msg: "Error marking attendance", error: err.message });
    }
};

// @desc    Get attendance history for student
// @route   GET /api/student/attendance-history
// @access  Private (Student)
exports.getAttendanceHistory = async (req, res) => {
    try {
        const { classId, startDate, endDate } = req.query;
        const studentId = req.user.id;

        let query = { studentId };

        if (classId) {
            query.classId = classId;
        }

        if (startDate && endDate) {
            query.markedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate("sessionId", "startTime endTime method")
            .populate("classId", "name code")
            .sort({ markedAt: -1 });

        res.json({
            count: attendance.length,
            attendance
        });
    } catch (err) {
        res.status(500).json({ msg: "Error fetching attendance history", error: err.message });
    }
};

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
exports.getProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).select("-password");
        res.json({ student });
    } catch (err) {
        res.status(500).json({ msg: "Error fetching profile", error: err.message });
    }
};