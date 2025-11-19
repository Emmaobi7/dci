import React, { useState } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './index';
import sampleData from '../data/sampleData';

const FirebaseDataSeeder = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const seedFirebase = async () => {
    if (!user) {
      setMessage('User not authenticated');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create sample users first
      console.log('Creating sample users...');
      const userPromises = sampleData.users.map(async (userData) => {
        const userRef = doc(db, 'users', userData.uid);
        await setDoc(userRef, userData);
        console.log('Created user:', userData.email);
      });
      await Promise.all(userPromises);

      // Create sample courses
      console.log('Creating sample courses...');
      const coursePromises = sampleData.courses.map(async (courseData) => {
        // Use the original course ID from sample data
        const courseRef = doc(db, 'courses', courseData.id);
        await setDoc(courseRef, {
          ...courseData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log('Created course:', courseData.title, 'with ID:', courseData.id);
      });
      await Promise.all(coursePromises);

      setMessage(`✅ Successfully loaded ${sampleData.users.length} users and ${sampleData.courses.length} courses!`);
    } catch (error) {
      console.error('Error seeding Firebase:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-teal-400 mb-4 font-mono">🔥 FIREBASE DATA SEEDER</h3>
      
      <div className="space-y-4">
        <p className="text-gray-300 text-sm">
          Load sample courses and users into Firestore for testing.
        </p>
        
        <Button
          onClick={seedFirebase}
          disabled={loading || !user}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
        >
          {loading ? 'Loading Data...' : '🚀 Load Sample Data'}
        </Button>

        {message && (
          <div className={`p-3 rounded text-sm font-mono ${
            message.includes('✅') 
              ? 'bg-green-900 text-green-300 border border-green-600' 
              : 'bg-red-900 text-red-300 border border-red-600'
          }`}>
            {message}
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <p>• This will create sample data in your Firestore database</p>
          <p>• Make sure your Firestore security rules allow writes</p>
          <p>• Data includes courses for testing different roles</p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDataSeeder;
