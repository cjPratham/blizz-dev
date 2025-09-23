import { useState, useEffect } from "react";
import api from "../../api/axios";

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: "", subject: "" });
  const [editingId, setEditingId] = useState(null);

  // fetch classes on load
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/teacher/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/teacher/classes/${editingId}`, form);
      } else {
        await api.post("/teacher/classes", form);
      }
      setForm({ name: "", subject: "" });
      setEditingId(null);
      fetchClasses();
    } catch (err) {
      console.error("Error saving class", err);
    }
  };

  const handleEdit = (cls) => {
    setForm({ name: cls.name, subject: cls.subject });
    setEditingId(cls._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await api.delete(`/teacher/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error("Error deleting class", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">
        Manage Classes
      </h2>

      {/* Create / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 flex flex-wrap gap-3 items-center bg-purple-50 p-4 rounded-lg shadow"
      >
        <input
          type="text"
          placeholder="Class Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1 border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="flex-1 border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition">
          {editingId ? "Update" : "Create"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", subject: "" });
              setEditingId(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Classes List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="border border-purple-200 rounded-lg p-5 shadow hover:shadow-lg bg-white transition"
          >
            <h3 className="font-bold text-lg text-purple-800">
              {cls.name}
              <br />
               <span className="text-gray-400">{cls.subject}</span>
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Code: <span className="font-mono text-purple-600">{cls.code}</span>
            </p>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(cls)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-lg transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cls._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageClasses;
