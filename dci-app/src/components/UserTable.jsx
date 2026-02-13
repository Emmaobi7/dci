import React, { useState, useEffect, useMemo } from 'react';
import { formatDate } from '../utils/formatters';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from './index';
import { FaUserCog, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';

const UserTable = () => {
    const { user } = useAuth();
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [editingUser, setEditingUser] = useState(null);
    const [message, setMessage] = useState('');

    const roles = [
        { value: 'student', label: 'Student', color: 'bg-blue-900 text-blue-300' },
        { value: 'instructor', label: 'Instructor', color: 'bg-green-900 text-green-300' },
        { value: 'admin', label: 'Admin', color: 'bg-purple-900 text-purple-300' }
    ];

    useEffect(() => {
        loadAllUsers();
    }, []);

    const loadAllUsers = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
            setMessage('Error loading users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [allUsers, searchTerm, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const updateUserRole = async (userId, newRole) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                role: newRole,
                lastUpdated: new Date().toISOString(),
                updatedBy: user.uid
            });

            setAllUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));

            setEditingUser(null);
            setMessage(`Role updated to ${newRole}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating role:', error);
            setMessage('Failed to update role');
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            {/* Header & Controls */}
            <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center">
                        <FaUserCog className="mr-3 text-teal-400" />
                        USER MANAGEMENT ({allUsers.length})
                    </h2>
                    {message && (
                        <span className={`text-sm px-3 py-1 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                            {message}
                        </span>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-sm"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaFilter className="text-gray-500" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-sm"
                        >
                            <option value="all">All Roles</option>
                            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-gray-400 font-mono text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                        ) : currentUsers.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found matching your filters.</td></tr>
                        ) : (
                            currentUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{u.displayName || 'No Name'}</div>
                                        <div className="text-sm text-gray-400 font-mono">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingUser === u.id ? (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                                                    defaultValue={u.role || 'student'}
                                                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                    autoFocus
                                                    onBlur={() => setEditingUser(null)}
                                                >
                                                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                </select>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded text-xs font-mono font-bold uppercase ${roles.find(r => r.value === (u.role || 'student'))?.color || 'bg-gray-700 text-gray-300'
                                                }`}>
                                                {u.role || 'STUDENT'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                                        {formatDate(u.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setEditingUser(u.id)}
                                            className="text-teal-400 hover:text-teal-300 font-mono text-xs font-bold"
                                        >
                                            MANAGE
                                        </button>
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

export default UserTable;
