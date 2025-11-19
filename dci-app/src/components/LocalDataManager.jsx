import React, { useState } from 'react';
import { Button } from './index';
import { sampleCourses } from '../data/sampleData';
import { FaDatabase, FaTrash } from 'react-icons/fa';

const LocalDataManager = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadSampleData = () => {
    setIsLoading(true);
    try {
      // Store sample courses in localStorage
      localStorage.setItem('dci_courses', JSON.stringify(sampleCourses));
      console.log('Sample data loaded to localStorage');
      alert('Sample data loaded successfully! Refresh to see courses.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Error loading sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    try {
      localStorage.removeItem('dci_courses');
      alert('Data cleared! Refresh to see changes.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const getStoredCoursesCount = () => {
    try {
      const stored = localStorage.getItem('dci_courses');
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-4 mb-6">
      <h3 className="text-green-400 font-mono text-sm tracking-wider mb-3 flex items-center">
        💾 LOCAL DATA MANAGER - COURSES STORED: {getStoredCoursesCount()}
      </h3>
      <p className="text-green-400/70 text-xs font-mono mb-3">
        Using localStorage instead of Firebase (no permissions needed)
      </p>
      <div className="flex gap-2">
        <Button
          onClick={loadSampleData}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 text-sm font-mono flex items-center space-x-2"
        >
          <FaDatabase className="text-sm" />
          <span>{isLoading ? 'LOADING...' : 'LOAD SAMPLE DATA'}</span>
        </Button>
        <Button
          onClick={clearData}
          className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 text-sm font-mono flex items-center space-x-2"
        >
          <FaTrash className="text-sm" />
          <span>CLEAR DATA</span>
        </Button>
      </div>
    </div>
  );
};

export default LocalDataManager;
