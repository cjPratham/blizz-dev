const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const auth = require("./src/routes/authRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: "https://blizz-attendance.vercel.app", // frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // if sending cookies or auth headers
  })
);
app.options("*", cors());
app.use(express.json());

app.use("/api/auth",auth);
app.use("/api/teacher",require("./src/routes/teacherRoutes"));
app.use("/api/student",require("./src/routes/studentRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
