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

        // const currentTime = new Date();
        const sessions = await Session.find({
            classId,
            active: true
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
        const { sessionId, studentLat, studentLng, status } = req.body;
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
            return res.status(400).json({ msg: `Attendance can only be marked during session hours current time:${currentTime}session starts at ${session.startTime}` });
        }

        // 4. Geolocation validation (if session method is 'geo')
        if (session.method === "geo") {
            if (!session.geoLocation) {
                return res.status(400).json({ msg: "Geo-location not set for this session" });
            }

            
            const withinRadius = isWithinRadius(
                { lat: studentLat, lng: studentLng },     // Student location
                { lat: session.geoLocation.lat, lng: session.geoLocation.lng }, // Teacher location
                50 // 10 meters threshold
            );

            if (!withinRadius) {
                return res.status(400).json({
                    msg: `You are too far from the class location${withinRadius}`,
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
            status: status,
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


// @desc    Get student attendance percentage for a class
// @route   GET /api/student/attendance-percentage/:classId
// @access  Private (Student)
exports.getAttendancePercentage = async (req, res) => {
    try {
        const { classId } = req.params;
        const studentId = req.user.id;

        // Get total sessions for the class
        const totalSessions = await Session.countDocuments({ classId });
        
        // Get attended sessions count for the student
        const attendedSessions = await Attendance.countDocuments({
            classId,
            studentId,
            status: "present"
        });

        // Calculate percentage
        const percentage = totalSessions === 0 ? 0 : (attendedSessions / totalSessions) * 100;

        // Check if above 75%
        const isAboveThreshold = percentage >= 75;

        res.json({
            classId,
            totalSessions,
            attendedSessions,
            percentage: percentage.toFixed(2),
            status: isAboveThreshold ? "Satisfactory" : "Needs improvement",
            message: isAboveThreshold 
                ? "Your attendance is good! Keep it up!" 
                : "Your attendance is below 75%. Please attend more classes."
        });

    } catch (err) {
        res.status(500).json({ msg: "Error calculating attendance percentage", error: err.message });
    }
};