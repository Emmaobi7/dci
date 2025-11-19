import React from 'react';
import { Logo } from '../index';
import { FaArrowLeft, FaShieldAlt, FaLock, FaEye, FaDatabase } from 'react-icons/fa';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-purple-900/10 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzMzMzMiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMCA0MGwyMC0yMCAwIDIwLTIwIDB6TTAgMGwyMCAyMCAwLTIwLTIwIDB6TTQwIDBsLTIwIDIwIDAgLTIwIDIwIDB6TTQwIDQwbC0yMC0yMCAwIDIwIDIwIDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-sm tracking-wider">RETURN</span>
            </button>
            <Logo size="sm" />
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShieldAlt className="text-purple-400 text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4 tracking-tight">
              DATA PROTECTION PROTOCOL
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-wider">
              CLASSIFIED: PRIVACY POLICY • LAST UPDATED: 2025.01.07
            </p>
          </div>

          {/* Content */}
          <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-8 space-y-8">
            
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaDatabase className="text-purple-400" />
                <h2 className="text-xl font-bold text-white font-mono tracking-wider">DATA COLLECTION</h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  DCIAFRICA collects and processes personal data necessary for providing digital skills training services. This includes:
                </p>
                <ul className="mt-4 space-y-2 text-gray-400 font-mono text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Account credentials (email, encrypted passwords)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Profile information (name, location, skills)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Learning progress and course completion data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Usage analytics and system logs</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaLock className="text-purple-400" />
                <h2 className="text-xl font-bold text-white font-mono tracking-wider">DATA SECURITY</h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  Your data is protected using military-grade encryption and security protocols:
                </p>
                <ul className="mt-4 space-y-2 text-gray-400 font-mono text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>End-to-end encryption for all data transmission</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Firebase Authentication with industry-standard security</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Regular security audits and vulnerability assessments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Secure cloud infrastructure with automated backups</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaEye className="text-purple-400" />
                <h2 className="text-xl font-bold text-white font-mono tracking-wider">DATA USAGE</h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  We use your data exclusively for:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-teal-400 font-mono text-xs tracking-wider">PRIMARY FUNCTIONS:</h4>
                    <ul className="space-y-1 text-gray-400 font-mono text-xs">
                      <li>• Course delivery and progress tracking</li>
                      <li>• Certification and skill verification</li>
                      <li>• Community features and networking</li>
                      <li>• Customer support and assistance</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-teal-400 font-mono text-xs tracking-wider">ENHANCEMENT:</h4>
                    <ul className="space-y-1 text-gray-400 font-mono text-xs">
                      <li>• Platform optimization and improvements</li>
                      <li>• Personalized learning recommendations</li>
                      <li>• Statistical analysis for better services</li>
                      <li>• Research for educational impact</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Rights Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white font-mono tracking-wider">YOUR RIGHTS</h2>
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  You have full control over your data with the following rights:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 font-mono text-xs">
                  <div>
                    <span className="text-purple-400">→</span> Access your data
                  </div>
                  <div>
                    <span className="text-purple-400">→</span> Request data deletion
                  </div>
                  <div>
                    <span className="text-purple-400">→</span> Update or correct information
                  </div>
                  <div>
                    <span className="text-purple-400">→</span> Download your data
                  </div>
                  <div>
                    <span className="text-purple-400">→</span> Opt-out of communications
                  </div>
                  <div>
                    <span className="text-purple-400">→</span> Data portability
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-bold text-white font-mono tracking-wider mb-4">CONTACT SECURITY TEAM</h2>
              <p className="text-gray-400 font-mono text-sm">
                For privacy concerns or data requests, contact:{' '}
                <span className="text-purple-400">privacy@dciafrica.org</span>
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
