import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import TeacherLayout from "../layouts/TeacherLayout";
import Dashboard from "../pages/teacher/Dashboard";
import ClassDetails from "../pages/teacher/ClassDetails";
import CreateClass from "../pages/teacher/CreateClass";
import Sessions from "../pages/teacher/Sessions";
import Reports from "../pages/teacher/Reports";


import ProtectedRoute from "./ProtectedRoute";

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
      <Route path="create" element={<CreateClass />} />
      <Route path="class/:id" element={<ClassDetails />} />
      <Route path="/teacher/class/:id/sessions" element={<Sessions />} />

      <Route path="reports" element={<Reports />} />
    </Route>

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="student">
            {/* <DashboardStudent /> */}
            "Student Dashboard Coming Soon"
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
