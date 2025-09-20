const User = require("../models/User");
const Class = require("../models/Class");
const Attendance = require("../models/Attendance");

// @desc    Join a class
// @route   POST /api/student/join-class
// @access  Private (Student)
const joinClass = async (req, res) => {
    try {
        const { classCode } = req.body;
        const studentId = req.user.id;

        if (!classCode) {
            return res.status(400).json({ message: "Class code is required" });
        }

        const classToJoin = await Class.findOne({ classCode });
        if (!classToJoin) {
            return res.status(404).json({ message: "Class not found" });
        }

        const isAlreadyEnrolled = classToJoin.students.includes(studentId);
        if (isAlreadyEnrolled) {
            return res.status(400).json({ message: "Already enrolled in this class" });
        }

        classToJoin.students.push(studentId);
        await classToJoin.save();

        res.status(200).json({
            message: "Successfully joined class",
            class: {
                _id: classToJoin._id,
                className: classToJoin.className,
                classCode: classToJoin.classCode
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's classes
// @route   GET /api/student/my-classes
// @access  Private (Student)
const getMyClasses = async (req, res) => {
    try {
        const studentId = req.user.id;

        const classes = await Class.find({ students: studentId })
            .populate('teacher', 'username email')
            .select('className classCode teacher createdAt');

        res.status(200).json({
            count: classes.length,
            classes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Mark attendance
// @route   POST /api/student/mark-attendance
// @access  Private (Student)
const markAttendance = async (req, res) => {
    try {
        const { classId, studentLat, studentLng } = req.body; // Changed from geoLocation to individual lat/lng
        const studentId = req.user.id;

        if (!classId || studentLat === undefined || studentLng === undefined) {
            return res.status(400).json({ message: "Class ID and student coordinates are required" });
        }

        const classExists = await Class.findOne({
            _id: classId,
            students: studentId
        });

        if (!classExists) {
            return res.status(404).json({ message: "Class not found or not enrolled" });
        }

        // HARDCODED TEACHER LOCATION 
        const teacherLocation = {
            lat: 12.9716,  
            lng: 77.5946   
        };

        //  distance check
        const isNearby = (
            Math.abs(teacherLocation.lat - studentLat) <= 0.001 && // ~100m tolerance
            Math.abs(teacherLocation.lng - studentLng) <= 0.001    // ~100m tolerance
        );

        if (!isNearby) {
            return res.status(400).json({ 
                message: "You are too far from the class location",
                required: "Come closer to the classroom to mark attendance"
            });
        }

        // Check if attendance already marked today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingAttendance = await Attendance.findOne({
            student: studentId,
            class: classId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: "Attendance already marked for today" });
        }

        const attendance = new Attendance({
            student: studentId,
            class: classId,
            geoLocation: {
                lat: studentLat,
                lng: studentLng
            },
            status: 'present'
        });

        await attendance.save();

        // Populate the response with class details
        await attendance.populate('class', 'className classCode');

        res.status(200).json({
            message: "Attendance marked successfully",
            attendance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance history
// @route   GET /api/student/attendance-history
// @access  Private (Student)
const getAttendanceHistory = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { classId, startDate, endDate } = req.query;

        let query = { student: studentId };

        if (classId) {
            query.class = classId;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate('class', 'className classCode')
            .sort({ date: -1 });

        res.status(200).json({
            count: attendance.length,
            attendance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user.id)
            .select('-password');

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    joinClass,
    getMyClasses,
    markAttendance,
    getAttendanceHistory,
    getProfile,
    
};