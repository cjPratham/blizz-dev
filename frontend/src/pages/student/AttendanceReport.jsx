import { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student';
import Loader from '../../components/Loader';

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ classId: '', startDate: '', endDate: '' });
  const [attendanceStats, setAttendanceStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, attendanceRes] = await Promise.all([
        studentAPI.getClasses(),
        studentAPI.getAttendanceHistory(filters)
      ]);
      
      setClasses(classesRes.data || []);
      setAttendance(attendanceRes.data.attendance || []);
      
      // Fetch attendance percentage for each class
      if (filters.classId) {
        fetchAttendancePercentage(filters.classId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendancePercentage = async (classId) => {
    try {
      const response = await studentAPI.getAttendancePercentage(classId);
      setAttendanceStats(response.data);
    } catch (error) {
      console.error('Error fetching attendance percentage:', error);
    }
  };

  const handleFilter = () => {
    fetchData();
  };

  const handleClassChange = (classId) => {
    setFilters({...filters, classId});
    if (classId) {
      fetchAttendancePercentage(classId);
    } else {
      setAttendanceStats({});
    }
  };

  if (loading) return <Loader message="Loading attendance report..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">Attendance Report</h1>
        
        {/* Attendance Statistics */}
        {attendanceStats.percentage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Overall Attendance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{attendanceStats.percentage}%</p>
                <p className="text-sm text-blue-800">Percentage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{attendanceStats.attendedSessions}</p>
                <p className="text-sm text-green-800">Attended</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{attendanceStats.totalSessions}</p>
                <p className="text-sm text-gray-800">Total Sessions</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  attendanceStats.status === 'Satisfactory' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {attendanceStats.status}
                </p>
                <p className="text-sm">Status</p>
              </div>
            </div>
            <p className="text-center mt-3 text-blue-700">{attendanceStats.message}</p>
          </div>
        )}
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            name="classId"
            value={filters.classId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="border border-gray-300 rounded-lg p-3"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="border border-gray-300 rounded-lg p-3"
          />
          
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="border border-gray-300 rounded-lg p-3"
          />
          
          <button
            onClick={handleFilter}
            className="bg-purple-600 text-white rounded-lg p-3 hover:bg-purple-700"
          >
            Apply Filters
          </button>
        </div>

        {/* Attendance List */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Class</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id} className="border-b">
                  <td className="px-4 py-2">
                    {new Date(record.markedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{record.classId?.name}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(record.markedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {attendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;