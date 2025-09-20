// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  status: { type: String, enum: ["present", "absent"], default: "absent" },

  markedAt: { type: Date, default: Date.now }
}, { timestamps: true });

attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("attendance", attendanceSchema);
