import { useState, useContext } from 'react';
import { studentAPI } from '../../api/student';
import { AuthContext } from '../../contexts/AuthContext';
import Loader from '../../components/Loader';

export default function JoinClass() {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const { user } = useContext(AuthContext);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await studentAPI.joinClass(classCode.trim());
      setMessage(response.data.msg);
      setSelectedClass(response.data.class);
      setClassCode('');
      
      // Fetch sessions for the joined class
      fetchSessions(response.data.class._id);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error joining class');
      console.error('Join class error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (classId) => {
    try {
      // Fetch active sessions
      const activeResponse = await studentAPI.getActiveSessions(classId);
      setActiveSessions(activeResponse.data || []);
      
      // Fetch upcoming sessions
      const upcomingResponse = await studentAPI.getUpcomingSessions(classId);
      setUpcomingSessions(upcomingResponse.data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  // Function to determine if a session is active (happening now)
  const isSessionActive = (session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    return now >= startTime && now <= endTime;
  };

  // Function to determine if a session is upcoming
  const isSessionUpcoming = (session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    return startTime > now;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#A020F0]">Join a Class</h1>
          <p className="text-gray-600">Enter class code to join new classes</p>
        </div>

        {/* Join Class Form */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <form onSubmit={handleJoinClass} className="flex gap-4">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Enter class code"
              className="flex-1 border-2 border-[#A020F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A020F0]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !classCode.trim()}
              className="bg-[#A020F0] text-white px-6 py-2 rounded-lg hover:bg-[#A020F0]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Class'}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✅ {message}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Sessions Sections - Only show if a class was selected */}
        {selectedClass && (
          <div className="space-y-8">
            {/* Active Sessions Section */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-[#A020F0] mb-6">
                Active Sessions - {selectedClass.name}
              </h2>
              
              {activeSessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">⏰</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No active sessions</h3>
                  <p className="text-gray-600">There are no active sessions for this class right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSessions.map((session) => (
                    <div key={session._id} className="border-2 border-green-500 rounded-xl p-4">
                      <h4 className="font-semibold text-lg text-green-700 mb-2">{session.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {session.location || 'No location specified'}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        ⏰ {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                      </p>
                      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                        Mark Attendance
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Sessions Section */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-[#A020F0] mb-6">
                Upcoming Sessions - {selectedClass.name}
              </h2>
              
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No upcoming sessions</h3>
                  <p className="text-gray-600">Check back later for scheduled sessions.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingSessions.map((session) => (
                    <div key={session._id} className="border-2 border-blue-300 rounded-xl p-4">
                      <h4 className="font-semibold text-lg text-blue-700 mb-2">{session.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {session.location || 'No location specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        ⏰ {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Starts in {Math.ceil((new Date(session.startTime) - new Date()) / (1000 * 60 * 60))} hours
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader message="Processing your request..." />
          </div>
        )}
      </div>
    </div>
  );
}