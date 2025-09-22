import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/teacher/classes/attendance-report");
        setClasses(res.data.classes || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <p className="text-gray-500 text-center mt-10">Loading classes...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Blizz Attendance Reports</h1>
      <p className="text-center text-gray-600 mb-8">
        Select a class to view its detailed attendance summary.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.classId}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{cls.className}</h2>
            <p className="text-gray-500 mb-1">
              <span className="font-medium">Subject:</span> {cls.subject}
            </p>
            <p className="text-gray-500 mb-4">
              <span className="font-medium">Sessions:</span> {cls.sessionsCount}
            </p>
            <Link
              to={`/teacher/classes/${cls.classId}/attendance`}
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-2xl shadow-md transition-all duration-200 w-full text-center"
            >
              View Report
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
