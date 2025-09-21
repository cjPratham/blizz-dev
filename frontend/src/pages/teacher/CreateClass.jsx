import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
  const [form, setForm] = useState({ name: "", subject: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/teacher/classes", form);
    setForm({ name: "", subject: "" });
    navigate("/teacher/dashboard"); // back to dashboard
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Create a Class</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Class Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="border p-2 w-full"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateClass;
