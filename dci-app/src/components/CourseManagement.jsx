import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { Button, Card, ModuleEditor } from './index';
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
  FaSave
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
    deleteCourseModule
  } = useCourses();
  const [activeTab, setActiveTab] = useState('overview');
  const [courseData, setCourseData] = useState(course);
  const [analytics, setAnalytics] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Module editor state
  const [moduleEditor, setModuleEditor] = useState({
    isOpen: false,
    module: null,
    isEditing: false
  });

  // Settings state
  const [settingsData, setSettingsData] = useState({
    status: course.status || 'draft',
    price: course.price || 0,
    maxStudents: course.maxStudents || 0
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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [course.id, activeTab, getCourseAnalytics, getEnrolledStudentsData]);

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
          new Date(student.enrolledAt).toLocaleDateString(),
          `${student.progress}%`,
          new Date(student.lastActive).toLocaleDateString()
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
    const totalStudents = courseData.enrolledStudents?.length || 0;
    const revenue = totalStudents * (courseData.price || 0);
    
    return {
      totalStudents,
      revenue,
      completionRate: analytics?.completionRate || 0,
      averageRating: analytics?.averageRating || 0
    };
  };

  const stats = getEnrollmentStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'students', label: 'Students', icon: FaUsers },
    { id: 'content', label: 'Content', icon: FaBook },
    { id: 'settings', label: 'Settings', icon: FaEdit }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/70 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
            >
              <FaArrowLeft className="mr-2" />
              BACK
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white font-mono tracking-wider">
                {courseData.title}
              </h1>
              <p className="text-gray-400 font-mono text-sm">
                COURSE MANAGEMENT • INSTRUCTOR: {courseData.instructorName?.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-mono font-bold">
                {courseData.status?.toUpperCase()}
              </p>
              <p className="text-teal-400 text-sm font-mono">
                {stats.totalStudents} STUDENTS
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-gray-900 font-bold'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <tab.icon />
                <span>{tab.label.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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
                    <span className={`font-mono ${
                      courseData.status === 'published' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {courseData.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-mono">Created:</span>
                    <span className="text-white font-mono">
                      {new Date(courseData.createdAt).toLocaleDateString()}
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
                            {new Date(student.enrolledAt).toLocaleDateString()}
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
                            {new Date(student.lastActive).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 text-xs">
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
                            onClick={() => {
                              // Edit individual lesson (for future implementation)
                              console.log('Edit lesson:', lesson);
                            }}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 text-xs"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            onClick={() => {
                              // Delete individual lesson (for future implementation)
                              console.log('Delete lesson:', lesson);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 text-xs"
                          >
                            <FaTrash />
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
                      onChange={(e) => setSettingsData({ ...settingsData, price: Number(e.target.value) })}
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
                      onChange={(e) => setSettingsData({ ...settingsData, maxStudents: Number(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono"
                      placeholder="0 (Unlimited)"
                      min="0"
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
      </main>

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
