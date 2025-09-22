import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
  const [form, setForm] = useState({ name: "", subject: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/teacher/classes", form);
      setForm({ name: "", subject: "" });
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Failed to create class. Please try again.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-purple-50 min-h-screen flex justify-center items-start">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">Create a Class</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Class Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-purple-300 focus:border-purple-600 focus:ring focus:ring-purple-200 rounded p-3 w-full transition"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="border border-purple-300 focus:border-purple-600 focus:ring focus:ring-purple-200 rounded p-3 w-full transition"
            required
          />
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded w-full shadow-md transition"
          >
            Create Class
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClass;
