import { useEffect, useState } from "react";
import api from "../api/axios";

const StudentCard = ({ student, classId }) => {
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/teacher/attendance/${classId}/${student._id}`);
      setAttendance(res.data.percentage); // backend should return { percentage: 75 }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm flex justify-between items-center">
      <div>
        <p className="font-bold">{student.username}</p>
        <p className="text-sm text-gray-600">{student.email}</p>
      </div>
      <div>
        {attendance !== null ? (
          <span className="text-green-700 font-semibold">
            {attendance}% Attendance
          </span>
        ) : (
          <span className="text-gray-500">Loading...</span>
        )}
      </div>
    </div>
  );
};

export default StudentCard;
