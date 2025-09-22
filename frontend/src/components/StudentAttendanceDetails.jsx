import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const StudentAttendanceDetails = () => {
  const { classId, studentId } = useParams();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await api.get(
        `/teacher/classes/${classId}/students/${studentId}/attendance-details`
      );
      setDetails(res.data);
    } catch (err) {
      console.error("Error fetching student details:", err);
    }
  };

  if (!details) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-purple-100 p-4 rounded shadow-md">
        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          {details.studentName}'s Attendance
        </h2>
        <p className="text-gray-700">
          Class: <span className="font-semibold">{details.className}</span> |{" "}
          Subject: <span className="font-semibold">{details.subject}</span>
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded shadow p-4">
          <p className="text-gray-500">Total Sessions</p>
          <p className="font-bold text-lg">{details.totalSessions}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-green-600 font-semibold">Present</p>
          <p className="font-bold text-lg">{details.presentCount}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-red-600 font-semibold">Absent</p>
          <p className="font-bold text-lg">{details.absentCount}</p>
        </div>
      </div>

      {/* Session Report */}
      <div>
        <h3 className="text-xl font-bold mb-3">Session Report</h3>
        <ul className="space-y-3">
          {details.report.map((session, idx) => (
            <li
              key={session.sessionId}
              className={`flex justify-between items-center p-3 rounded shadow-sm transition ${
                idx % 2 === 0 ? "bg-purple-50" : "bg-purple-100"
              } hover:bg-purple-200`}
            >
              <div>
                <p className="font-semibold text-gray-700">
                  {new Date(session.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(session.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" - "}
                  {new Date(session.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`flex items-center font-semibold space-x-1 ${
                  session.status === "present"
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {session.status === "present" ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <XCircleIcon className="w-5 h-5" />
                )}
                <span>{session.status.toUpperCase()}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentAttendanceDetails;
