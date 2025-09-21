export default function DashboardHeader({ user, onRefresh }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md mb-6">
      <h1 className="text-3xl font-bold text-purple-600 mb-2">
        Welcome to Blizz, {user?.username || 'Student'}!
      </h1>
      <p className="text-gray-600">Student Dashboard</p>
      <button 
        onClick={onRefresh}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Refresh Dashboard
      </button>
    </div>
  );
}