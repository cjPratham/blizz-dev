import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { studentAPI } from '../../../api/student';
import DashboardHeader from './DashboardHeader';
import DashboardProfile from './DashboardProfile';
import DashboardClasses from './DashboardClasses';
import DashboardQuickActions from './DashboardQuickActions';
import Loader from '../../../components/Loader';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: authUser } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (authUser) setUser(authUser);
      
      try {
        const profileResponse = await studentAPI.getProfile();
        setUser(profileResponse.data.student || profileResponse.data);
      } catch (profileError) {
        console.warn('Could not fetch profile, using auth data:', profileError);
        if (authUser) setUser(authUser);
      }
      
      try {
        const classesResponse = await studentAPI.getClasses();
        setClasses(classesResponse.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DashboardHeader user={user} onRefresh={fetchDashboardData} />
      
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          {error}
          <button 
            onClick={fetchDashboardData}
            className="ml-4 text-purple-600 underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <DashboardProfile user={user} />
          <DashboardQuickActions />
        </div>

        <div className="lg:col-span-2">
          <DashboardClasses 
            classes={classes} 
            error={error}
            onRefresh={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  );
}