import { useState } from 'react';
import ClassSessions from './ClassSessions';

export default function ClassCard({ classItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-2 border-purple-600 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="cursor-pointer" onClick={toggleExpansion}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-purple-600">
            {classItem.name || `Class`}
          </h3>
          <span className="text-sm text-purple-600">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          Instructor: {classItem.instructor?.name || classItem.instructor || 'No instructor info'}
        </p>
        <p className="text-sm text-gray-500">
          Schedule: {classItem.schedule || 'Schedule not set'}
        </p>
      </div>

      {isExpanded && (
        <ClassSessions classItem={classItem} />
      )}
    </div>
  );
}