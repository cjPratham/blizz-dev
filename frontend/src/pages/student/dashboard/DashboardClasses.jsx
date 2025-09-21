import { useState } from 'react';
import ClassCard from './ClassCard';

export default function DashboardClasses({ classes, error, onRefresh }) {
  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-purple-600">Your Classes</h2>
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
            {classes.length} classes
          </span>
        </div>

        <div className="text-center py-8">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No classes yet</h3>
          <p className="text-gray-600 mb-4">Join your first class to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-600">Your Classes</h2>
        <div className="flex items-center">
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm mr-2">
            {classes.length} classes
          </span>
          <button 
            onClick={onRefresh}
            className="text-purple-600 hover:text-purple-700"
            title="Refresh classes"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {classes.map((classItem) => (
          <ClassCard key={classItem._id} classItem={classItem} />
        ))}
      </div>
    </div>
  );
}