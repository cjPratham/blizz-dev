const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  method: { 
    type: String, 
    enum: ["manual", "geo", "bluetooth"], 
    default: "manual" 
  },

  active: { type: Boolean, default: true }, // session status (open/closed)

  // Geo-location of the teacher (latitude and longitude)
  geoLocation: {
    lat: { type: Number, required: function() { return this.method === "geo"; } },
    lng: { type: Number, required: function() { return this.method === "geo"; } }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Session", sessionSchema);
