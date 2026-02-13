import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/formatters';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './index';
import { FaStar, FaRegStar, FaUser } from 'react-icons/fa';

const CourseReviews = ({ courseId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const reviewsRef = collection(db, 'courses', courseId, 'reviews');
                const q = query(reviewsRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [courseId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            const reviewData = {
                userId: user.uid,
                userName: user.displayName || user.email,
                rating,
                comment,
                createdAt: new Date().toISOString()
            };

            const reviewsRef = collection(db, 'courses', courseId, 'reviews');
            await addDoc(reviewsRef, reviewData);

            // Update average rating on course document
            const allReviews = [...reviews, reviewData];
            const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

            await updateDoc(doc(db, 'courses', courseId), {
                averageRating: Number(avgRating.toFixed(1)),
                reviewCount: allReviews.length
            });

            setReviews([reviewData, ...reviews]);
            setShowForm(false);
            setComment('');
            setRating(5);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (count) => {
        return [...Array(5)].map((_, i) => (
            <span key={i}>
                {i < count ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-600" />}
            </span>
        ));
    };

    return (
        <div className="space-y-6 mt-12 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white font-mono">STUDENT REVIEWS</h3>
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-teal-500 hover:bg-teal-400 text-gray-900 text-sm"
                    >
                        LEAVE A REVIEW
                    </Button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmitReview} className="bg-gray-800/50 p-6 rounded-lg border border-teal-500/30 space-y-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-300 font-mono text-sm mr-2">RATING:</span>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setRating(num)}
                                className="text-xl focus:outline-none"
                            >
                                {num <= rating ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-600" />}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us what you think about this course..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm h-24 focus:border-teal-500 outline-none"
                        required
                    />
                    <div className="flex space-x-2">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-teal-500 text-gray-900 font-bold flex-1"
                        >
                            {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-700 text-white flex-1"
                        >
                            CANCEL
                        </Button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-500 font-mono text-center">LOADING REVIEWS...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-500 font-mono text-center italic">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review, index) => (
                        <div key={index} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                        <FaUser className="text-gray-400 text-xs" />
                                    </div>
                                    <div>
                                        <p className="text-white font-mono text-sm font-bold">{review.userName}</p>
                                        <div className="flex">{renderStars(review.rating)}</div>
                                    </div>
                                </div>
                                <span className="text-gray-500 font-mono text-xs">
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>
                            <p className="text-gray-300 font-mono text-sm pl-11">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseReviews;
