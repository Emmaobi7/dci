import React, { useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './index';

const FirebaseDataCleaner = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const clearCourses = async () => {
        if (!user) {
            setMessage('User not authenticated');
            return;
        }

        if (!window.confirm('WARNING: This will delete ALL courses, modules, lessons, sessions, and reviews. This action cannot be undone. Proceed?')) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            console.log('Fetching all courses...');
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const courseDocs = coursesSnapshot.docs;

            if (courseDocs.length === 0) {
                setMessage('No courses found to delete.');
                setLoading(false);
                return;
            }

            console.log(`Found ${courseDocs.length} courses. Starting cleanup...`);

            for (const courseDoc of courseDocs) {
                const courseId = courseDoc.id;

                // 1. Delete Sessions subcollection
                const sessionsSnapshot = await getDocs(collection(db, 'courses', courseId, 'sessions'));
                for (const sessionDoc of sessionsSnapshot.docs) {
                    await deleteDoc(doc(db, 'courses', courseId, 'sessions', sessionDoc.id));
                }

                // 2. Delete Reviews subcollection
                const reviewsSnapshot = await getDocs(collection(db, 'courses', courseId, 'reviews'));
                for (const reviewDoc of reviewsSnapshot.docs) {
                    await deleteDoc(doc(db, 'courses', courseId, 'reviews', reviewDoc.id));
                }

                // 3. Delete the course document itself
                await deleteDoc(doc(db, 'courses', courseId));
                console.log(`Deleted course: ${courseId}`);
            }

            // 4. Optionally clear attendance related to courses
            // Note: Attendance is stored as {courseId}_{userId}. 
            // This is harder to bulk delete without a list, but we can try to find all attendance docs.
            const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
            for (const attDoc of attendanceSnapshot.docs) {
                await deleteDoc(doc(db, 'attendance', attDoc.id));
            }

            setMessage(`✅ Successfully deleted ${courseDocs.length} courses and related data!`);
        } catch (error) {
            console.error('Error clearing data:', error);
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-red-900/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-red-500 mb-4 font-mono">⚠️ DATABASE CLEANER</h3>

            <div className="space-y-4">
                <p className="text-gray-400 text-sm font-mono">
                    Wipe all courses, sessions, reviews, and attendance records from Firestore.
                </p>

                <Button
                    onClick={clearCourses}
                    disabled={loading || !user}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                    {loading ? 'Clearing Data...' : '🗑️ Clear All Courses'}
                </Button>

                {message && (
                    <div className={`p-3 rounded text-sm font-mono ${message.includes('✅')
                            ? 'bg-green-900/50 text-green-300 border border-green-600/50'
                            : 'bg-red-900/50 text-red-300 border border-red-600/50'
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FirebaseDataCleaner;
