import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

const TeacherLayout = () => {
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-purple-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Teacher Panel</h1>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop Links */}
        <nav className="hidden md:flex space-x-4">
          <Link to="/teacher/dashboard" className="hover:bg-purple-800 px-3 py-2 rounded">
            Dashboard
          </Link>
          <Link to="/teacher/manage-class" className="hover:bg-purple-800 px-3 py-2 rounded">
            Manage Classes
          </Link>
          <Link to="/teacher/reports" className="hover:bg-purple-800 px-3 py-2 rounded">
            Reports
          </Link>
          <Link to="/teacher/profile" className="hover:bg-purple-800 px-3 py-2 rounded">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="bg-purple-600 text-white flex flex-col md:hidden space-y-2 p-4">
          <Link
            to="/teacher/dashboard"
            className="hover:bg-purple-800 px-3 py-2 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="manage-class"
            className="hover:bg-purple-800 px-3 py-2 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Manage Classes
          </Link>
          <Link
            to="/teacher/reports"
            className="hover:bg-purple-800 px-3 py-2 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Reports
          </Link>
          <Link
            to="/teacher/profile"
            className="hover:bg-purple-800 px-3 py-2 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
          >
            Logout
          </button>
        </nav>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 bg-purple-50">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
