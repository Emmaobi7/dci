import React from 'react';
import { Button } from './index';
import { FaCheck, FaPlay, FaArrowLeft } from 'react-icons/fa';

const EnrollmentSuccess = ({ course, isOpen, onClose, onStartCourse }) => {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheck className="text-white text-2xl" />
        </div>

        {/* Success Message */}
        <h3 className="text-2xl font-bold text-white mb-2 font-mono">
          ENROLLMENT SUCCESSFUL!
        </h3>
        <p className="text-gray-300 mb-6">
          Welcome to <span className="text-teal-400 font-bold">{course.title}</span>!
          You can now access all course materials.
        </p>

        {/* Course Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-bold text-white mb-2">{course.title}</h4>
          <p className="text-gray-400 text-sm mb-2">by {course.instructorName}</p>
          <p className="text-gray-300 text-sm">{course.duration} • {course.level}</p>
        </div>

        {/* Next Steps */}
        <div className="bg-teal-900/30 border border-teal-600 rounded-lg p-4 mb-6">
          <h5 className="font-bold text-teal-400 mb-2">What's Next?</h5>
          <ul className="text-gray-300 text-sm space-y-1 text-left">
            <li>• Access course materials anytime</li>
            <li>• Join live sessions and discussions</li>
            <li>• Track your progress</li>
            <li>• Get certificate upon completion</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onStartCourse}
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
          >
            <FaPlay className="mr-2" />
            START LEARNING
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FaArrowLeft className="mr-2" />
            BACK TO DASHBOARD
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentSuccess;
