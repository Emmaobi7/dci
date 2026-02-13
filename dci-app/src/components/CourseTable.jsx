import React, { useState, useMemo } from 'react';
import { useCourses } from '../contexts/CourseContext';
import { formatDate } from '../utils/formatters';
import { FaBook, FaSearch, FaFilter, FaEye, FaChevronLeft, FaChevronRight, FaArchive, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CourseTable = () => {
    const { courses, updateCourse } = useCourses();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('title');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loadingAction, setLoadingAction] = useState(null);

    const filteredCourses = useMemo(() => {
        let result = courses.filter(c => {
            const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        result.sort((a, b) => {
            if (sortField === 'title') return a.title.localeCompare(b.title);
            if (sortField === 'students') return (b.totalStudents || 0) - (a.totalStudents || 0);
            if (sortField === 'revenue') {
                const revA = (a.totalStudents || 0) * (a.price || 0);
                const revB = (b.totalStudents || 0) * (b.price || 0);
                return revB - revA;
            }
            return 0;
        });

        return result;
    }, [courses, searchTerm, statusFilter, sortField]);

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const currentCourses = filteredCourses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleStatusChange = async (courseId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setLoadingAction(courseId);
        try {
            await updateCourse(courseId, { status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setLoadingAction(null);
        }
    };

    const calculateRevenue = (course) => {
        return ((course.totalStudents || 0) * (course.price || 0)).toLocaleString();
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            {/* Header & Controls */}
            <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center">
                        <FaBook className="mr-3 text-teal-400" />
                        COURSE MANAGEMENT ({courses.length})
                    </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by title or instructor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-600 rounded-lg px-3">
                            <FaFilter className="text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-white focus:outline-none font-mono text-sm py-2"
                            >
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft/Pending</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-600 rounded-lg px-3">
                            <span className="text-gray-500 text-xs font-mono">SORT:</span>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                                className="bg-transparent text-white focus:outline-none font-mono text-sm py-2"
                            >
                                <option value="title">Title</option>
                                <option value="students">Most Students</option>
                                <option value="revenue">Highest Revenue</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-gray-400 font-mono text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Stats</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {currentCourses.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No courses found to display.</td></tr>
                        ) : (
                            currentCourses.map(course => (
                                <tr key={course.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white text-sm">{course.title}</div>
                                        <div className="text-xs text-gray-400 font-mono">by {course.instructorName}</div>
                                        <div className="text-xs text-teal-500 font-mono mt-1">₦{course.price?.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-300 font-mono">
                                            <span className="text-blue-400 font-bold">{course.totalStudents || 0}</span> Students
                                        </div>
                                        <div className="text-xs text-green-500 font-mono">
                                            Est. Rev: ₦{calculateRevenue(course)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold uppercase ${course.status === 'published' ? 'bg-green-900 text-green-300 border border-green-700' :
                                                course.status === 'draft' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' :
                                                    'bg-red-900 text-red-300 border border-red-700'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {/* Actions */}
                                        {loadingAction === course.id ? (
                                            <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/courses/${course.id}/learn`)} // Admin inspects via learn view for now
                                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                                    title="Inspect Course Content"
                                                >
                                                    <FaEye />
                                                </button>

                                                {course.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleStatusChange(course.id, 'published')}
                                                        className="p-2 text-green-400 hover:text-green-300 transition-colors"
                                                        title="Approve Course"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}

                                                {course.status !== 'archived' && (
                                                    <button
                                                        onClick={() => handleStatusChange(course.id, 'archived')}
                                                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                        title="Archive Course"
                                                    >
                                                        <FaArchive />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-700 flex justify-between items-center bg-gray-800/50">
                    <div className="text-gray-400 text-xs font-mono">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white transition-colors"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white transition-colors"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseTable;
