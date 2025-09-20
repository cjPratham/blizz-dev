const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Class name (e.g. Math 101)
  subject: { type: String, required: true },       // Optional: subject/description
  code: { type: String, required: true, unique: true }, // Join code (shared with students)

  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // linked teacher
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],              // enrolled students

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Class", classSchema);
