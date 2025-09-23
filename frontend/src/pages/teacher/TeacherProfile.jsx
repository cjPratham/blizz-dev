import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/teacher/profile");
      setProfile(res.data);
      setForm({
        username: res.data.username || "",
        email: res.data.email || "",
        password: "",
      });
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { username: form.username, email: form.email };
      if (form.password) payload.password = form.password;

      const res = await api.put("/teacher/profile", payload);
      setProfile(res.data.teacher);
      setEditing(false);
      setForm((prev) => ({ ...prev, password: "" })); // clear password field
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await api.delete("/teacher/profile");
      alert("Account deleted successfully!");
      localStorage.clear();
      navigate("/signup");
    } catch (err) {
      console.error("Error deleting account", err);
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Teacher Profile</h2>

      {!editing ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p>
            <span className="font-semibold">Username:</span> {profile.username}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {profile.email}
          </p>

          <div className="mt-4 space-x-2">
            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleUpdate}
          className="bg-purple-50 shadow rounded-lg p-6 space-y-4"
        >
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="New Password (leave blank to keep current)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm({ ...form, password: "" }); // reset password on cancel
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TeacherProfile;
