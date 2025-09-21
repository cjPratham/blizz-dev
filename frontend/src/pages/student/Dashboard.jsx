import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../api/student';
import { AuthContext } from '../../contexts/AuthContext';
import Loader from '../../components/Loader';

// Helper functions outside the component
const adjustForTimezone = (dateString) => {
  const date = new Date(dateString);
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
};

const categorizeSessions = (sessions) => {
  const now = new Date();
  const active = [];
  const upcoming = [];
  const past = [];

  sessions.forEach(session => {
    const start = adjustForTimezone(session.startTime);
    const end = adjustForTimezone(session.endTime);
    
    if (now >= start && now <= end) {
      active.push(session);
    } else if (start > now) {
      upcoming.push(session);
    } else {
      past.push(session);
    }
  });

  return { active, upcoming, past };
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSessions, setActiveSessions] = useState({});
  const [upcomingSessions, setUpcomingSessions] = useState({});
  const [expandedClass, setExpandedClass] = useState(null);
  const { user: authUser } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time updates useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      if (expandedClass) {
        const allSessions = [
          ...(activeSessions[expandedClass] || []),
          ...(upcomingSessions[expandedClass] || [])
        ];
        
        const categorized = categorizeSessions(allSessions);
        setActiveSessions(prev => ({ ...prev, [expandedClass]: categorized.active }));
        setUpcomingSessions(prev => ({ ...prev, [expandedClass]: categorized.upcoming }));
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [expandedClass, activeSessions, upcomingSessions]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (authUser) {
        setUser(authUser);
      }
      
      try {
        const profileResponse = await studentAPI.getProfile();
        setUser(profileResponse.data.student || profileResponse.data);
      } catch (profileError) {
        console.warn('Could not fetch profile, using auth data:', profileError);
        if (authUser) {
          setUser(authUser);
        }
      }
      
      try {
        const classesResponse = await studentAPI.getClasses();
        setClasses(classesResponse.data);
        
        classesResponse.data.forEach(async (classItem) => {
          await fetchSessions(classItem._id);
        });
      } catch (classesError) {
        console.error('Could not fetch classes:', classesError);
        setError('Could not load classes data');
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (classId) => {
    try {
      try {
        const response = await studentAPI.getAllSessions(classId);
        const categorized = categorizeSessions(response.data || []);
        setActiveSessions(prev => ({ ...prev, [classId]: categorized.active }));
        setUpcomingSessions(prev => ({ ...prev, [classId]: categorized.upcoming }));
      } catch (allSessionsError) {
        console.log('No all-sessions endpoint, using separate endpoints');
        
        const [activeResponse, upcomingResponse] = await Promise.all([
          studentAPI.getActiveSessions(classId).catch(e => ({ data: [] })),
          studentAPI.getUpcomingSessions(classId).catch(e => ({ data: [] }))
        ]);
        
        const allSessions = [
          ...(activeResponse.data || []),
          ...(upcomingResponse.data || [])
        ];
        
        const categorized = categorizeSessions(allSessions);
        setActiveSessions(prev => ({ ...prev, [classId]: categorized.active }));
        setUpcomingSessions(prev => ({ ...prev, [classId]: categorized.upcoming }));
      }
    } catch (err) {
      console.error('Error fetching sessions for class:', classId, err);
    }
  };

  const recategorizeSessions = (classId) => {
    const allSessions = [
      ...(activeSessions[classId] || []),
      ...(upcomingSessions[classId] || [])
    ];
    
    const categorized = categorizeSessions(allSessions);
    setActiveSessions(prev => ({ ...prev, [classId]: categorized.active }));
    setUpcomingSessions(prev => ({ ...prev, [classId]: categorized.upcoming }));
  };

  const toggleClassExpansion = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      if (!activeSessions[classId] && !upcomingSessions[classId]) {
        fetchSessions(classId);
      } else {
        recategorizeSessions(classId);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h1 className="text-3xl font-bold text-[#A020F0] mb-2">
          Welcome to Blizz, {user?.username || 'Student'}!
        </h1>
        <p className="text-gray-600">Student Dashboard</p>
      </div>

      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#A020F0] mb-4">Student Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-[#A020F0] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.username?.charAt(0) || 'S'}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg">{user?.username || 'Student User'}</h3>
                  <p className="text-gray-600">{user?.email || 'student@example.com'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#A020F0] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/student/join-class"
                className="block w-full bg-[#A020F0] text-white text-center py-3 rounded-lg hover:bg-[#A020F0]/90 transition-colors"
              >
                Join New Class
              </Link>
              <Link
                to="/student/attendance-report"
                className="block w-full border-2 border-[#A020F0] text-[#A020F0] text-center py-3 rounded-lg hover:bg-[#A020F0] hover:text-white transition-colors"
              >
                View Attendance Report
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#A020F0]">Your Classes</h2>
              <span className="bg-[#A020F0] text-white px-3 py-1 rounded-full text-sm">
                {classes.length} classes
              </span>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No classes yet</h3>
                <p className="text-gray-600 mb-4">Join your first class to get started</p>
                <Link
                  to="/student/join-class"
                  className="inline-block bg-[#A020F0] text-white px-6 py-2 rounded-lg hover:bg-[#A020F0]/90"
                >
                  Join a Class
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((classItem) => (
                  <div key={classItem._id} className="border-2 border-[#A020F0] rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleClassExpansion(classItem._id)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-[#A020F0]">
                          {classItem.name || `Class`}
                        </h3>
                        <span className="text-sm text-[#A020F0]">
                          {expandedClass === classItem._id ? '▲' : '▼'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Instructor: {classItem.instructor?.name || classItem.instructor || 'No instructor info'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Schedule: {classItem.schedule || 'Schedule not set'}
                      </p>
                    </div>

                    {expandedClass === classItem._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="mb-6">
                          <h4 className="font-semibold text-green-700 mb-3">Active Sessions</h4>
                          {activeSessions[classItem._id]?.length > 0 ? (
                            <div className="space-y-3">
                              {activeSessions[classItem._id].map((session) => (
                                <div key={session._id} className="bg-green-50 p-3 rounded-lg">
                                  <p className="font-medium">{session.title}</p>
                                  <p className="text-sm text-gray-600">
                                    📍 {session.location || 'No location'} • 
                                    ⏰ {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                                  </p>
                                 <Link
  to={`/student/mark-attendance/${session._id}`}
  className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
>
  Mark Attendance
</Link>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No active sessions right now</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-blue-700 mb-3">Upcoming Sessions</h4>
                          {upcomingSessions[classItem._id]?.length > 0 ? (
                            <div className="space-y-3">
                              {upcomingSessions[classItem._id].map((session) => (
                                <div key={session._id} className="bg-blue-50 p-3 rounded-lg">
                                  <p className="font-medium">{session.title}</p>
                                  <p className="text-sm text-gray-600">
                                    📍 {session.location || 'No location'} • 
                                    ⏰ {new Date(session.startTime).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No upcoming sessions</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}