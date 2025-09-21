import { Link } from 'react-router-dom';

export default function SessionList({ title, sessions, type, loading, onRefresh }) {
  if (loading) {
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-purple-700 mb-3">{title}</h4>
        <p className="text-gray-500 text-sm">Loading sessions...</p>
      </div>
    );
  }

  const bgColor = type === 'active' ? 'bg-green-50' : 'bg-blue-50';
  const textColor = type === 'active' ? 'text-green-700' : 'text-blue-700';

  return (
    <div className={type === 'active' ? 'mb-6' : ''}>
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-semibold ${textColor}`}>{title}</h4>
        <button 
          onClick={onRefresh}
          className="text-sm text-purple-600 hover:text-purple-700"
          title="Refresh sessions"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session._id} className={`${bgColor} p-3 rounded-lg`}>
              <p className="font-medium">{session.title || 'Session'}</p>
              <p className="text-sm text-gray-600">
                📍 {session.location || 'No location'} • 
                ⏰ {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
              </p>
              {type === 'active' && (
                <Link
                  to={`/student/mark-attendance/${session._id}`}
                  className="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Mark Attendance
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No {title.toLowerCase()}</p>
      )}
    </div>
  );
}