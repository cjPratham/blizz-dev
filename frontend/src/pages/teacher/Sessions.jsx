import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";

// Helper functions
const formatIST = (utcDate) => {
  return new Date(utcDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
};

// Converts UTC string to 'YYYY-MM-DDTHH:mm' for datetime-local input
const utcToLocalInput = (utcDate) => {
  if (!utcDate) return "";
  const date = new Date(utcDate);
  const off = date.getTimezoneOffset() * 60000; // offset in ms
  const local = new Date(date.getTime() - off);
  return local.toISOString().slice(0, 16);
};

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
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert local datetime input to UTC before sending
      const payload = {
        classId: id,
        method: form.method,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };

      await api.post("/teacher/sessions", payload);
      setForm({ startTime: "", endTime: "", method: "geo" });
      fetchSessions();
    } catch (err) {
      console.error("Error creating session:", err);
    }
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
    <div className="p-4 md:p-6 bg-purple-50 min-h-screen">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-purple-800">
        Sessions for {cls ? `${cls.name} (${cls.subject})` : "Loading..."}
      </h2>

      {/* Create Session Form */}
      <form className="mb-6 flex flex-col md:flex-row gap-2" onSubmit={handleSubmit}>
        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <input
          type="datetime-local"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <button
          type="submit"
          className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded shadow-md transition"
        >
          Create Session
        </button>
      </form>

      {/* Sessions List */}
      <ul className="space-y-4">
        {sessions.map((s) => (
          <li
            key={s._id}
            className="border rounded-lg p-4 bg-white shadow-md flex flex-col md:flex-row md:justify-between md:items-center gap-3"
          >
            <div className="flex-1">
              <p className="font-semibold">Start: {formatIST(s.startTime)}</p>
              <p>End: {formatIST(s.endTime)}</p>
              <p>
                Status:{" "}
                <span className={`font-semibold ${s.active ? "text-green-600" : "text-red-600"}`}>
                  {s.active ? "🟢 Active" : "🔴 Stopped"}
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {s.active ? (
                <button
                  onClick={() => stopSession(s._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-md transition"
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => startSession(s._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition"
                >
                  Start
                </button>
              )}

              {s.active && (
                <AttendanceCounter sessionId={s._id} getCount={getAttendanceCount} />
              )}
            </div>
          </li>
        ))}
      </ul>

      {sessions.length === 0 && (
        <p className="mt-4 text-gray-500">No sessions created yet.</p>
      )}
    </div>
  );
};

const AttendanceCounter = ({ sessionId, getCount }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const c = await getCount(sessionId);
      setCount(c);
    };
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, [sessionId, getCount]);

  return (
    <p className="mt-2 font-semibold text-purple-700">
      ✅ Attendance marked: {count}
    </p>
  );
};

export default Sessions;
