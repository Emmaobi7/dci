import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { useUser } from '../contexts/UserContext';
import { Button } from './index';
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
  const { getCourseById } = useCourses();
  const { updateUserProgress } = useUser();
  const [courseData, setCourseData] = useState(course);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [currentTab, setCurrentTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load live sessions and attendance data from Firebase
    const loadSessionData = async () => {
      setLoading(true);
      try {
        // Generate sessions based on course modules
        const mockSessions = generateMockSessions();
        
        // Separate upcoming and past sessions
        const now = new Date();
        const upcoming = mockSessions.filter(session => new Date(session.scheduledAt) > now);
        const past = mockSessions.filter(session => new Date(session.scheduledAt) <= now);
        
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
  }, [course.id, user.uid]);

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

  const generateMockSessions = () => {
    // Generate Google Meet sessions based on course modules
    const sessions = [];
    const baseDate = new Date();
    
    courseData.modules?.forEach((module, moduleIndex) => {
      // Create 2-3 sessions per module
      const sessionCount = Math.min(module.lessons?.length || 1, 3);
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(baseDate.getDate() + (moduleIndex * 7) + (i * 2)); // Weekly sessions
        sessionDate.setHours(14, 0, 0, 0); // 2 PM sessions
        
        sessions.push({
          id: `session-${moduleIndex}-${i}`,
          title: `${module.title} - Session ${i + 1}`,
          description: `Live session covering ${module.title}`,
          scheduledAt: sessionDate.toISOString(),
          duration: '90 minutes',
          meetLink: `https://meet.google.com/xyz-abc-${moduleIndex}${i}`, // Mock Google Meet link
          instructorName: courseData.instructorName,
          maxParticipants: 50,
          recordingUrl: sessionDate < new Date() ? `https://drive.google.com/recording-${moduleIndex}-${i}` : null,
          status: sessionDate < new Date() ? 'completed' : 'scheduled'
        });
      }
    });
    
    return sessions.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
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
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setCurrentTab('upcoming')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                currentTab === 'upcoming'
                  ? 'bg-teal-500 text-gray-900 font-bold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FaCalendarAlt />
              <span>UPCOMING SESSIONS</span>
            </button>
            <button
              onClick={() => setCurrentTab('past')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                currentTab === 'past'
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400 font-mono">LOADING SESSIONS...</p>
          </div>
        ) : (
          <>
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
                                  {new Date(session.scheduledAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FaClock className="text-blue-400" />
                                <span className="text-gray-300 font-mono">
                                  {new Date(session.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                                {new Date(session.scheduledAt).toLocaleDateString()} • {session.duration}
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
          </>
        )}
      </main>
    </div>
  );
};

export default CourseLearning;
