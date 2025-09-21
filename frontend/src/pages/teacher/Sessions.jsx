import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";

const Sessions = () => {
  const { id } = useParams(); // classId
  const [sessions, setSessions] = useState([]);
  const [cls, setCls] = useState(null);
  const [form, setForm] = useState({ startTime: "", endTime: "", method: "geo" });

  useEffect(() => {
    fetchClass();
    fetchSessions();
  }, [id]);

  const fetchClass = async () => {
    try {
      const res = await api.get(`/teacher/classes/${id}`);
      setCls(res.data);
    } catch (err) {
      console.error("Error fetching class:", err);
    }
  };

  const fetchSessions = async () => {
  try {
    const res = await api.get(`/teacher/sessions/${id}`);
    setSessions(res.data.sessions || []); // <- use the sessions array
  } catch (err) {
    console.error("Error fetching sessions:", err);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/teacher/sessions", { ...form, classId: id });
    setForm({ startTime: "", endTime: "", method: "geo" });
    fetchSessions();
  };

  const startSession = async (sessionId) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await api.patch(`/teacher/sessions/${sessionId}/start`, {
          lat: latitude,
          lng: longitude,
        });
        fetchSessions();
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location.");
      }
    );
  };

  const stopSession = async (sessionId) => {
    await api.patch(`/teacher/sessions/${sessionId}/stop`);
    fetchSessions();
  };

  const getAttendanceCount = async (sessionId) => {
    const res = await api.get(`/teacher/sessions/${sessionId}/count`);
    return res.data.count;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Sessions for {cls ? `${cls.name} (${cls.subject})` : "Loading..."}
      </h2>

      {/* Create Session */}
      <form onSubmit={handleSubmit} className="mb-6 space-x-2">
        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="border p-2"
        />
        <input
          type="datetime-local"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          className="border p-2"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>

      {/* List sessions */}
      <ul className="space-y-4">
        {sessions.map((s) => (
          <li key={s._id} className="border p-4 bg-white rounded shadow">
            <p className="font-semibold">
              Start: {new Date(s.startTime).toLocaleString()}
            </p>
            <p>End: {new Date(s.endTime).toLocaleString()}</p>
            <p>Status: {s.active ? "🟢 Active" : "🔴 Stopped"}</p>

            {/* Buttons */}
            {s.active ? (
              <button
                onClick={() => stopSession(s._id)}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => startSession(s._id)}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
              >
                Start
              </button>
            )}

            {/* Attendance Count */}
            {s.active && (
              <AttendanceCounter sessionId={s._id} getCount={getAttendanceCount} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Attendance counter subcomponent
const AttendanceCounter = ({ sessionId, getCount }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const c = await getCount(sessionId);
      setCount(c);
    };
    fetchCount();

    const interval = setInterval(fetchCount, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [sessionId]);

  return <p className="mt-2">✅ Attendance marked: {count}</p>;
};

export default Sessions;
