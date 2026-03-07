import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { Button, Card, ModuleEditor, CourseReviews } from './index';
import { formatDate } from '../utils/formatters';
import {
  FaArrowLeft,
  FaUsers,
  FaBook,
  FaChartLine,
  FaEdit,
  FaPlus,
  FaTrash,
  FaClock,
  FaDollarSign,
  FaEye,
  FaDownload,
  FaVideoSlash,
  FaVideo,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const CourseManagement = ({ course, onBack }) => {
  const { user } = useAuth();
  const {
    updateCourse,
    deleteCourse,
    getCourseAnalytics,
    getEnrolledStudentsData,
    addCourseModule,
    updateCourseModule,
    deleteCourseModule,
    getCourseSessions,
    addCourseSession,
    updateCourseSession
  } = useCourses();
  const [activeTab, setActiveTab] = useState('overview');
  const [courseData, setCourseData] = useState(course);
  const [analytics, setAnalytics] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Student detail state
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Session editor state
  const [sessionEditor, setSessionEditor] = useState({
    isOpen: false,
    session: null,
    isEditing: false
  });

  // Module editor state
  const [moduleEditor, setModuleEditor] = useState({
    isOpen: false,
    module: null,
    isEditing: false
  });

  // Settings state
  const [settingsData, setSettingsData] = useState({
    status: course?.status || 'draft',
    price: course?.price || 0,
    maxStudents: course?.maxStudents || 0,
    category: course?.category || '',
    level: course?.level || 'beginner',
    duration: course?.duration || ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load course analytics
        const analyticsData = await getCourseAnalytics(course.id);
        setAnalytics(analyticsData);

        // Load enrolled students data
        if (activeTab === 'students') {
          const studentsData = await getEnrolledStudentsData(course.id);
          setEnrolledStudents(studentsData);
        }

        // Load sessions
        if (activeTab === 'sessions') {
          const sessionsData = await getCourseSessions(course.id);
          setSessions(sessionsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [course.id, activeTab, getCourseAnalytics, getEnrolledStudentsData, getCourseSessions]);

  const handleAddSession = async (sessionData) => {
    try {
      const newSession = await addCourseSession(course.id, sessionData);
      setSessions([...sessions, newSession]);
      console.log('Session added successfully');
      setSessionEditor({ isOpen: false, session: null, isEditing: false });
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Failed to add session.');
    }
  };

  const handleUpdateSession = async (sessionId, updatedData) => {
    try {
      await updateCourseSession(course.id, sessionId, updatedData);
      setSessions(sessions.map(s => s.id === sessionId ? { ...s, ...updatedData } : s));
      console.log('Session updated successfully');
      setSessionEditor({ isOpen: false, session: null, isEditing: false });
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Failed to update session.');
    }
  };

  const handleUpdateCourse = async (updatedData) => {
    try {
      setLoading(true);
      await updateCourse(course.id, updatedData);
      setCourseData({ ...courseData, ...updatedData });
      console.log('Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deleteCourse(course.id);
        onBack();
        console.log('Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      await handleUpdateCourse(settingsData);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const openModuleEditorForLesson = (module) => {
    setModuleEditor({ isOpen: true, module, isEditing: true });
  };

  const handleAddModule = async (moduleData) => {
    try {
      const newModule = await addCourseModule(course.id, moduleData);
      setCourseData({
        ...courseData,
        modules: [...(courseData.modules || []), newModule]
      });
      console.log('Module added successfully');
    } catch (error) {
      console.error('Error adding module:', error);
      throw error;
    }
  };

  const handleEditModule = async (moduleData) => {
    try {
      const updatedModule = await updateCourseModule(course.id, moduleEditor.module.id, moduleData);
      const modules = (courseData.modules || []).map(m =>
        m.id === moduleEditor.module.id ? updatedModule : m
      );
      setCourseData({ ...courseData, modules });
      console.log('Module updated successfully');
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await deleteCourseModule(course.id, moduleId);
        const modules = (courseData.modules || []).filter(m => m.id !== moduleId);
        setCourseData({ ...courseData, modules });
        console.log('Module deleted successfully');
      } catch (error) {
        console.error('Error deleting module:', error);
        alert('Failed to delete module. Please try again.');
      }
    }
  };

  const exportStudentsList = () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Enrolled Date', 'Progress', 'Last Active'],
        ...enrolledStudents.map(student => [
          student.name,
          student.email,
          formatDate(student.enrolledAt),
          `${student.progress}%`,
          formatDate(student.lastActive)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseData.title}-students.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting students list:', error);
      alert('Failed to export students list.');
    }
  };

  const getEnrollmentStats = () => {
    const totalStudents = courseData?.enrolledStudents?.length || 0;
    const revenue = totalStudents * (courseData?.price || 0);

    return {
      totalStudents,
      revenue,
      completionRate: analytics?.completionRate || 0,
      averageRating: courseData?.averageRating || analytics?.averageRating || 0
    };
  };

  const stats = getEnrollmentStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'students', label: 'Students', icon: FaUsers },
    { id: 'content', label: 'Content', icon: FaBook },
    { id: 'sessions', label: 'Sessions', icon: FaVideo },
    { id: 'reviews', label: 'Reviews', icon: FaEye },
    { id: 'settings', label: 'Settings', icon: FaEdit }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/70 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">

          {/* Row 1: Back + Status badge */}
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
            <Button
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 text-xs sm:text-sm shrink-0"
            >
              <FaArrowLeft className="sm:mr-2" />
              <span className="hidden sm:inline">BACK</span>
            </Button>

            {/* Course title — truncates on mobile */}
            <h1 className="flex-1 text-sm sm:text-2xl font-bold text-white font-mono tracking-wider truncate min-w-0">
              {courseData.title}
            </h1>

            {/* Status + student count — right side */}
            <div className="shrink-0 text-right">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold ${courseData.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                {courseData.status?.toUpperCase()}
              </span>
              <p className="text-teal-400 text-[10px] sm:text-sm font-mono mt-0.5">{stats.totalStudents} STU</p>
            </div>
          </div>

          {/* Row 2: Subtitle — desktop only */}
          <p className="hidden sm:block text-gray-400 font-mono text-sm mb-3">
            COURSE MANAGEMENT • INSTRUCTOR: {courseData.instructorName?.toUpperCase()}
          </p>

          {/* Tab Navigation — scrollable on mobile, icon-only labels */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg font-mono text-xs transition-colors ${activeTab === tab.id
                    ? 'bg-teal-500 text-gray-900 font-bold'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                <tab.icon className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">{tab.label.toUpperCase()}</span>
                <span className="sm:hidden text-[10px]">{tab.label.slice(0, 3).toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-mono font-bold text-lg">{stats.totalStudents}</h3>
                    <p className="text-gray-400 font-mono text-sm">ENROLLED STUDENTS</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <FaDollarSign className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-mono font-bold text-lg">
                      ₦{stats.revenue.toLocaleString()}
                    </h3>
                    <p className="text-gray-400 font-mono text-sm">TOTAL REVENUE</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-mono font-bold text-lg">{stats.completionRate}%</h3>
                    <p className="text-gray-400 font-mono text-sm">COMPLETION RATE</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FaEye className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-mono font-bold text-lg">{stats.averageRating}/5</h3>
                    <p className="text-gray-400 font-mono text-sm">AVERAGE RATING</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 font-mono">COURSE DETAILS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Price:</span>
                    <span className="text-white font-mono">
                      {courseData.price === 0 ? 'FREE' : `₦${courseData.price.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Duration:</span>
                    <span className="text-white font-mono">{courseData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Level:</span>
                    <span className="text-white font-mono">{courseData.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Status:</span>
                    <span className={`font-mono ${courseData.status === 'published' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                      {courseData.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Created:</span>
                    <span className="text-white font-mono">
                      {formatDate(courseData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 font-mono">DESCRIPTION</h3>
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  {courseData.description}
                </p>

                <div className="mt-4">
                  <h4 className="text-white font-mono font-bold mb-2">TAGS</h4>
                  <div className="flex flex-wrap gap-2">
                    {courseData.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-mono"
                      >
                        {tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white font-mono">ENROLLED STUDENTS</h2>
              <Button
                onClick={exportStudentsList}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900"
                disabled={enrolledStudents.length === 0}
              >
                <FaDownload className="mr-2" />
                EXPORT LIST
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-400 font-mono">LOADING STUDENTS...</p>
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="text-6xl text-gray-700 mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO STUDENTS ENROLLED</h3>
                <p className="text-gray-500 font-mono text-sm">STUDENTS WILL APPEAR HERE WHEN THEY ENROLL</p>
              </div>
            ) : (
              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Enrolled Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {enrolledStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-mono font-bold text-sm">
                                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white font-mono">{student.name}</div>
                                <div className="text-sm text-gray-400 font-mono">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                            {formatDate(student.enrolledAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-300 font-mono">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                            {formatDate(student.lastActive)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              onClick={() => setSelectedStudent(student)}
                              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 text-xs"
                            >
                              VIEW DETAILS
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white font-mono">COURSE CONTENT</h2>
              <Button
                onClick={() => setModuleEditor({ isOpen: true, module: null, isEditing: false })}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900"
              >
                <FaPlus className="mr-2" />
                ADD MODULE
              </Button>
            </div>

            <div className="space-y-4">
              {courseData.modules?.map((module, index) => (
                <div key={module.id || index} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-mono">
                        MODULE {index + 1}: {module.title}
                      </h3>
                      <p className="text-gray-400 font-mono text-sm">{module.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setModuleEditor({ isOpen: true, module, isEditing: true })}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 text-sm"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        onClick={() => handleDeleteModule(module.id)}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 text-sm"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {module.lessons?.map((lesson, lessonIndex) => (
                      <div key={lesson.id || lessonIndex} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                            {lesson.type === 'video' ?
                              <FaVideo className="text-white text-xs" /> :
                              <FaBook className="text-white text-xs" />
                            }
                          </div>
                          <div>
                            <p className="text-white font-mono text-sm">{lesson.title}</p>
                            <p className="text-gray-400 font-mono text-xs">
                              {lesson.type?.toUpperCase()} • {lesson.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => openModuleEditorForLesson(module)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 text-xs"
                          >
                            <FaEdit />
                          </Button>
                        </div>
                      </div>
                    )) || (
                        <div className="text-center py-4 bg-gray-700/30 border border-gray-600 rounded-lg">
                          <p className="text-gray-500 font-mono text-sm">No lessons in this module</p>
                        </div>
                      )}
                  </div>
                </div>
              )) || (
                  <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
                    <div className="text-6xl text-gray-700 mb-4">📖</div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO CONTENT YET</h3>
                    <p className="text-gray-500 font-mono text-sm mb-6">ADD MODULES AND LESSONS TO BUILD YOUR COURSE</p>
                    <Button
                      onClick={() => setModuleEditor({ isOpen: true, module: null, isEditing: false })}
                      className="bg-teal-500 hover:bg-teal-400 text-gray-900"
                    >
                      <FaPlus className="mr-2" />
                      ADD FIRST MODULE
                    </Button>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white font-mono">COURSE SETTINGS</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Settings */}
              <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 font-mono">BASIC SETTINGS</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-mono text-sm mb-2">Course Status</label>
                    <select
                      value={settingsData.status}
                      onChange={(e) => setSettingsData({ ...settingsData, status: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono"
                    >
                      <option value="draft">DRAFT</option>
                      <option value="published">PUBLISHED</option>
                      <option value="archived">ARCHIVED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-mono text-sm mb-2">Price (₦)</label>
                    <input
                      type="number"
                      value={settingsData.price}
                      onChange={(e) => setSettingsData({ ...settingsData, price: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-mono text-sm mb-2">Max Students</label>
                    <input
                      type="number"
                      value={settingsData.maxStudents}
                      onChange={(e) => setSettingsData({ ...settingsData, maxStudents: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono"
                      placeholder="0 (Unlimited)"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-mono text-sm mb-2">Category</label>
                    <input
                      type="text"
                      value={settingsData.category || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, category: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono"
                      placeholder="e.g. Technology"
                    />
                  </div>

                  <Button
                    onClick={handleSaveSettings}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        SAVING...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        SAVE SETTINGS
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-400 mb-4 font-mono">DANGER ZONE</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-mono font-bold mb-2">Delete Course</h4>
                    <p className="text-gray-400 font-mono text-sm mb-4">
                      Once you delete a course, there is no going back. All enrolled students will lose access.
                    </p>
                    <Button
                      onClick={handleDeleteCourse}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                    >
                      <FaTrash className="mr-2" />
                      DELETE COURSE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white font-mono">LIVE SESSIONS</h2>
              <Button
                onClick={() => setSessionEditor({ isOpen: true, session: null, isEditing: false })}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900"
              >
                <FaPlus className="mr-2" />
                SCHEDULE SESSION
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
                  <div className="text-6xl text-gray-700 mb-4">🎥</div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO SESSIONS SCHEDULED</h3>
                  <p className="text-gray-500 font-mono text-sm mb-6">CREATE SESSIONS FOR LIVE CLASSES</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white font-mono mb-2">{session.title}</h3>
                        <p className="text-gray-400 font-mono text-sm mb-4">{session.description}</p>
                        <div className="flex space-x-6 text-xs text-gray-300 font-mono">
                          <span className="flex items-center"><FaClock className="mr-2 text-teal-400" /> {formatDate(session.scheduledAt, true)}</span>
                          <span className="flex items-center"><FaVideo className="mr-2 text-blue-400" /> {session.duration}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setSessionEditor({ isOpen: true, session, isEditing: true })}
                          className="bg-gray-700 hover:bg-gray-600 text-white p-2"
                        >
                          <FaEdit />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white font-mono">STUDENT REVIEWS</h2>
            <div className="grid grid-cols-1 gap-4">
              <CourseReviews courseId={course.id} />
            </div>
          </div>
        )}
      </main>

      {/* Session Editor Modal (Simplified Inline for now) */}
      {sessionEditor.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6 font-mono">
              {sessionEditor.isEditing ? 'EDIT SESSION' : 'SCHEDULE NEW SESSION'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-1">TITLE</label>
                <input
                  type="text"
                  defaultValue={sessionEditor.session?.title}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono"
                  id="session-title"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-1">DESCRIPTION</label>
                <textarea
                  defaultValue={sessionEditor.session?.description}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono h-24"
                  id="session-desc"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-mono text-xs mb-1">DATE & TIME</label>
                  <input
                    type="datetime-local"
                    defaultValue={sessionEditor.session?.scheduledAt ? sessionEditor.session.scheduledAt.substring(0, 16) : ''}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono"
                    id="session-time"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-xs mb-1">DURATION</label>
                  <input
                    type="text"
                    defaultValue={sessionEditor.session?.duration || '90 minutes'}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono"
                    id="session-duration"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-1">MEET LINK</label>
                <input
                  type="text"
                  defaultValue={sessionEditor.session?.meetLink}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono"
                  id="session-link"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => setSessionEditor({ isOpen: false, session: null, isEditing: false })}
                  className="flex-1 bg-gray-700 text-white"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={() => {
                    const data = {
                      title: document.getElementById('session-title').value,
                      description: document.getElementById('session-desc').value,
                      scheduledAt: new Date(document.getElementById('session-time').value).toISOString(),
                      duration: document.getElementById('session-duration').value,
                      meetLink: document.getElementById('session-link').value,
                      status: 'scheduled'
                    };
                    if (sessionEditor.isEditing) {
                      handleUpdateSession(sessionEditor.session.id, data);
                    } else {
                      handleAddSession(data);
                    }
                  }}
                  className="flex-1 bg-teal-500 text-gray-900 font-bold"
                >
                  SAVE SESSION
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white font-mono">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-mono">{selectedStudent.name}</h3>
                  <p className="text-gray-400 font-mono">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 rounded-lg p-4 font-mono">
                <p className="text-xs text-gray-500 mb-1">ENROLLED ON</p>
                <p className="text-white">{formatDate(selectedStudent.enrolledAt)}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 font-mono">
                <p className="text-xs text-gray-500 mb-1">COURSE PROGRESS</p>
                <p className="text-teal-400 font-bold">{selectedStudent.progress}%</p>
              </div>
            </div>

            <h4 className="text-white font-mono font-bold mb-4">PROGRESS OVERVIEW</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {courseData.modules?.map((module, mIdx) => (
                <div key={module.id} className="border border-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-xs font-mono mb-2">MODULE {mIdx + 1}: {module.title.toUpperCase()}</p>
                  <div className="space-y-2">
                    {module.lessons?.map((lesson) => (
                      <div key={lesson.id} className="flex justify-between items-center text-sm font-mono">
                        <span className="text-gray-300">{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-gray-700 text-white"
              >
                CLOSE
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Module Editor Modal */}
      <ModuleEditor
        module={moduleEditor.module}
        isOpen={moduleEditor.isOpen}
        isEditing={moduleEditor.isEditing}
        onClose={() => setModuleEditor({ isOpen: false, module: null, isEditing: false })}
        onSave={moduleEditor.isEditing ? handleEditModule : handleAddModule}
      />
    </div>
  );
};

export default CourseManagement;
