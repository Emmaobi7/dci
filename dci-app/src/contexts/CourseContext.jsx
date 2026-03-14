import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

const CourseContext = createContext({});

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to courses collection
    const unsubscribe = onSnapshot(
      collection(db, 'courses'), // Simplified query - no orderBy to avoid index
      (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort on client side
        coursesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCourses(coursesData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setMyCourses([]);
      return;
    }

    // Listen to courses created by current user (for instructors)
    // Simplified query to avoid index requirement
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'courses'),
        where('instructorId', '==', user.uid)
      ),
      (snapshot) => {
        const userCourses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort on client side to avoid index requirement
        userCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyCourses(userCourses);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createCourse = async (courseData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newCourse = {
        ...courseData,
        id: uuidv4(),
        instructorId: user.uid,
        instructorName: user.displayName || user.email,
        enrolledStudents: [],
        totalStudents: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published', // Auto-publish for testing (change to 'draft' for production)
      };

      await setDoc(doc(db, 'courses', newCourse.id), newCourse);
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const updateCourse = async (courseId, updates) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'courses', courseId), updatedData);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const deleteCourse = async (courseId) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  const enrollStudent = async (courseId, studentId) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const userRef = doc(db, 'users', studentId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) {
        throw new Error('Course not found');
      }

      const courseData = courseSnap.data();
      const enrolledStudents = courseData.enrolledStudents || [];

      // Check maxStudents limit
      if (courseData.maxStudents && typeof courseData.maxStudents === 'number' && courseData.maxStudents > 0) {
        if (enrolledStudents.length >= courseData.maxStudents) {
          throw new Error('Course is full');
        }
      }

      if (!enrolledStudents.includes(studentId)) {
        // 1. Update Course Document
        enrolledStudents.push(studentId);
        await updateDoc(courseRef, {
          enrolledStudents,
          totalStudents: enrolledStudents.length,
          updatedAt: new Date().toISOString()
        });

        // 2. Update User Document (redundancy for faster querying)
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userEnrolledCourses = userData.enrolledCourses || [];
          if (!userEnrolledCourses.includes(courseId)) {
            userEnrolledCourses.push(courseId);

            // Add initial progress entry
            const courseProgress = userData.courseProgress || {};
            if (!courseProgress[courseId]) {
              courseProgress[courseId] = {
                enrolledAt: new Date().toISOString(),
                progressPercentage: 0,
                completedLessons: [],
                lastUpdated: new Date().toISOString()
              };
            }

            await updateDoc(userRef, {
              enrolledCourses: userEnrolledCourses,
              courseProgress,
              lastUpdated: new Date().toISOString()
            });
          }
        }

        console.log('CourseContext: Student enrolled successfully:', { courseId, studentId });
        return true;
      } else {
        console.log('CourseContext: Student already enrolled');
        return false;
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  };

  const getCourseById = async (courseId) => {
    try {
      const docSnap = await getDoc(doc(db, 'courses', courseId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting course:', error);
      throw error;
    }
  };

  const getEnrolledCourses = (enrolledCourseIds) => {
    return courses.filter(course => enrolledCourseIds.includes(course.id));
  };

  const getCourseAnalytics = async (courseId) => {
    try {
      const course = await getCourseById(courseId);
      if (!course) {
        console.warn(`Course analytics: Course ${courseId} not found`);
        return {
          totalStudents: 0,
          completionRate: 0,
          averageProgress: 0,
          averageRating: 0,
          totalRevenue: 0,
          monthlyEnrollments: 0,
          totalViews: 0
        };
      }

      // Get real enrolled students data
      const enrolledStudents = course.enrolledStudents || [];
      const totalRevenue = enrolledStudents.length * (course.price || 0);

      // Calculate real progress from students data
      const studentsData = await getEnrolledStudentsData(courseId);
      let totalProgress = 0;
      let completedStudents = 0;

      studentsData.forEach(student => {
        totalProgress += (student.progress || 0);
        if ((student.progress || 0) >= 100) {
          completedStudents++;
        }
      });

      const averageProgress = studentsData.length > 0 ? Math.round(totalProgress / studentsData.length) : 0;
      const completionRate = studentsData.length > 0 ? Math.round((completedStudents / studentsData.length) * 100) : 0;

      const analytics = {
        totalStudents: enrolledStudents.length,
        completionRate,
        averageProgress,
        averageRating: course?.averageRating || 0,
        totalRevenue,
        monthlyEnrollments: enrolledStudents.length,
        totalViews: enrolledStudents.length * 5
      };

      console.log('CourseContext: Real analytics calculated:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error loading course analytics:', error);
      throw error;
    }
  };

  const getEnrolledStudentsData = async (courseId) => {
    try {
      const course = await getCourseById(courseId);
      if (!course || !course.enrolledStudents) {
        return [];
      }

      // Get user profiles for enrolled students
      const studentsData = [];
      const studentPromises = course.enrolledStudents.map(userId => getDoc(doc(db, 'users', userId)));
      const studentDocs = await Promise.all(studentPromises);

      for (const userDoc of studentDocs) {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const courseProgress = userData.courseProgress?.[courseId] || {};

          studentsData.push({
            id: userDoc.id,
            name: userData.displayName || userData.email || 'Unknown User',
            email: userData.email || 'No email',
            enrolledAt: courseProgress.enrolledAt || userData.enrolledCourses?.[courseId]?.enrolledAt || course?.createdAt || new Date().toISOString(),
            progress: courseProgress.progressPercentage || 0,
            lastActive: courseProgress.lastUpdated || userData.lastLogin || new Date().toISOString()
          });
        }
      }

      return studentsData.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
    } catch (error) {
      console.error('Error getting enrolled students data:', error);
      throw error;
    }
  };

  const addCourseModule = async (courseId, moduleData) => {
    try {
      const course = await getCourseById(courseId);
      if (!course) throw new Error('Course not found');

      const modules = course.modules || [];
      const newModule = {
        id: uuidv4(),
        title: moduleData.title,
        description: moduleData.description,
        lessons: moduleData.lessons || [],
        createdAt: new Date().toISOString()
      };

      modules.push(newModule);

      await updateDoc(doc(db, 'courses', courseId), {
        modules,
        updatedAt: new Date().toISOString()
      });

      console.log('CourseContext: Module added successfully:', newModule.id);
      return newModule;
    } catch (error) {
      console.error('Error adding course module:', error);
      throw error;
    }
  };

  const updateCourseModule = async (courseId, moduleId, moduleData) => {
    try {
      const course = await getCourseById(courseId);
      if (!course) throw new Error('Course not found');

      const modules = course.modules || [];
      const moduleIndex = modules.findIndex(m => m.id === moduleId);

      if (moduleIndex === -1) throw new Error('Module not found');

      modules[moduleIndex] = {
        ...modules[moduleIndex],
        ...moduleData,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'courses', courseId), {
        modules,
        updatedAt: new Date().toISOString()
      });

      console.log('CourseContext: Module updated successfully:', moduleId);
      return modules[moduleIndex];
    } catch (error) {
      console.error('Error updating course module:', error);
      throw error;
    }
  };

  const deleteCourseModule = async (courseId, moduleId) => {
    try {
      const course = await getCourseById(courseId);
      if (!course) throw new Error('Course not found');

      const modules = (course.modules || []).filter(m => m.id !== moduleId);

      await updateDoc(doc(db, 'courses', courseId), {
        modules,
        updatedAt: new Date().toISOString()
      });

      console.log('CourseContext: Module deleted successfully:', moduleId);
      return true;
    } catch (error) {
      console.error('Error deleting course module:', error);
      throw error;
    }
  };

  const getCourseSessions = async (courseId) => {
    try {
      const sessionsRef = collection(db, 'courses', courseId, 'sessions');
      const q = query(sessionsRef, orderBy('scheduledAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting course sessions:', error);
      // Fallback if collection doesn't exist yet
      return [];
    }
  };

  const addCourseSession = async (courseId, sessionData) => {
    try {
      const sessionsRef = collection(db, 'courses', courseId, 'sessions');
      const newSession = {
        ...sessionData,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(sessionsRef, newSession);
      return { id: docRef.id, ...newSession };
    } catch (error) {
      console.error('Error adding course session:', error);
      throw error;
    }
  };

  const updateCourseSession = async (courseId, sessionId, updates) => {
    try {
      const sessionRef = doc(db, 'courses', courseId, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating course session:', error);
      throw error;
    }
  };

  const getPublishedCourses = () => {
    return courses.filter(course => course.status === 'published');
  };

  const createCourseStructure = async (courseId, structure) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) throw new Error('Course not found');

      const existingData = courseSnap.data();
      
      // Merge or overwrite modules
      // For an AI-first planner, we might want to completely replace the structure 
      // if it's a "regenerate" flow, but here we'll append/merge logically.
      const newModules = structure.modules.map(mod => ({
        id: uuidv4(),
        title: mod.title,
        description: mod.description,
        lessons: mod.lessons.map(lesson => ({
          id: uuidv4(),
          ...lesson,
          createdAt: new Date().toISOString()
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      await updateDoc(courseRef, {
        modules: newModules, // Replacing with the AI-generated structure
        updatedAt: new Date().toISOString()
      });

      // If structure contains sessions, add them too
      if (structure.sessions && structure.sessions.length > 0) {
        const sessionsRef = collection(db, 'courses', courseId, 'sessions');
        for (const session of structure.sessions) {
          await addDoc(sessionsRef, {
            ...session,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      console.log('CourseContext: AI Structure applied to course:', courseId);
      return true;
    } catch (error) {
      console.error('Error creating course structure:', error);
      throw error;
    }
  };

  const value = {
    courses,
    myCourses,
    loading,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollStudent,
    getCourseById,
    getEnrolledCourses,
    getPublishedCourses,
    getCourseAnalytics,
    getEnrolledStudentsData,
    addCourseModule,
    updateCourseModule,
    deleteCourseModule,
    getCourseSessions,
    addCourseSession,
    updateCourseSession,
    createCourseStructure,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};
