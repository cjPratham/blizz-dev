import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import TeacherLayout from "../layouts/TeacherLayout";
import Dashboard from "../pages/teacher/Dashboard";
import ClassDetails from "../pages/teacher/ClassDetails";
import CreateClass from "../pages/teacher/CreateClass";
import Sessions from "../pages/teacher/Sessions";
import Reports from "../pages/teacher/Reports";
import StudentAttendanceDetails from "../components/StudentAttendanceDetails";
import ClassReport from "../components/ClassReport";
import ManageClasses from "../pages/teacher/ManageClasses";


// Update this import path
import DashboardStudent from "../pages/student/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AttendanceReport from "../pages/student/AttendanceReport";
import JoinClass from "../pages/student/JoinClass";
import MarkAttendance from "../pages/student/MarkAttendance";
import TeacherProfile from "../pages/teacher/TeacherProfile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage-class" element={<ManageClasses/>} />
        <Route path="create" element={<CreateClass />} />
        <Route path="class/:id" element={<ClassDetails />} />
        <Route path="class/:id/sessions" element={<Sessions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="classes/:classId/students/:studentId/attendance" element={<StudentAttendanceDetails />}/>
        <Route path="/teacher/classes/:classId/attendance" element={<ClassReport/>}/>
        <Route path="profile" element={<TeacherProfile/>}/>
      </Route>


      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="student">
            <DashboardStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance-report"
        element={
          <ProtectedRoute role="student">
            <AttendanceReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/join-class"
        element={
          <ProtectedRoute role="student">
            <JoinClass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/mark-attendance/:sessionId"
        element={
          <ProtectedRoute role="student">
            <MarkAttendance />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;