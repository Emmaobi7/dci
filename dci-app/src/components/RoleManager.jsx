import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Button, Input } from './index';
import { FaUserCog, FaCheck, FaSearch, FaUsers } from 'react-icons/fa';

const RoleManager = () => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Only show to admins
  if (!userProfile || userProfile.role !== 'admin') {
    return null;
  }

  const roles = [
    { value: 'student', label: '👨‍🎓 Student', description: 'Browse and enroll in courses' },
    { value: 'instructor', label: '👨‍🏫 Instructor', description: 'Create and manage courses' },
    { value: 'admin', label: '👨‍💼 Admin', description: 'Full platform access' }
  ];

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    setFoundUser(null);
    setMessage('');

    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', searchEmail.trim().toLowerCase())
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        setFoundUser({
          id: userDoc.id,
          ...userDoc.data()
        });
      } else {
        setMessage('❌ User not found with that email');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole, userEmail) => {
    setUpdating(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.uid
      });

      setMessage(`✅ Role updated to ${newRole} for ${userEmail}!`);
      
      // Update found user if it was the one being updated
      if (foundUser && foundUser.id === userId) {
        setFoundUser({
          ...foundUser,
          role: newRole
        });
      }
      
      // Refresh all users list
      await loadAllUsers();
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleStats = () => {
    const stats = {
      student: allUsers.filter(u => u.role === 'student' || !u.role).length,
      instructor: allUsers.filter(u => u.role === 'instructor').length,
      admin: allUsers.filter(u => u.role === 'admin').length
    };
    return stats;
  };

  const stats = getRoleStats();

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-teal-400 mb-4 font-mono flex items-center">
        <FaUserCog className="mr-2" />
        USER ROLE MANAGEMENT (ADMIN ONLY)
      </h3>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.student}</div>
          <div className="text-xs text-gray-400 font-mono">STUDENTS</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.instructor}</div>
          <div className="text-xs text-gray-400 font-mono">INSTRUCTORS</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.admin}</div>
          <div className="text-xs text-gray-400 font-mono">ADMINS</div>
        </div>
      </div>

      {/* User Search */}
      <div className="space-y-4">
        <h4 className="text-white font-mono font-bold flex items-center">
          <FaSearch className="mr-2" />
          SEARCH USER BY EMAIL
        </h4>
        
        <div className="flex space-x-2">
          <Input
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter user email..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && searchUserByEmail()}
          />
          <Button
            onClick={searchUserByEmail}
            disabled={loading || !searchEmail.trim()}
            className="bg-teal-500 hover:bg-teal-400 text-gray-900"
          >
            {loading ? 'SEARCHING...' : 'SEARCH'}
          </Button>
        </div>

        {/* Found User */}
        {foundUser && (
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <h5 className="text-white font-mono font-bold mb-3">USER FOUND</h5>
            <div className="space-y-2 text-sm">
              <div><strong>Email:</strong> {foundUser.email}</div>
              <div><strong>Name:</strong> {foundUser.displayName || 'Not set'}</div>
              <div><strong>Current Role:</strong> 
                <span className="text-teal-400 ml-2 font-mono">
                  {foundUser.role?.toUpperCase() || 'STUDENT'}
                </span>
              </div>
              <div><strong>Joined:</strong> {new Date(foundUser.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="mt-4">
              <h6 className="text-white font-mono font-bold mb-2">ASSIGN ROLE:</h6>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Button
                    key={role.value}
                    onClick={() => updateUserRole(foundUser.id, role.value, foundUser.email)}
                    disabled={updating || foundUser.role === role.value}
                    className={`text-xs ${
                      foundUser.role === role.value
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {foundUser.role === role.value ? (
                      <>
                        <FaCheck className="mr-1" />
                        {role.label}
                      </>
                    ) : (
                      `Set as ${role.label}`
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Users */}
        <div className="mt-6">
          <h4 className="text-white font-mono font-bold mb-3 flex items-center">
            <FaUsers className="mr-2" />
            RECENT USERS ({allUsers.length} total)
          </h4>
          <div className="bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
            {allUsers.slice(0, 10).map((user) => (
              <div key={user.id} className="p-3 border-b border-gray-600 last:border-b-0 flex justify-between items-center">
                <div>
                  <div className="text-white font-mono text-sm">{user.email}</div>
                  <div className="text-gray-400 text-xs">
                    {user.displayName || 'No name'} • 
                    <span className="text-teal-400 ml-1">
                      {user.role?.toUpperCase() || 'STUDENT'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSearchEmail(user.email);
                    setFoundUser(user);
                  }}
                  className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 py-1"
                >
                  MANAGE
                </Button>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded text-sm font-mono ${
            message.includes('✅') 
              ? 'bg-green-900 text-green-300 border border-green-600' 
              : 'bg-red-900 text-red-300 border border-red-600'
          }`}>
            {message}
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1 mt-4 bg-gray-700/50 p-3 rounded">
          <p><strong>Admin Powers:</strong></p>
          <p>• Search users by email and manage their roles</p>
          <p>• View platform statistics and user counts</p>
          <p>• Role changes take effect immediately</p>
          <p>• All role changes are logged with admin ID</p>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;
