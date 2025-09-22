import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const StudentCard = ({ student, classId }) => {
  const [attendance, setAttendance] = useState(null);
  const [totalSessions, setTotalSessions] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/teacher/classes/${classId}/attendance-report`);

      // Find the student's record by matching id
      const studentReport = res.data.report.find(
        (s) => s.studentId === student._id
      );

      if (studentReport) {
        setStudentData(studentReport); // contains studentId, studentName, email, attendancePercentage
        setAttendance(parseFloat(studentReport.attendancePercentage));
      }
      setTotalSessions(res.data.totalSessions);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  if (!studentData) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center transition hover:shadow-lg">
      {/* Student Info */}
      <div className="mb-3 sm:mb-0">
        <Link
          to={`/teacher/classes/${classId}/students/${studentData.studentId}/attendance`}
          className="font-bold text-purple-800 hover:underline text-lg"
        >
          {studentData.studentName}
        </Link>
        <p className="text-sm text-gray-600">{studentData.email}</p>
      </div>

      {/* Attendance Info */}
      <div className="text-right mb-3 sm:mb-0">
        {attendance !== null && totalSessions !== null ? (
          <>
            <p className="text-green-700 font-semibold">
              {attendance}% Attendance
            </p>
            <p className="text-sm text-gray-600">
              Out of {totalSessions} Sessions
            </p>
          </>
        ) : (
          <span className="text-gray-500">Loading...</span>
        )}
      </div>

      {/* View Details Button */}
      <div>
        <Link
          to={`/teacher/classes/${classId}/students/${studentData.studentId}/attendance`}
        >
          <button className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded shadow-md transition w-full sm:w-auto">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;
