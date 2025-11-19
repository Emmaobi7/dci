import React from 'react';
import { FaPlay, FaUsers, FaClock, FaTag, FaLock } from 'react-icons/fa';
import { Button } from '../index';

const CourseCard = ({ course, onEnroll, onViewDetails, isEnrolled, isOwner, user }) => {
  const {
    title,
    description,
    thumbnail,
    price,
    duration,
    level,
    totalStudents,
    instructorName,
    status,
    tags = []
  } = course;

  const handleAction = () => {
    console.log('CourseCard: handleAction called', { isEnrolled, isOwner, course: title });
    
    if (isEnrolled || isOwner) {
      console.log('CourseCard: Calling onViewDetails');
      onViewDetails();
    } else {
      console.log('CourseCard: Calling onEnroll');
      onEnroll();
    }
  };

  const getActionText = () => {
    if (isOwner) return 'MANAGE COURSE';
    if (isEnrolled) return 'CONTINUE LEARNING';
    return price > 0 ? `ENROLL FOR ₦${price.toLocaleString()}` : 'ENROLL FREE';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'published': return 'text-green-400';
      case 'draft': return 'text-yellow-400';
      case 'archived': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-teal-500/20 transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-blue-600/20 flex items-center justify-center">
            <FaPlay className="text-4xl text-teal-400 opacity-50" />
          </div>
        )}
        
        {/* Status Badge */}
        {isOwner && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-mono tracking-wider uppercase bg-gray-900/80 rounded ${getStatusColor()}`}>
              {status}
            </span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-mono font-bold bg-teal-500 text-gray-900 rounded">
            {price > 0 ? `₦${price.toLocaleString()}` : 'FREE'}
          </span>
        </div>

        {/* Enrolled/Locked Indicator */}
        {isEnrolled && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-green-500 text-gray-900 p-2 rounded-full">
              <FaPlay className="text-sm" />
            </div>
          </div>
        )}
        
        {!isEnrolled && price > 0 && !isOwner && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-gray-700 text-gray-300 p-2 rounded-full">
              <FaLock className="text-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors font-mono tracking-wider">
          {title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-400 mb-3 font-mono">
          BY {instructorName?.toUpperCase() || 'UNKNOWN'}
        </p>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded font-mono"
              >
                <FaTag className="inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4 font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <FaUsers className="text-xs" />
              <span>{totalStudents || 0}</span>
            </span>
            {duration && (
              <span className="flex items-center space-x-1">
                <FaClock className="text-xs" />
                <span>{duration}</span>
              </span>
            )}
          </div>
          {level && (
            <span className="px-2 py-1 bg-gray-700 rounded text-xs">
              {level.toUpperCase()}
            </span>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleAction}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold"
          disabled={status === 'draft' && !isOwner}
        >
          {getActionText()}
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
