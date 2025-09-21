import { useState } from "react";
import { signup } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "student" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80 space-y-3">
        <h2 className="text-xl font-bold text-center">Signup</h2>

        <input name="username" placeholder="Username" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2 rounded" />

        <select name="role" onChange={handleChange} className="w-full border p-2 rounded">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <button className="w-full bg-blue-500 text-white p-2 rounded">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
