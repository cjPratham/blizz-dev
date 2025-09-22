import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import StudentCard from "../../components/StudentCard";

const ClassDetails = () => {
  const { id } = useParams();
  const [cls, setCls] = useState(null);

  useEffect(() => {
    fetchClass();
  }, [id]);

  const fetchClass = async () => {
    try {
      const res = await api.get(`/teacher/classes/${id}`);
      setCls(res.data);
    } catch (err) {
      console.error("Error fetching class details:", err);
    }
  };

  if (!cls) return <p className="text-gray-500">Loading class details...</p>;

  return (
    <div className="p-4 md:p-6 bg-purple-50 min-h-screen">
      {/* Class Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-purple-800">
          {cls.name} <span className="text-gray-600 text-lg">({cls.subject})</span>
        </h2>
        <Link
          to={`/teacher/class/${id}/sessions`}
          className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded shadow-md transition"
        >
          Manage Sessions
        </Link>
      </div>

      {/* Class Code */}
      <p className="mb-6 text-gray-700">
        Class Code: <span className="font-mono text-purple-900">{cls.code}</span>
      </p>

      {/* Students List */}
      <h3 className="text-xl font-semibold text-purple-800 mb-4">Students</h3>
      {cls.students.length === 0 ? (
        <p className="text-gray-500">No students enrolled in this class yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cls.students.map((s) => (
            <StudentCard key={s._id} student={s} classId={id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassDetails;
