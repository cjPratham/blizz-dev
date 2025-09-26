import { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student';
import Loader from '../../components/Loader';

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({});

  useEffect(() => {
    // load classes on mount
    const fetchClasses = async () => {
      try {
        const classesRes = await studentAPI.getClasses();
        setClasses(classesRes.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const fetchAttendanceData = async (classId) => {
    if (!classId) {
      setAttendance([]);
      setAttendanceStats({});
      return;
    }

    setLoading(true);
    try {
      // get attendance + percentage
      const [attendanceRes, percentageRes] = await Promise.all([
        studentAPI.getAttendanceHistory(),
        studentAPI.getAttendancePercentage(classId),
      ]);

      // filter only selected class
      let filteredAttendance = (attendanceRes.data.attendance || []).filter(
        (r) => r.classId?._id === classId
      );

      const stats = percentageRes.data || {};
      setAttendanceStats(stats);

      // ✅ fill in absent sessions if missing
      if (stats.totalSessions && filteredAttendance.length < stats.totalSessions) {
        const presentDates = filteredAttendance.map((r) =>
          new Date(r.markedAt).toLocaleDateString()
        );

        // simulate missing sessions as absent
        let absentsToAdd = stats.totalSessions - filteredAttendance.length;
        for (let i = 0; i < absentsToAdd; i++) {
          filteredAttendance.push({
            _id: `absent-${i}`,
            status: "absent",
            markedAt: new Date().toISOString(), // placeholder date
            classId: { _id: classId },
          });
        }
      }

      setAttendance(filteredAttendance);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    fetchAttendanceData(classId);
  };

  if (loading) return <Loader message="Loading attendance report..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-4">Attendance Report</h1>

        {/* Class Filter */}
        <div className="mb-6">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="border border-gray-300 rounded-lg p-3"
          >
            <option value="">Select a Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Attendance Statistics */}
        {attendanceStats.percentage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Overall Attendance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {attendanceStats.percentage}%
                </p>
                <p className="text-sm text-blue-800">Percentage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {attendanceStats.attendedSessions}
                </p>
                <p className="text-sm text-green-800">Attended</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {attendanceStats.totalSessions}
                </p>
                <p className="text-sm text-gray-800">Total Sessions</p>
              </div>
              <div className="text-center">
                <p
                  className={`text-2xl font-bold ${
                    attendanceStats.status === 'Satisfactory'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {attendanceStats.status}
                </p>
                <p className="text-sm">Status</p>
              </div>
            </div>
            <p className="text-center mt-3 text-blue-700">
              {attendanceStats.message}
            </p>
          </div>
        )}

        {/* Attendance List */}
        <div className="overflow-x-auto">
          {selectedClass ? (
            <>
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr key={record._id || index} className="border-b">
                      <td className="px-4 py-2">
                        {new Date(record.markedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {record.status === 'present'
                          ? new Date(record.markedAt).toLocaleTimeString()
                          : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {attendance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No attendance records found for this class
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Please select a class to view attendance
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
