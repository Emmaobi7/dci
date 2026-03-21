import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaCheck, FaTimes, FaUserTie, FaLink } from 'react-icons/fa';
import Button from './Button';

const AdminApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState('pending'); // 'pending' | 'approved'

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'instructor_applications'),
                where('status', '==', filter)
            );
            const snapshot = await getDocs(q);
            const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            appsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setApplications(appsData);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const handleApproval = async (appId, userId, approved) => {
        setActionLoading(appId);
        try {
            const appRef = doc(db, 'instructor_applications', appId);
            await updateDoc(appRef, {
                status: approved ? 'approved' : 'rejected',
                processedAt: new Date().toISOString()
            });

            if (approved) {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, { role: 'instructor' });
            }

            // Remove from local list if we are viewing pending
            if (filter === 'pending') {
                setApplications(apps => apps.filter(a => a.id !== appId));
            }
        } catch (error) {
            console.error('Error processing application:', error);
            alert('Failed to process application. Make sure the user document ID matches the userId.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-wider">INSTRUCTOR APPLICATIONS</h2>
                    <p className="text-gray-400 font-mono mt-1 text-sm">Review requests from students to become instructors.</p>
                </div>
                
                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 self-start sm:self-auto">
                    <button 
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-md font-mono text-sm transition-colors ${filter === 'pending' ? 'bg-teal-500 text-gray-900 font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                        PENDING
                    </button>
                    <button 
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-md font-mono text-sm transition-colors ${filter === 'approved' ? 'bg-teal-500 text-gray-900 font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                        APPROVED
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center text-gray-400">
                    <FaUserTie className="text-5xl mx-auto mb-4 text-gray-600" />
                    <p className="font-mono text-lg">No {filter} applications.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-gray-600 transition-colors">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-white font-mono">{app.fullName || app.displayName}</h3>
                                    {app.nationality && (
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded font-mono">{app.nationality}</span>
                                    )}
                                </div>
                                <div className="text-sm font-mono text-gray-400">
                                    <p>Email: <span className="text-gray-300">{app.userEmail}</span></p>
                                    {app.phone && <p>Phone: <span className="text-gray-300">{app.phone}</span></p>}
                                </div>
                                
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 mt-2">
                                    <p className="text-gray-300 font-mono text-sm">"{app.reason}"</p>
                                </div>

                                {app.links && app.links.length > 0 && (
                                    <div className="pt-2">
                                        <h4 className="text-xs font-mono text-gray-500 mb-2">PROVIDED LINKS:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {app.links.map((link, i) => (
                                                <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                                                    <FaLink /> Link {i+1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <p className="text-xs text-gray-500 font-mono mt-3">
                                    Applied: {new Date(app.createdAt).toLocaleString()}
                                    {app.processedAt && ` • Processed: ${new Date(app.processedAt).toLocaleString()}`}
                                </p>
                            </div>
                            
                            {filter === 'pending' ? (
                                <div className="flex md:flex-col gap-3 justify-center items-end shrink-0">
                                    <Button 
                                        onClick={() => handleApproval(app.id, app.userId, true)}
                                        disabled={actionLoading === app.id}
                                        className="bg-green-600 hover:bg-green-500 text-white w-full sm:w-auto md:w-full gap-2"
                                    >
                                        {actionLoading === app.id ? 'PROCESSING...' : <><FaCheck /> APPROVE</>}
                                    </Button>
                                    <Button 
                                        onClick={() => handleApproval(app.id, app.userId, false)}
                                        disabled={actionLoading === app.id}
                                        className="bg-red-900/40 hover:bg-red-800 border-red-500/50 text-red-300 border w-full sm:w-auto md:w-full gap-2"
                                    >
                                        {actionLoading === app.id ? 'PROCESSING...' : <><FaTimes /> REJECT</>}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex justify-center flex-col items-center shrink-0">
                                    <span className="bg-green-900/40 border border-green-500/50 text-green-400 font-mono text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                        <FaCheck /> APPROVED
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApplicationsList;
