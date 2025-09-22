import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [teacher, setTeacher] = useState({});

  useEffect(() => {
    fetchClasses();
    fetchProfile();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/teacher/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const teacherRes = await api.get("/teacher/profile");
      setTeacher(teacherRes.data);
    } catch (err) {
      console.error("Error fetching teacher profile:", err);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-800 mb-4 md:mb-0">
          Welcome {teacher.username || "Teacher"}
        </h1>
        <Link
          to="/teacher/create"
          className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded shadow-md transition"
        >
          + Create New Class
        </Link>
      </div>

      {/* Classes Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <li
            key={cls._id}
            className="border rounded-lg bg-white p-5 shadow hover:shadow-lg transition transform hover:-translate-y-1"
          >
            {/* Class Name & Subject */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-purple-900">{cls.name}</h3>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {cls.subject}
              </span>
            </div>

            {/* Class Code */}
            <p className="text-gray-600 mb-4">
              Code: <span className="font-mono text-gray-800">{cls.code}</span>
            </p>

            {/* View Details Button */}
            <Link
              to={`/teacher/class/${cls._id}`}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded shadow-md w-full transition inline-block text-center cursor-pointer"
            >
              View Details
            </Link>
          </li>
        ))}
      </ul>

      {classes.length === 0 && (
        <p className="mt-6 text-gray-500 text-center">No classes created yet.</p>
      )}
    </div>
  );
};

export default Dashboard;
