import { Link } from 'react-router-dom';

export default function DashboardQuickActions() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-purple-600 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        <Link
          to="/student/join-class"
          className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Join New Class
        </Link>
        <Link
          to="/student/attendance-report"
          className="block w-full border-2 border-purple-600 text-purple-600 text-center py-3 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
        >
          View Attendance Report
        </Link>
      </div>
    </div>
  );
}