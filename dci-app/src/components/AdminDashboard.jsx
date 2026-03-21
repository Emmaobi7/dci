import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useCourses } from '../contexts/CourseContext';
import { Logo, Button, UserTable, CourseTable, AdminApplicationsList } from './index';
import { FaUserCog, FaBook, FaSignOutAlt, FaChartPie, FaBars, FaTimes, FaUserTie } from 'react-icons/fa';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';

const AdminDashboard = () => {
    const { signOut } = useAuth();
    const { userProfile } = useUser();
    const { courses } = useCourses();
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const coll = collection(db, "users");
                const snapshot = await getCountFromServer(coll);
                setUserCount(snapshot.data().count);
            } catch (err) {
                console.error("Error fetching user stats:", err);
            }
        };
        fetchStats();
    }, []);

    const totalRevenue = courses.reduce((acc, course) => acc + ((course.totalStudents || 0) * (course.price || 0)), 0);

    // Security check: Ensure only admins can see this
    if (userProfile?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-400">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: FaChartPie },
        { id: 'users', label: 'User Management', icon: FaUserCog },
        { id: 'courses', label: 'Course Management', icon: FaBook },
        { id: 'applications', label: 'Instructor Apps', icon: FaUserTie },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white font-mono tracking-wider">PLATFORM OVERVIEW</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Stats placeholders - will be populated by context */}
                            <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                                <h3 className="text-gray-400 font-mono text-sm">TOTAL USERS</h3>
                                <p className="text-4xl font-bold text-white mt-2">{userCount}</p>
                            </div>
                            <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                                <h3 className="text-gray-400 font-mono text-sm">TOTAL COURSES</h3>
                                <p className="text-4xl font-bold text-teal-400 mt-2">{courses.length}</p>
                            </div>
                            <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl">
                                <h3 className="text-gray-400 font-mono text-sm">TOTAL REVENUE</h3>
                                <p className="text-4xl font-bold text-green-400 mt-2">₦{totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                return <UserTable />;
            case 'courses':
                return <CourseTable />;
            case 'applications':
                return <AdminApplicationsList />;
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-gray-800 border-r border-gray-700 min-h-screen fixed left-0 top-0 z-20">
                <div className="p-6 border-b border-gray-700">
                    <Logo size="md" />
                    <div className="mt-4 px-2 py-1 bg-red-900/50 border border-red-700 rounded text-red-200 text-xs font-mono text-center">
                        ADMINISTRATOR MODE
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-mono text-sm ${activeTab === item.id
                                ? 'bg-teal-500 text-gray-900 font-bold'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <item.icon className="text-lg" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors font-mono text-sm"
                    >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-20">
                <Logo size="sm" />
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-white p-2"
                >
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-gray-900/95 pt-20 px-6">
                    <div className="mb-6 px-2 py-1 bg-red-900/50 border border-red-700 rounded text-red-200 text-xs font-mono text-center">
                        ADMINISTRATOR MODE
                    </div>
                    <nav className="space-y-4">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-colors font-mono text-lg ${activeTab === item.id
                                    ? 'bg-teal-500 text-gray-900 font-bold'
                                    : 'text-gray-400 bg-gray-800'
                                    }`}
                            >
                                <item.icon className="text-xl" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-red-400 bg-gray-800 border border-red-900/30 mt-8 font-mono text-lg"
                        >
                            <FaSignOutAlt />
                            <span>Sign Out</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 overflow-x-hidden">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
