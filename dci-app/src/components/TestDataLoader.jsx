import React from 'react';
import { Button } from './index';
import { useCourses } from '../contexts/CourseContext';
import { sampleCourses } from '../data/sampleData';
import { FaDatabase } from 'react-icons/fa';

const TestDataLoader = () => {
  const { createCourse } = useCourses();

  const loadSampleData = async () => {
    try {
      console.log('Loading sample data...');
      for (const course of sampleCourses) {
        await createCourse(course);
      }
      alert('Sample data loaded successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Error loading sample data. Check console for details.');
    }
  };

  return (
    <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-4 mb-6">
      <h3 className="text-blue-400 font-mono text-sm tracking-wider mb-3 flex items-center">
        📊 SAMPLE DATA LOADER
      </h3>
      <p className="text-blue-400/70 text-xs font-mono mb-3">
        Load sample courses to test the platform functionality
      </p>
      <Button
        onClick={loadSampleData}
        className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 text-sm font-mono flex items-center space-x-2"
      >
        <FaDatabase className="text-sm" />
        <span>LOAD SAMPLE DATA</span>
      </Button>
    </div>
  );
};

export default TestDataLoader;
