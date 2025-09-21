import { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student';
import Loader from '../../components/Loader';

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ classId: '', startDate: '', endDate: '' });

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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => fetchData();

  if (loading) return <Loader message="Loading attendance report..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">Attendance Report</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            name="classId"
            value={filters.classId}
            onChange={(e) => setFilters({...filters, classId: e.target.value})}
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
                <th className="px-4 py-2 text-left">Method</th>
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
                  <td className="px-4 py-2">{record.method}</td>
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