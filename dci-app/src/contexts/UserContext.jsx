import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const UserContext = createContext({});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setEnrolledCourses([]);
      setLoading(false);
      return;
    }

    console.log('UserContext: Setting up profile for user:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const profile = docSnap.data();
          console.log('UserContext: Loaded profile from Firestore:', profile);
          setUserProfile(profile);
          setEnrolledCourses(profile.enrolledCourses || []);
        } else {
          // Create new user profile
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            role: 'student', // Default role
            enrolledCourses: [],
            progress: {},
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };
          
          await setDoc(userRef, newProfile);
          console.log('UserContext: Created new profile:', newProfile);
          setUserProfile(newProfile);
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error('UserContext: Error with Firestore:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateUserProfile = async (updates) => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedData = {
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      
      await updateDoc(userRef, updatedData);
      console.log('UserContext: Profile updated:', updatedData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const enrollInCourse = async (courseId) => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    try {
      const updatedCourses = [...(userProfile.enrolledCourses || [])];
      if (!updatedCourses.includes(courseId)) {
        updatedCourses.push(courseId);
        await updateUserProfile({ enrolledCourses: updatedCourses });
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  };

  const updateProgress = async (courseId, lessonId, completed = true) => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    try {
      const currentProgress = userProfile.progress || {};
      const courseProgress = currentProgress[courseId] || {};
      
      courseProgress[lessonId] = {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      };
      
      const updatedProgress = {
        ...currentProgress,
        [courseId]: courseProgress
      };
      
      await updateUserProfile({ progress: updatedProgress });
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId);
  };

  const hasRole = (role) => {
    return userProfile?.role === role;
  };

  const updateUserProgress = async (courseId, progressData) => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    try {
      // Save progress to user profile in Firebase
      const currentProgress = userProfile.courseProgress || {};
      currentProgress[courseId] = {
        ...currentProgress[courseId],
        ...progressData,
        lastUpdated: new Date().toISOString()
      };

      await updateUserProfile({ courseProgress: currentProgress });
      console.log('UserContext: Progress updated for course:', courseId);
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  };

  const value = {
    userProfile,
    enrolledCourses,
    loading,
    updateUserProfile,
    enrollInCourse,
    updateProgress,
    updateUserProgress,
    isEnrolled,
    hasRole,
    isStudent: hasRole('student'),
    isInstructor: hasRole('instructor'),
    isAdmin: hasRole('admin'),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
