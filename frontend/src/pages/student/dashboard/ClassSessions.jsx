import { useState, useEffect } from 'react';
import { studentAPI } from '../../../api/student';
import SessionList from './SessionList';

export default function ClassSessions({ classItem }) {
  const [activeSessions, setActiveSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [classItem._id]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let sessions = [];
      
      try {
        const response = await studentAPI.getAllSessions(classItem._id);
        sessions = response.data || [];
      } catch (allSessionsError) {
        console.log('No all-sessions endpoint, using separate endpoints');
        
        const [activeResponse, upcomingResponse] = await Promise.all([
          studentAPI.getActiveSessions(classItem._id).catch(e => ({ data: [] })),
          studentAPI.getUpcomingSessions(classItem._id).catch(e => ({ data: [] }))
        ]);
        
        sessions = [
          ...(activeResponse.data || []),
          ...(upcomingResponse.data || [])
        ];
      }
      
      // Categorize sessions
      const now = new Date();
      const active = [];
      const upcoming = [];
      
      sessions.forEach(session => {
        if (!session.startTime || !session.endTime) return;
        
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        
        if (now >= start && now <= end) {
          active.push(session);
        } else if (start > now) {
          upcoming.push(session);
        }
      });
      
      setActiveSessions(active);
      setUpcomingSessions(upcoming);
    } catch (err) {
      console.error('Error fetching sessions for class:', classItem._id, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <SessionList 
        title="Active Sessions" 
        sessions={activeSessions} 
        type="active"
        loading={loading}
        onRefresh={fetchSessions}
      />
      
      <SessionList 
        title="Upcoming Sessions" 
        sessions={upcomingSessions} 
        type="upcoming"
        loading={loading}
        onRefresh={fetchSessions}
      />
    </div>
  );
}