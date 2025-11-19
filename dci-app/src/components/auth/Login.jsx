import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Logo } from '../index';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ onSwitchToSignup, onForgotPassword, onShowPrivacy, onShowTerms }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { signIn, signInWithGoogle, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);
    clearError();

    try {
      await signIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError('');
    setIsLoading(true);
    clearError();

    try {
      await signInWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-900/10 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-teal-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzMzMzMiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMCA0MGwyMC0yMCAwIDIwLTIwIDB6TTAgMGwyMCAyMCAwLTIwLTIwIDB6TTQwIDBsLTIwIDIwIDAgLTIwIDIwIDB6TTQwIDQwbC0yMC0yMCAwIDIwIDIwIDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2 tracking-tight">
            ACCESS Grant
          </h2>
          <p className="text-gray-400 font-mono text-sm tracking-wider">
            AUTHENTICATION REQUIRED
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-2xl shadow-blue-900/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {displayError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 animate-pulse-fast">
                <p className="text-red-400 font-mono text-xs tracking-wider">{displayError}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                EMAIL
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400/20 transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-teal-400 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 bg-gray-900 border-gray-600 rounded text-teal-400 focus:ring-teal-400 focus:ring-offset-gray-900"
                />
                <span className="text-xs text-gray-400 font-mono tracking-wider">REMEMBER SESSION</span>
              </label>
              <button type="button" onClick={onForgotPassword} className="text-xs text-teal-400 hover:text-teal-300 font-mono tracking-wider transition-colors">
                RECOVER CREDENTIALS
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
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
                  <span className="group-hover:scale-110 transition-transform">AUTHENTICATE</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-800 text-xs text-gray-500 font-mono tracking-wider">ALTERNATE AUTH</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-gray-900/50 border border-gray-700 hover:border-teal-400 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-teal-400/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
            >
              <FaGoogle className="text-teal-400 group-hover:rotate-[360deg] transition-transform duration-500" />
              <span className="text-gray-300 group-hover:text-white">GOOGLE SSO</span>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-500 font-mono tracking-wider">
              NO CREDENTIALS?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-teal-400 hover:text-teal-300 font-bold transition-colors"
              >
                REQUEST ACCESS
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-600 font-mono tracking-wider">
            BY CONTINUING YOU AGREE TO OUR{' '}
            <button onClick={onShowTerms} className="text-teal-400 hover:text-teal-300 transition-colors">
              TERMS
            </button>{' '}
            AND{' '}
            <button onClick={onShowPrivacy} className="text-teal-400 hover:text-teal-300 transition-colors">
              DATA POLICY
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;