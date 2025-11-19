import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Button } from './index';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FaCrown, FaUserShield } from 'react-icons/fa';

const AdminBootstrap = () => {
  const { user } = useAuth();
  const { updateUserProfile, userProfile } = useUser();
  const [hasAdmins, setHasAdmins] = useState(true);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const checkForAdmins = async () => {
      try {
        // Check if any admin users exist
        const adminsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin')
        );
        const adminSnapshot = await getDocs(adminsQuery);
        
        setHasAdmins(adminSnapshot.size > 0);
        console.log('Admin check:', { adminCount: adminSnapshot.size, hasAdmins: adminSnapshot.size > 0 });
      } catch (error) {
        console.error('Error checking for admins:', error);
        // If there's an error, assume no admins exist
        setHasAdmins(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkForAdmins();
    }
  }, [user]);

  const createFirstAdmin = async () => {
    if (!user) return;
    
    setCreating(true);
    try {
      await updateUserProfile({
        role: 'admin',
        isBootstrapAdmin: true,
        adminCreatedAt: new Date().toISOString()
      });
      
      setHasAdmins(true);
      console.log('First admin created:', user.email);
      alert(`✅ Admin account created successfully!\n\nYou (${user.email}) are now an admin and can manage user roles.`);
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin account. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-2"></div>
          <p className="text-blue-400 font-mono text-sm">CHECKING ADMIN STATUS...</p>
        </div>
      </div>
    );
  }

  // Only show if there are no admins AND user is logged in
  if (hasAdmins || !user) {
    return null;
  }

  // Only show if current user is not already an admin
  if (userProfile?.role === 'admin') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-lg p-6 mb-6">
      <div className="text-center">
        <FaCrown className="text-yellow-400 text-4xl mb-4 mx-auto" />
        <h3 className="text-xl font-bold text-yellow-400 mb-2 font-mono">
          NO ADMIN FOUND
        </h3>
        <p className="text-gray-300 font-mono text-sm mb-4 max-w-md mx-auto">
          This appears to be a new system with no administrators. Would you like to become the first admin?
        </p>
        
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <FaUserShield className="text-blue-400" />
            <span className="text-white font-mono font-bold">{user.email}</span>
          </div>
          <p className="text-gray-400 font-mono text-xs">
            This account will become the system administrator
          </p>
        </div>
        
        <Button
          onClick={createFirstAdmin}
          disabled={creating}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-gray-900 font-bold px-6 py-3"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2"></div>
              CREATING ADMIN...
            </>
          ) : (
            <>
              <FaCrown className="mr-2" />
              BECOME ADMIN
            </>
          )}
        </Button>
        
        <p className="text-yellow-600 font-mono text-xs mt-3">
          ⚠️ This option only appears when no admins exist
        </p>
      </div>
    </div>
  );
};

export default AdminBootstrap;
