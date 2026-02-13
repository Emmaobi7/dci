import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/formatters';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { useUser } from '../contexts/UserContext';
import { Button, CourseReviews } from './index';
import {
  FaArrowLeft,
  FaVideo,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaPlay,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaRecordVinyl
} from 'react-icons/fa';

const CourseLearning = ({ course, onBack }) => {
  const { user } = useAuth();
  const { getCourseById, getCourseSessions } = useCourses();
  const { updateUserProgress } = useUser();
  const [courseData, setCourseData] = useState(course);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [currentTab, setCurrentTab] = useState('content'); // Default to content
  const [activeLesson, setActiveLesson] = useState(null); // Track active lesson
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load live sessions and attendance data from Firebase
    const loadSessionData = async () => {
      setLoading(true);
      try {
        // Fetch real sessions from Firestore
        const realSessions = await getCourseSessions(course.id);

        // Separate upcoming and past sessions
        const now = new Date();
        const upcoming = realSessions.filter(session => new Date(session.scheduledAt) > now);
        const past = realSessions.filter(session => new Date(session.scheduledAt) <= now);

        setUpcomingSessions(upcoming);
        setPastSessions(past);

        // Load attendance records from Firebase
        await loadAttendanceFromFirebase();
      } catch (error) {
        console.error('Error loading session data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [course.id, user.uid, getCourseSessions]);

  const loadAttendanceFromFirebase = async () => {
    try {
      const attendanceRef = doc(db, 'attendance', `${course.id}_${user.uid}`);
      const attendanceDoc = await getDoc(attendanceRef);

      if (attendanceDoc.exists()) {
        const data = attendanceDoc.data();
        setAttendanceRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error loading attendance from Firebase:', error);
    }
  };


  const markAttendance = async (sessionId, attended) => {
    try {
      const newRecord = {
        sessionId,
        attended,
        timestamp: new Date().toISOString(),
        studentId: user.uid
      };

      const updatedRecords = [...attendanceRecords, newRecord];
      setAttendanceRecords(updatedRecords);

      // Save to Firebase
      const attendanceRef = doc(db, 'attendance', `${course.id}_${user.uid}`);
      await setDoc(attendanceRef, {
        records: updatedRecords,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Update overall course progress
      const attendedCount = updatedRecords.filter(r => r.attended).length;
      const totalSessions = pastSessions.length + upcomingSessions.length;
      const progressPercentage = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;

      await updateUserProgress(course.id, {
        attendedSessions: attendedCount,
        totalSessions,
        progressPercentage,
        lastSessionAttended: new Date().toISOString()
      });

      console.log('Attendance marked:', { sessionId, attended, progress: progressPercentage });
    } catch (error) {
      console.error('Error marking attendance:', error);
      // Revert local state on error
      setAttendanceRecords(attendanceRecords);
    }
  };

  const getAttendanceStatus = (sessionId) => {
    const record = attendanceRecords.find(r => r.sessionId === sessionId);
    return record ? (record.attended ? 'attended' : 'missed') : null;
  };

  const calculateAttendanceRate = () => {
    if (attendanceRecords.length === 0) return 0;
    const attendedCount = attendanceRecords.filter(r => r.attended).length;
    return Math.round((attendedCount / attendanceRecords.length) * 100);
  };

  const joinGoogleMeet = (meetLink, sessionTitle) => {
    console.log('Joining Google Meet:', sessionTitle);
    window.open(meetLink, '_blank');
  };

  const downloadRecording = (recordingUrl, sessionTitle) => {
    console.log('Downloading recording:', sessionTitle);
    window.open(recordingUrl, '_blank');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    try {
      // Handle youtu.be short links
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      // Handle standard youtube.com/watch links
      if (url.includes('youtube.com/watch')) {
        const id = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${id}`;
      }
      // Handle already embedded links
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
      return url;
    } catch (e) {
      console.error('Error parsing YouTube URL:', e);
      return url;
    }
  };

  const attendanceRate = calculateAttendanceRate();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/70 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                <FaArrowLeft className="mr-2" />
                BACK
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-white font-mono tracking-wider">
                  {courseData.title}
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                  LIVE SESSIONS • INSTRUCTOR: {courseData.instructorName?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400 font-mono">
                  {attendanceRecords.filter(r => r.attended).length}
                </div>
                <div className="text-gray-400 font-mono text-xs">ATTENDED</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 font-mono">
                  {attendanceRate}%
                </div>
                <div className="text-gray-400 font-mono text-xs">RATE</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setCurrentTab('content')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors whitespace-nowrap ${currentTab === 'content'
                ? 'bg-teal-500 text-gray-900 font-bold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <FaPlay />
              <span>COURSE CONTENT</span>
            </button>
            <button
              onClick={() => setCurrentTab('upcoming')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${currentTab === 'upcoming'
                ? 'bg-teal-500 text-gray-900 font-bold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <FaCalendarAlt />
              <span>UPCOMING SESSIONS</span>
            </button>
            <button
              onClick={() => setCurrentTab('past')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${currentTab === 'past'
                ? 'bg-teal-500 text-gray-900 font-bold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <FaRecordVinyl />
              <span>PAST SESSIONS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {
          loading ? (
            <div className="text-center py-12" >
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400 font-mono">LOADING SESSIONS...</p>
            </div>
          ) : (
            <>
              {/* Course Content Tab */}
              {currentTab === 'content' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content Area (Video Player) */}
                  <div className="lg:col-span-2 space-y-6">
                    {activeLesson ? (
                      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                        <div className="aspect-video bg-black flex items-center justify-center relative">
                          {/* Video Content */}
                          {activeLesson.type === 'video' && activeLesson.content ? (
                            activeLesson.content.includes('youtube') || activeLesson.content.includes('youtu.be') ? (
                              <iframe
                                src={getYouTubeEmbedUrl(activeLesson.content)}
                                className="w-full h-full"
                                title={activeLesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <video controls className="w-full h-full" src={activeLesson.content}></video>
                            )
                          ) : activeLesson.type === 'text' || activeLesson.type === 'article' ? (
                            <div className="text-center p-8">
                              <FaExternalLinkAlt className="text-6xl mx-auto mb-4 text-teal-500" />
                              <h3 className="text-xl font-bold text-white mb-2">EXTERNAL CONTENT</h3>
                              <a
                                href={activeLesson.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
                              >
                                <span>OPEN LINK</span>
                                <FaExternalLinkAlt />
                              </a>
                              <p className="mt-4 text-gray-400 text-sm">This content opens in a new tab</p>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-center p-8">
                              <FaVideo className="text-4xl mx-auto mb-4 opacity-50" />
                              <p>Content format not supported or missing.</p>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h2 className="text-2xl font-bold text-white font-mono mb-2">{activeLesson.title}</h2>
                          <p className="text-gray-400">{activeLesson.description}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">📺</div>
                        <h3 className="text-xl font-bold text-white font-mono mb-2">SELECT A LESSON</h3>
                        <p className="text-gray-400">Choose a lesson from the list to start watching.</p>
                      </div>
                    )}
                  </div>

                  {/* Module List (Sidebar) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white font-mono mb-4 text-teal-400">CURRICULUM</h3>
                    {courseData.modules && courseData.modules.length > 0 ? (
                      courseData.modules.map((module, mIndex) => (
                        <div key={module.id || mIndex} className="bg-gray-800/70 border border-gray-700 rounded-xl overflow-hidden">
                          <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                            <h4 className="font-bold text-white font-mono text-sm">{module.title}</h4>
                            <span className="text-xs text-gray-500 font-mono">{module.lessons?.length || 0} LESSONS</span>
                          </div>
                          <div className="divide-y divide-gray-700/50">
                            {module.lessons && module.lessons.map((lesson, lIndex) => (
                              <button
                                key={lesson.id || lIndex}
                                onClick={() => {
                                  console.log('CourseLearning: Selected lesson:', lesson);
                                  setActiveLesson(lesson);
                                }}

                                className={`w-full text-left p-3 hover:bg-gray-700 transition-colors flex items-center space-x-3 ${activeLesson?.id === lesson.id ? 'bg-teal-500/10 border-l-2 border-teal-500' : ''
                                  }`}
                              >
                                <div className={`p-2 rounded-full ${activeLesson?.id === lesson.id ? 'bg-teal-500 text-black' : 'bg-gray-700 text-gray-400'
                                  }`}>
                                  <FaPlay className="text-xs" />
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${activeLesson?.id === lesson.id ? 'text-teal-400' : 'text-gray-300'
                                    }`}>{lesson.title}</p>
                                  <p className="text-xs text-gray-500">{lesson.duration} min</p>
                                </div>
                              </button>
                            ))}
                            {(!module.lessons || module.lessons.length === 0) && (
                              <p className="p-4 text-xs text-gray-500 text-center italic">No lessons in this module</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No modules available.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Sessions Tab */}
              {currentTab === 'upcoming' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white font-mono">UPCOMING LIVE SESSIONS</h2>

                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
                      <div className="text-6xl text-gray-700 mb-4">📅</div>
                      <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO UPCOMING SESSIONS</h3>
                      <p className="text-gray-500 font-mono text-sm">Check back later for new sessions</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white font-mono mb-2">
                                {session.title}
                              </h3>
                              <p className="text-gray-400 font-mono text-sm mb-4">
                                {session.description}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <FaCalendarAlt className="text-teal-400" />
                                  <span className="text-gray-300 font-mono">
                                    {formatDate(session.scheduledAt)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FaClock className="text-blue-400" />
                                  <span className="text-gray-300 font-mono">
                                    {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FaVideo className="text-green-400" />
                                  <span className="text-gray-300 font-mono">
                                    {session.duration}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FaUsers className="text-purple-400" />
                                  <span className="text-gray-300 font-mono">
                                    Max {session.maxParticipants}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="ml-6">
                              <Button
                                onClick={() => joinGoogleMeet(session.meetLink, session.title)}
                                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                              >
                                <FaExternalLinkAlt className="mr-2" />
                                JOIN GOOGLE MEET
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Past Sessions Tab */}
              {currentTab === 'past' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white font-mono">PAST SESSIONS & RECORDINGS</h2>

                  {pastSessions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
                      <div className="text-6xl text-gray-700 mb-4">🎥</div>
                      <h3 className="text-xl font-bold text-gray-400 mb-2 font-mono">NO PAST SESSIONS</h3>
                      <p className="text-gray-500 font-mono text-sm">Completed sessions and recordings will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastSessions.map((session) => {
                        const attendanceStatus = getAttendanceStatus(session.id);

                        return (
                          <div key={session.id} className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-bold text-white font-mono">
                                    {session.title}
                                  </h3>
                                  {attendanceStatus === 'attended' && (
                                    <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                      <FaCheckCircle className="text-xs" />
                                      <span className="text-xs font-mono">ATTENDED</span>
                                    </div>
                                  )}
                                  {attendanceStatus === 'missed' && (
                                    <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                      <FaTimesCircle className="text-xs" />
                                      <span className="text-xs font-mono">MISSED</span>
                                    </div>
                                  )}
                                </div>

                                <p className="text-gray-400 font-mono text-sm mb-4">
                                  {formatDate(session.scheduledAt)} • {session.duration}
                                </p>
                              </div>

                              <div className="ml-6 flex space-x-3">
                                {/* Attendance Marking */}
                                {!attendanceStatus && (
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => markAttendance(session.id, true)}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm"
                                    >
                                      <FaCheckCircle className="mr-1" />
                                      ATTENDED
                                    </Button>
                                    <Button
                                      onClick={() => markAttendance(session.id, false)}
                                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm"
                                    >
                                      <FaTimesCircle className="mr-1" />
                                      MISSED
                                    </Button>
                                  </div>
                                )}

                                {/* Recording Download */}
                                {session.recordingUrl && (
                                  <Button
                                    onClick={() => downloadRecording(session.recordingUrl, session.title)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm"
                                  >
                                    <FaPlay className="mr-1" />
                                    RECORDING
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {/* Reviews Section */}
              <CourseReviews courseId={course.id} />
            </>
          )
        }
      </main >
    </div >
  );
};

export default CourseLearning;
