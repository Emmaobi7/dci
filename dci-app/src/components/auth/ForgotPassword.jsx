import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { Input, Logo } from '../index';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Futuristic background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-green-900/10 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full filter blur-[100px] opacity-10"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-teal-500 rounded-full filter blur-[100px] opacity-10"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <Logo size="lg" className="justify-center mb-6" />
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheck className="text-green-400 text-2xl" />
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 mb-2 tracking-tight">
              TRANSMISSION SENT
            </h2>
            <p className="text-gray-400 font-mono text-sm tracking-wider mb-6">
              PASSWORD RESET PROTOCOL INITIATED
            </p>
            <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-8">
              <p className="text-gray-300 font-mono text-sm mb-6">
                Security credentials have been transmitted to:{' '}
                <span className="text-teal-400 font-bold">{email}</span>
              </p>
              <p className="text-gray-400 font-mono text-xs mb-6">
                Follow the embedded instructions to restore access to your account.
              </p>
              <button
                onClick={onBackToLogin}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/20 flex items-center justify-center space-x-2 group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>RETURN TO AUTHENTICATION</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-orange-900/10 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-yellow-500 rounded-full filter blur-[100px] opacity-10"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 mb-2 tracking-tight">
            CREDENTIAL RECOVERY
          </h2>
          <p className="text-gray-400 font-mono text-sm tracking-wider">
            SECURITY PROTOCOL RESET
          </p>
        </div>

        {/* Recovery Form */}
        <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-2xl shadow-orange-900/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 animate-pulse-fast">
                <p className="text-red-400 font-mono text-xs tracking-wider">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-gray-300 font-mono text-sm">
                Enter your registered email address to receive security reset instructions.
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                  EMAIL ADDRESS
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-orange-400 text-white placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-400 hover:to-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
              >
                {isLoading ? (
                  <svg 
                    className="animate-spin h-5 w-5 text-current" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <>
                    <span className="group-hover:scale-110 transition-transform">INITIATE RESET</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-gray-900/50 border border-gray-700 hover:border-orange-400 text-gray-300 hover:text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-orange-400/10 flex items-center justify-center space-x-2 group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>RETURN TO AUTHENTICATION</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-600 font-mono tracking-wider">
            SECURITY MEASURES ACTIVE • TRANSMISSION ENCRYPTED
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
