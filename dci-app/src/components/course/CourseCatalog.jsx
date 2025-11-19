import React, { useState, useEffect } from 'react';
import { CourseCard } from '../index';
import { useCourses } from '../../contexts/CourseContext';
import { useUser } from '../../contexts/UserContext';
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa';

const CourseCatalog = ({ onEnrollCourse, onCreateCourse, onViewCourse }) => {
  console.log('CourseCatalog: Props received', { 
    hasEnrollFunc: !!onEnrollCourse, 
    hasCreateFunc: !!onCreateCourse, 
    hasViewFunc: !!onViewCourse 
  });
  
  const { courses, loading } = useCourses();
  const { userProfile, isEnrolled } = useUser();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');

  useEffect(() => {
    let filtered = courses.filter(course => course.status === 'published');

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Price filter
    if (selectedPrice !== 'all') {
      if (selectedPrice === 'free') {
        filtered = filtered.filter(course => course.price === 0);
      } else if (selectedPrice === 'paid') {
        filtered = filtered.filter(course => course.price > 0);
      }
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedLevel, selectedPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400 mb-4"></div>
          <p className="text-gray-400 font-mono tracking-wider">LOADING COURSES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2 font-mono tracking-wider">
              COURSE CATALOG
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-wider">
              EXPAND YOUR KNOWLEDGE • ENHANCE YOUR SKILLS
            </p>
          </div>
          
          {userProfile?.role === 'instructor' && (
            <button
              onClick={onCreateCourse}
              className="mt-4 lg:mt-0 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/20 flex items-center space-x-2"
            >
              <FaPlus />
              <span>CREATE COURSE</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="SEARCH COURSES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-white placeholder-gray-500 font-mono text-sm rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-400/20 transition-all"
              />
            </div>

            {/* Level Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-white font-mono text-sm rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-400/20 transition-all appearance-none cursor-pointer"
              >
                <option value="all">ALL LEVELS</option>
                <option value="beginner">BEGINNER</option>
                <option value="intermediate">INTERMEDIATE</option>
                <option value="advanced">ADVANCED</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-white font-mono text-sm rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-400/20 transition-all appearance-none cursor-pointer"
              >
                <option value="all">ALL PRICES</option>
                <option value="free">FREE ONLY</option>
                <option value="paid">PAID ONLY</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-700 mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO COURSES FOUND</h3>
            <p className="text-gray-500 font-mono text-sm">
              {searchTerm || selectedLevel !== 'all' || selectedPrice !== 'all'
                ? 'Try adjusting your filters'
                : 'No courses available yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={() => onEnrollCourse(course)}
                onViewDetails={() => onViewCourse(course)}
                isEnrolled={isEnrolled(course.id)}
                isOwner={course.instructorId === userProfile?.uid}
                user={userProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
