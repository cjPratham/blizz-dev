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
    const res = await api.get(`/teacher/classes/${id}`);
    setCls(res.data);
  };

  if (!cls) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{cls.name} ({cls.subject})</h2>
        <Link
          to={`/teacher/class/${id}/sessions`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Manage Sessions
        </Link>
      </div>

      <p className="mb-4">Code: <span className="font-mono">{cls.code}</span></p>

      <h3 className="mt-4 font-semibold mb-2">Students</h3>
      <div className="space-y-3">
        {cls.students.map((s) => (
          <StudentCard key={s._id} student={s} classId={id} />
        ))}
      </div>
    </div>
  );
};

export default ClassDetails;
