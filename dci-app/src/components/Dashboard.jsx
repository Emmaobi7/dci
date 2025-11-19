import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useCourses } from '../contexts/CourseContext';
import { Button, Logo, CourseCatalog, CreateCourse, RoleManager, AdminCourseManager, PaymentModal, EnrollmentSuccess, AdminBootstrap } from './index';
import { FaSignOutAlt, FaUser, FaBook, FaChartLine, FaPlus, FaUsers, FaArrowLeft } from 'react-icons/fa';

const buildStats = ({ currentRole, myCourses, courses, enrolledCourses }) => {
  if (currentRole === 'instructor') {
    return [
      { title: 'My Courses', value: myCourses.length, icon: FaBook, color: 'bg-teal-500' },
      {
        title: 'Total Students',
        value: myCourses.reduce((acc, course) => acc + (course.totalStudents || 0), 0),
        icon: FaUsers,
        color: 'bg-blue-500'
      },
      { title: 'Revenue', value: '₦0', icon: FaChartLine, color: 'bg-green-500' }
    ];
  }

  if (currentRole === 'admin') {
    return [
      { title: 'Total Courses', value: courses.length, icon: FaBook, color: 'bg-purple-500' },
      { title: 'Total Users', value: '0', icon: FaUsers, color: 'bg-blue-500' },
      { title: 'Platform Revenue', value: '₦0', icon: FaChartLine, color: 'bg-green-500' }
    ];
  }

  return [
    { title: 'Enrolled Courses', value: enrolledCourses.length, icon: FaBook, color: 'bg-teal-500' },
    { title: 'Completed', value: 0, icon: FaChartLine, color: 'bg-green-500' },
    { title: 'Certificates', value: 0, icon: FaUser, color: 'bg-yellow-500' }
  ];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { userProfile, enrolledCourses, isEnrolled, enrollInCourse } = useUser();
  const { courses, myCourses, getEnrolledCourses, createCourse, enrollStudent } = useCourses();
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, course: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, course: null });
  const currentRole = userProfile?.role || 'student';

  const enrolledCoursesData = useMemo(
    () => getEnrolledCourses(enrolledCourses),
    [getEnrolledCourses, enrolledCourses]
  );

  const stats = useMemo(
    () => buildStats({ currentRole, myCourses, courses, enrolledCourses }),
    [currentRole, myCourses, courses, enrolledCourses]
  );

  const goTo = (path) => navigate(path);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBackNav = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleCreateCourse = async (courseData) => {
    setIsCreatingCourse(true);
    try {
      await createCourse(courseData);
      goTo('/dashboard');
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleEnrollCourse = (course) => {
    if (isEnrolled(course.id)) {
      alert('You are already enrolled in this course!');
      return;
    }
    setPaymentModal({ isOpen: true, course });
  };

  const handlePaymentSuccess = async () => {
    const course = paymentModal.course;
    if (!course) return;

    try {
      setPaymentModal({ isOpen: false, course: null });
      await enrollStudent(course.id, user.uid);
      await enrollInCourse(course.id);
      setSuccessModal({ isOpen: true, course });
    } catch (error) {
      console.error('Error completing enrollment:', error);
      alert('Enrollment failed. Please try again.');
    }
  };

  const handleStartCourse = () => {
    if (!successModal.course) return;
    const courseId = successModal.course.id;
    setSuccessModal({ isOpen: false, course: null });
    navigate(`/courses/${courseId}/learn`);
  };

  const handleViewCourse = (course) => {
    if (!course) return;
    if (currentRole === 'instructor' && course.instructorId === user.uid) {
      navigate(`/courses/${course.id}/manage`);
    } else {
      navigate(`/courses/${course.id}/learn`);
    }
  };

  const getRoleDisplayName = () => {
    switch (currentRole) {
      case 'instructor':
        return 'INSTRUCTOR';
      case 'admin':
        return 'ADMINISTRATOR';
      default:
        return 'STUDENT';
    }
  };

  const outletContext = {
    user,
    currentRole,
    stats,
    enrolledCoursesData,
    myCourses,
    handleViewCourse,
    goToCatalog: () => goTo('/catalog'),
    goToCreateCourse: () => goTo('/create-course'),
    goToDashboard: () => goTo('/dashboard'),
    handleEnrollCourse,
    handleCreateCourse,
    isCreatingCourse
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800/70 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <button
                type="button"
                onClick={handleBackNav}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wider text-gray-300 hover:text-white bg-gray-700/80 border border-gray-600 rounded-lg px-3 py-2 transition-colors"
              >
                <FaArrowLeft />
                BACK
              </button>
              <Logo size="md" />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-right">
                <p className="text-white font-mono font-bold text-sm">{user?.displayName || 'USER'}</p>
                <p className="text-teal-400 text-xs font-mono tracking-wider">{getRoleDisplayName()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
              <Button
                onClick={handleSignOut}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                <FaSignOutAlt />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {[
                { label: 'DASHBOARD', path: '/dashboard' },
                { label: 'COURSES', path: '/catalog' }
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => goTo(link.path)}
                  className={`px-4 py-2 rounded-full font-mono text-xs sm:text-sm tracking-wider transition-colors border ${
                    location.pathname === link.path
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => goTo('/catalog')}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900 px-4 py-2 w-full sm:w-auto"
              >
                BROWSE COURSES
              </Button>
              {/* <Button
                onClick={() => goTo('/create-course')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 w-full sm:w-auto"
              >
                CREATE COURSE
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Outlet context={outletContext} />
      </main>

      <PaymentModal
        course={paymentModal.course}
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, course: null })}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <EnrollmentSuccess
        course={successModal.course}
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, course: null })}
        onStartCourse={handleStartCourse}
      />
    </div>
  );
};

export default Dashboard;

const useDashboardContext = () => {
  const context = useOutletContext();
  if (!context) {
    throw new Error('Dashboard pages must be rendered within Dashboard layout');
  }
  return context;
};

export const DashboardHome = () => {
  const {
    user,
    currentRole,
    stats,
    enrolledCoursesData,
    myCourses,
    handleViewCourse,
    goToCatalog,
    goToCreateCourse
  } = useDashboardContext();

  return (
    <>
      <AdminBootstrap />
      {currentRole === 'admin' && <RoleManager />}
      {currentRole === 'admin' && <AdminCourseManager />}

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4 font-mono tracking-wider">
          WELCOME BACK, {user?.displayName?.split(' ')[0]?.toUpperCase() || 'USER'}
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl font-mono">
          {currentRole === 'instructor' && 'MANAGE YOUR COURSES • TRACK STUDENT PROGRESS'}
          {currentRole === 'admin' && 'PLATFORM CONTROL • SYSTEM OVERVIEW'}
          {currentRole === 'student' && 'CONTINUE YOUR LEARNING JOURNEY • BUILD YOUR SKILLS'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6 hover:shadow-teal-500/20 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-mono font-bold text-lg">{stat.value}</h3>
                <p className="text-gray-400 font-mono text-sm tracking-wider">{stat.title.toUpperCase()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentRole === 'student' && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white font-mono tracking-wider">MY COURSES</h2>
            <Button
              onClick={goToCatalog}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3"
            >
              <FaPlus className="mr-2" />
              BROWSE COURSES
            </Button>
          </div>

          {enrolledCoursesData.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
              <div className="text-6xl text-gray-700 mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO COURSES YET</h3>
              <p className="text-gray-500 font-mono text-sm mb-6">START YOUR LEARNING JOURNEY</p>
              <Button
                onClick={goToCatalog}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3"
              >
                EXPLORE COURSES
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCoursesData.map((course) => (
                <div key={course.id} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-teal-500/20 to-blue-600/20 flex items-center justify-center">
                    <FaBook className="text-3xl text-teal-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 font-mono">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 font-mono">BY {course.instructorName?.toUpperCase()}</p>
                    <Button
                      onClick={() => handleViewCourse(course)}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold"
                    >
                      CONTINUE
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {currentRole === 'instructor' && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white font-mono tracking-wider">MY COURSES</h2>
            <Button
              onClick={goToCreateCourse}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3"
            >
              <FaPlus className="mr-2" />
              CREATE COURSE
            </Button>
          </div>

          {myCourses.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
              <div className="text-6xl text-gray-700 mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO COURSES CREATED</h3>
              <p className="text-gray-500 font-mono text-sm mb-6">START TEACHING TODAY</p>
              <Button
                onClick={goToCreateCourse}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3"
              >
                CREATE FIRST COURSE
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <div key={course.id} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-teal-500/20 to-blue-600/20 flex items-center justify-center">
                    <FaBook className="text-3xl text-teal-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 font-mono">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-2 font-mono">{course.totalStudents || 0} STUDENTS</p>
                    <p className="text-gray-500 text-xs mb-4 font-mono">{course.status?.toUpperCase()}</p>
                    <Button
                      onClick={() => handleViewCourse(course)}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold"
                    >
                      MANAGE
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4 font-mono tracking-wider">
          QUICK ACTIONS
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto font-mono">
          {currentRole === 'instructor' && 'MANAGE YOUR TEACHING PLATFORM'}
          {currentRole === 'admin' && 'OVERSEE PLATFORM OPERATIONS'}
          {currentRole === 'student' && 'ACCELERATE YOUR LEARNING JOURNEY'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={goToCatalog}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3"
          >
            EXPLORE COURSES
          </Button>
          {currentRole === 'instructor' && (
            <Button
              onClick={goToCreateCourse}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3"
            >
              CREATE COURSE
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export const CatalogPage = () => {
  const { handleEnrollCourse, handleViewCourse, goToCreateCourse } = useDashboardContext();
  return (
    <CourseCatalog
      onEnrollCourse={handleEnrollCourse}
      onCreateCourse={goToCreateCourse}
      onViewCourse={handleViewCourse}
    />
  );
};

export const CreateCoursePage = () => {
  const { handleCreateCourse, isCreatingCourse, goToCatalog } = useDashboardContext();
  return (
    <CreateCourse
      onCreateCourse={handleCreateCourse}
      onCancel={goToCatalog}
      loading={isCreatingCourse}
    />
  );
};
