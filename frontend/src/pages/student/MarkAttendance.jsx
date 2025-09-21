// pages/student/MarkAttendance.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentAPI } from "../../api/student";
import Loader from "../../components/Loader";
import GeoLocation from "../../components/GeoLocation";

export default function MarkAttendance() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); // 'success', 'error', 'processing'
  const [message, setMessage] = useState("");

  const handleLocationDetected = async ({ lat, lng }) => {
    setLoading(true);
    setStatus("processing");
    setMessage("Location detected. Marking attendance...");

    try {
      // Call backend API with coordinates
      const response = await studentAPI.markAttendance({
        sessionId,
        studentLat: lat,
        studentLng: lng,
        status: "present",
      });

      setStatus("success");
      setMessage(response.msg || "Attendance marked successfully!");

      // Redirect to dashboard after 2s
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.msg || error.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setStatus("");
    setMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader message={message} />
          {status === "processing" && (
            <p className="text-gray-600 mt-4">Please wait...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl p-6 shadow-md text-center">
        <h1 className="text-2xl font-bold text-[#A020F0] mb-4">Mark Attendance</h1>

        {status === "success" ? (
          <div>
            <div className="text-5xl text-green-500 mb-4">✅</div>
            <p className="text-green-700 text-lg mb-4">{message}</p>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        ) : status === "error" ? (
          <div>
            <div className="text-5xl text-red-500 mb-4">❌</div>
            <p className="text-red-700 text-lg mb-4">{message}</p>
            <button
              onClick={retry}
              className="bg-[#A020F0] text-white px-6 py-2 rounded-lg hover:bg-[#A020F0]/90"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="ml-4 border border-[#A020F0] text-[#A020F0] px-6 py-2 rounded-lg hover:bg-[#A020F0] hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          // Initial screen → show "Mark Attendance" button
          <GeoLocation onLocationDetected={handleLocationDetected} />
        )}
      </div>
    </div>
  );
}
