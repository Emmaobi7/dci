import React, { useState } from 'react';
import { useCourses } from '../contexts/CourseContext';
import { useUser } from '../contexts/UserContext';
import { Button, Card } from './index';
import { FaCheck, FaTimes, FaEye, FaClock, FaBook, FaUser } from 'react-icons/fa';

const AdminCourseManager = () => {
  const { courses, updateCourse } = useCourses();
  const { userProfile } = useUser();
  const [loading, setLoading] = useState(false);

  // Only show for admins
  if (userProfile?.role !== 'admin') {
    return null;
  }

  const pendingCourses = courses.filter(course => course.status === 'draft');
  const publishedCourses = courses.filter(course => course.status === 'published');
  const archivedCourses = courses.filter(course => course.status === 'archived');

  const handleApprove = async (courseId) => {
    setLoading(true);
    try {
      await updateCourse(courseId, { status: 'published' });
      console.log('Course approved:', courseId);
    } catch (error) {
      console.error('Error approving course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (courseId) => {
    setLoading(true);
    try {
      await updateCourse(courseId, { status: 'archived' });
      console.log('Course rejected:', courseId);
    } catch (error) {
      console.error('Error rejecting course:', error);
    } finally {
      setLoading(false);
    }
  };

  const CourseCard = ({ course, status }) => (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-white text-sm">{course.title}</h4>
          <p className="text-gray-400 text-xs">by {course.instructorName}</p>
          <p className="text-gray-500 text-xs">₦{course.price?.toLocaleString()}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-mono ${
          course.status === 'draft' ? 'bg-yellow-900 text-yellow-300' :
          course.status === 'published' ? 'bg-green-900 text-green-300' :
          'bg-red-900 text-red-300'
        }`}>
          {course.status.toUpperCase()}
        </span>
      </div>
      
      <p className="text-gray-300 text-xs mb-3 line-clamp-2">{course.description}</p>
      
      {status === 'pending' && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleApprove(course.id)}
            disabled={loading}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            <FaCheck className="mr-1" />
            Approve
          </Button>
          <Button
            onClick={() => handleReject(course.id)}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-900 text-xs"
          >
            <FaTimes className="mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-teal-400 mb-4 font-mono flex items-center">
        <FaBook className="mr-2" />
        ADMIN: COURSE MANAGEMENT
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Courses */}
        <div>
          <h4 className="font-bold text-yellow-400 mb-3 flex items-center">
            <FaClock className="mr-2" />
            PENDING APPROVAL ({pendingCourses.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingCourses.length === 0 ? (
              <p className="text-gray-500 text-sm">No courses pending approval</p>
            ) : (
              pendingCourses.map(course => (
                <CourseCard key={course.id} course={course} status="pending" />
              ))
            )}
          </div>
        </div>

        {/* Published Courses */}
        <div>
          <h4 className="font-bold text-green-400 mb-3 flex items-center">
            <FaCheck className="mr-2" />
            PUBLISHED ({publishedCourses.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {publishedCourses.length === 0 ? (
              <p className="text-gray-500 text-sm">No published courses</p>
            ) : (
              publishedCourses.map(course => (
                <CourseCard key={course.id} course={course} status="published" />
              ))
            )}
          </div>
        </div>

        {/* Archived Courses */}
        <div>
          <h4 className="font-bold text-red-400 mb-3 flex items-center">
            <FaTimes className="mr-2" />
            ARCHIVED ({archivedCourses.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {archivedCourses.length === 0 ? (
              <p className="text-gray-500 text-sm">No archived courses</p>
            ) : (
              archivedCourses.map(course => (
                <CourseCard key={course.id} course={course} status="archived" />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h5 className="font-bold text-white mb-2">Platform Statistics</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-teal-400 font-bold">{courses.length}</div>
            <div className="text-gray-400">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold">{pendingCourses.length}</div>
            <div className="text-gray-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">{publishedCourses.length}</div>
            <div className="text-gray-400">Published</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold">{archivedCourses.length}</div>
            <div className="text-gray-400">Archived</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseManager;
