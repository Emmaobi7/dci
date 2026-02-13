import React, { useState, useEffect } from 'react';
import { useCourses } from '../contexts/CourseContext';
import { formatDate } from '../utils/formatters';
import { FaBook, FaArrowLeft, FaUsers, FaMoneyBillWave, FaList, FaVideo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminCourseDetail = ({ course, onBack }) => {
    const navigate = useNavigate();
    const { getCourseSessions } = useCourses();
    const [activeTab, setActiveTab] = useState('details');
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const loadSessions = async () => {
            if (course?.id) {
                try {
                    const fetchedSessions = await getCourseSessions(course.id);
                    setSessions(fetchedSessions);
                } catch (error) {
                    console.error('Error loading sessions:', error);
                }
            }
        };
        loadSessions();
    }, [course, getCourseSessions]);

    if (!course) return null;

    const totalRevenue = ((course.totalStudents || 0) * (course.price || 0));

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold font-mono text-teal-400">{course.title}</h1>
                                <span className={`px-2 py-1 rounded text-xs font-mono font-bold uppercase ${course.status === 'published' ? 'bg-green-900 text-green-300' :
                                        course.status === 'draft' ? 'bg-yellow-900 text-yellow-300' :
                                            'bg-red-900 text-red-300'
                                    }`}>
                                    {course.status}
                                </span>
                            </div>
                            <p className="text-gray-400 font-mono">
                                Instructor: {course.instructorName} • Created: {formatDate(course.createdAt)}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center min-w-[120px]">
                                <div className="text-gray-400 text-xs font-mono mb-1">REVENUE</div>
                                <div className="text-xl font-bold text-green-400">₦{totalRevenue.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center min-w-[120px]">
                                <div className="text-gray-400 text-xs font-mono mb-1">STUDENTS</div>
                                <div className="text-xl font-bold text-blue-400">{course.totalStudents || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700 flex gap-4 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${activeTab === 'details' ? 'bg-teal-500 text-gray-900 font-bold' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            DETAILS
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${activeTab === 'content' ? 'bg-teal-500 text-gray-900 font-bold' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            CURRICULUM ({course.modules?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${activeTab === 'sessions' ? 'bg-teal-500 text-gray-900 font-bold' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            SESSIONS ({sessions.length})
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-teal-400 font-bold font-mono mb-2">DESCRIPTION</h3>
                                    <p className="text-gray-300 leading-relaxed">{course.description}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-teal-400 font-bold font-mono mb-2">PRICING</h3>
                                        <p className="text-2xl font-bold">₦{course.price?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-teal-400 font-bold font-mono mb-2">CATEGORY</h3>
                                        <p className="bg-gray-700 inline-block px-3 py-1 rounded text-sm">{course.category || 'Uncategorized'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-4">
                                {(course.modules || []).map((module, idx) => (
                                    <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                                        <h4 className="font-bold text-white mb-2 flex justify-between">
                                            <span>{module.title}</span>
                                            <span className="text-gray-500 text-xs font-mono">{module.lessons?.length || 0} LESSONS</span>
                                        </h4>
                                        <div className="pl-4 border-l-2 border-gray-700 space-y-2 mt-2">
                                            {module.lessons?.map((lesson, lIdx) => (
                                                <div key={lIdx} className="flex justify-between items-center text-sm text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        {lesson.type === 'video' ? <FaVideo className="text-teal-500" /> : <FaBook className="text-blue-500" />}
                                                        <span>{lesson.title}</span>
                                                    </div>
                                                    <span className="font-mono text-xs">{lesson.type?.toUpperCase()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {(!course.modules || course.modules.length === 0) && (
                                    <p className="text-gray-500 italic">No content uploaded yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'sessions' && (
                            <div className="space-y-3">
                                {sessions.length === 0 ? (
                                    <p className="text-gray-500 italic">No sessions scheduled.</p>
                                ) : (
                                    sessions.map(session => (
                                        <div key={session.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-white mb-1">{session.title}</h4>
                                                <p className="text-xs text-gray-400 font-mono">{formatDate(session.scheduledAt)} • {session.duration} mins</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${new Date(session.scheduledAt) > new Date() ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'
                                                }`}>
                                                {new Date(session.scheduledAt) > new Date() ? 'UPCOMING' : 'COMPLETED'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCourseDetail;
