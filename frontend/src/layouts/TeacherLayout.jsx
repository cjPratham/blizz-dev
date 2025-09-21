import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const TeacherLayout = () => {
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h1 className="text-xl font-bold">Teacher Panel</h1>
        <nav className="flex flex-col space-y-2">
          <Link to="/teacher/dashboard" className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
    
        </nav>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-700 p-2 rounded w-full"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
