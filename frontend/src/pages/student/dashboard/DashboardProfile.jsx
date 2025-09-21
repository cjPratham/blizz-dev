export default function DashboardProfile({ user }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-purple-600 mb-4">Student Profile</h2>
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.username?.charAt(0) || 'S'}
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg">{user?.username || 'Student User'}</h3>
            <p className="text-gray-600">{user?.email || 'student@example.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}