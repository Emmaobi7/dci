import React, { useState, useEffect } from 'react';
import { FaUserTie, FaTimes, FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const InstructorApplicationModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    nationality: '',
    reason: '',
  });
  const [links, setLinks] = useState([{ url: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);
  
  useEffect(() => {
    if (isOpen && user) {
      checkExistingApplication();
    }
  }, [isOpen, user]);

  const checkExistingApplication = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'instructor_applications'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      
      let status = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending') status = 'pending';
        else if (data.status === 'approved') status = 'approved';
        else if (data.status === 'rejected' && (!status || status === 'rejected')) status = 'rejected';
      });
      setExistingStatus(status);
    } catch (error) {
      console.error('Error checking applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...links];
    newLinks[index].url = value;
    setLinks(newLinks);
  };

  const addLinkField = () => {
    setLinks([...links, { url: '' }]);
  };

  const removeLinkField = (index) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      setLinks(newLinks);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim() || !formData.fullName.trim() || !formData.phone.trim() || !formData.nationality.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    
    // Clean empty links
    const validLinks = links.filter(link => link.url.trim() !== '').map(l => l.url.trim());
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'instructor_applications'), {
        userId: user.uid,
        userEmail: user.email,
        ...formData,
        links: validLinks,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      setExistingStatus('pending');
      alert('Application submitted successfully! An administrator will review it.');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full my-8 shadow-2xl relative">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/50 sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <FaUserTie className="text-teal-400 text-xl" />
            <h2 className="text-xl font-bold text-white font-mono tracking-wider">APPLY TO TEACH</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {loading && existingStatus === null ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
            </div>
          ) : existingStatus === 'pending' ? (
            <div className="text-center py-8">
              <FaInfoCircle className="text-4xl text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white font-mono mb-2">APPLICATION PENDING</h3>
              <p className="text-gray-400 font-mono text-sm max-w-sm mx-auto">
                Your application to become an instructor is currently under review. We will notify you once a decision is made.
              </p>
              <Button onClick={onClose} className="mt-8 bg-gray-700 hover:bg-gray-600 px-8">CLOSE</Button>
            </div>
          ) : existingStatus === 'approved' ? (
            <div className="text-center py-8">
              <FaInfoCircle className="text-4xl text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white font-mono mb-2">ALREADY APPROVED</h3>
              <p className="text-gray-400 font-mono text-sm max-w-sm mx-auto">
                Your previous application was approved! You should already be an instructor.
              </p>
              <Button onClick={onClose} className="mt-8 bg-gray-700 hover:bg-gray-600 px-8">CLOSE</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {existingStatus === 'rejected' && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                  <p className="text-red-400 text-sm font-mono">
                    Your previous application was rejected. You may submit a new one for reconsideration.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-mono text-sm mb-1">FULL NAME *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors font-mono text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-sm mb-1">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors font-mono text-sm"
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-sm mb-1">NATIONALITY *</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors font-mono text-sm"
                  placeholder="e.g. Nigerian, American"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-sm mb-1">WHY DO YOU WANT TO TEACH AND WHAT? *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors h-28 resize-none font-mono text-sm"
                  placeholder="Briefly describe your expertise and exactly what you plan to teach..."
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-400 font-mono text-sm">PORTFOLIO / PROFILE LINKS (OPTIONAL)</label>
                  <button type="button" onClick={addLinkField} className="text-teal-400 hover:text-teal-300 font-mono text-xs flex items-center gap-1">
                    <FaPlus /> ADD LINK
                  </button>
                </div>
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors font-mono text-sm"
                        placeholder="https://linkedin.com/..."
                      />
                      {links.length > 1 && (
                        <button type="button" onClick={() => removeLinkField(index)} className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-900/50 transition-colors">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700 mt-6">
                <Button type="button" onClick={onClose} className="bg-transparent hover:bg-gray-700 text-gray-400 font-bold px-6 py-2 border border-gray-600">
                  CANCEL
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-2 border-0">
                  {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorApplicationModal;
