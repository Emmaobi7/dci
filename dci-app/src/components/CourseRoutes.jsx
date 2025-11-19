import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import CourseManagement from './CourseManagement';
import CourseLearning from './CourseLearning';

const useCourse = (courseId) => {
  const { courses, getCourseById } = useCourses();
  const [course, setCourse] = useState(() => courses.find((c) => c.id === courseId));
  const [loading, setLoading] = useState(!course);

  useEffect(() => {
    let active = true;
    const existing = courses.find((c) => c.id === courseId);

    if (existing) {
      setCourse(existing);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    getCourseById(courseId)
      .then((fetched) => {
        if (active) {
          setCourse(fetched);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [courseId, courses, getCourseById]);

  return useMemo(() => ({ course, loading }), [course, loading]);
};

const LoadingState = ({ label = 'Loading course...' }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-4"></div>
      <p className="text-teal-400 text-lg font-mono tracking-wider">{label}</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <p className="text-2xl text-white font-mono mb-4">COURSE NOT FOUND</p>
      <p className="text-gray-400 font-mono">Please check the URL or return to the catalog.</p>
    </div>
  </div>
);

export const CourseManagementRoute = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, loading } = useCourse(courseId);
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) return <LoadingState label="Loading course management..." />;
  if (!course) return <NotFoundState />;

  return (
    <CourseManagement
      course={course}
      onBack={handleBack}
    />
  );
};

export const CourseLearningRoute = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, loading } = useCourse(courseId);
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) return <LoadingState label="Loading course content..." />;
  if (!course) return <NotFoundState />;

  return (
    <CourseLearning
      course={course}
      onBack={handleBack}
    />
  );
};
