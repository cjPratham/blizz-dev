// src/api/student.js
import axios from './axios';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const studentAPI = {
  // ====================== PROFILE ROUTES ====================== //
  // Get student profile
  getProfile: () => axios.get('/student/profile', { headers: getAuthHeaders() }),
  
  // ====================== CLASS ROUTES ====================== //
  // Get all classes for the student
  getClasses: () => axios.get('/student/classes', { headers: getAuthHeaders() }),
  
  // Join class with code
  joinClass: (code) => axios.post('/student/classes/join', { code }, { headers: getAuthHeaders() }),
  
  // Get active sessions for a class
  getActiveSessions: (classId) => axios.get(`/student/classes/${classId}/active-sessions`, { headers: getAuthHeaders() }),
  
  // Get upcoming sessions
  getUpcomingSessions: (classId) => axios.get(`/student/classes/${classId}/upcoming-sessions`, { headers: getAuthHeaders() }),
  
  // ====================== ATTENDANCE ROUTES ====================== //
  // Mark attendance
  markAttendance: (data) => axios.post('/student/attendance/mark', data, { headers: getAuthHeaders() }),
  
  // Get attendance history
  getAttendanceHistory: () => axios.get('/student/attendance/history', { headers: getAuthHeaders() }),
  
  // Get attendance percentage
  getAttendancePercentage: (classId) => axios.get(`/student/attendance-percentage/${classId}`, { headers: getAuthHeaders() })
};