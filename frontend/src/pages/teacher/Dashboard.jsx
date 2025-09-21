import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Dashboard = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const res = await api.get("/teacher/classes");
    setClasses(res.data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Classes</h1>
      <Link to="/teacher/create" className="bg-green-600 text-white px-4 py-2 rounded">
        + Create New Class
      </Link>

      <ul className="mt-6 space-y-4">
        {classes.map((cls) => (
          <li key={cls._id} className="border p-4 rounded bg-white">
            <h3 className="font-bold text-lg">{cls.name} ({cls.subject})</h3>
            <p>Code: <span className="font-mono">{cls.code}</span></p>
            <Link
              to={`/teacher/class/${cls._id}`}
              className="text-blue-600 hover:underline"
            >
              View Details →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
