import { useState, useContext } from 'react';
import { studentAPI } from '../../api/student';
import { AuthContext } from '../../contexts/AuthContext';
import Loader from '../../components/Loader';

export default function JoinClass() {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await studentAPI.joinClass(classCode.trim());
      setMessage(response.data.msg || 'Successfully joined class!');
      setClassCode('');
    } catch (err) {
      // Improved error handling
      if (err.response?.status === 404) {
        setError('Class not found. Please check the code and try again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You may already be in this class.');
      } else {
        setError(err.response?.data?.msg || 'Error joining class. Please try again.');
      }
      console.error('Join class error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#A020F0]">Join a Class</h1>
          <p className="text-gray-600">Enter class code to join new classes</p>
        </div>

        {/* Join Class Form */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <form onSubmit={handleJoinClass} className="space-y-4">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Enter class code"
              className="w-full border-2 border-[#A020F0] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A020F0]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !classCode.trim()}
              className="w-full bg-[#A020F0] text-white px-6 py-3 rounded-lg hover:bg-[#A020F0]/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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