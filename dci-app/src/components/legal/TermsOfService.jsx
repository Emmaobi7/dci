import React from 'react';
import { Logo } from '../index';
import { FaArrowLeft, FaGavel, FaUserCheck, FaExclamationTriangle, FaHandshake } from 'react-icons/fa';

const TermsOfService = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-900/10 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-cyan-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzMzMzMiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMCA0MGwyMC0yMCAwIDIwLTIwIDB6TTAgMGwyMCAyMCAwLTIwLTIwIDB6TTQwIDBsLTIwIDIwIDAgLTIwIDIwIDB6TTQwIDQwbC0yMC0yMCAwIDIwIDIwIDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors group"
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
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaGavel className="text-blue-400 text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-4 tracking-tight">
              SERVICE AGREEMENT
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-wider">
              LEGAL FRAMEWORK • EFFECTIVE: 2025.01.07
            </p>
          </div>

          {/* Content */}
          <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-8 space-y-8">
            
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaUserCheck className="text-blue-400" />
                <h2 className="text-xl font-bold text-white font-mono tracking-wider">ACCEPTANCE OF TERMS</h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  By accessing DCIAFRICA's digital platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                  This agreement establishes a legal relationship between you and Digital Connect Institute Africa.
                </p>
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 font-mono text-xs tracking-wider">
                    ⚠ IMPORTANT: If you disagree with any terms, discontinue use immediately.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaHandshake className="text-blue-400" />
                <h2 className="text-xl font-bold text-white font-mono tracking-wider">USER OBLIGATIONS</h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  As a member of the DCIAFRICA community, you agree to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-cyan-400 font-mono text-xs tracking-wider">CONDUCT REQUIREMENTS:</h4>
                    <ul className="space-y-1 text-gray-400 font-mono text-xs">
                      <li>• Provide accurate registration information</li>
                      <li>• Maintain account security and confidentiality</li>
                      <li>• Respect intellectual property rights</li>
                      <li>• Follow community guidelines and ethics</li>
                      <li>• Report security vulnerabilities responsibly</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-cyan-400 font-mono text-xs tracking-wider">PROHIBITED ACTIVITIES:</h4>
                    <ul className="space-y-1 text-gray-400 font-mono text-xs">
                      <li>• Unauthorized access or hacking attempts</li>
                      <li>• Sharing copyrighted materials illegally</li>
                      <li>• Harassment or discriminatory behavior</li>
                      <li>• Commercial exploitation without permission</li>
                      <li>• Creating fake accounts or impersonation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <FaExclamationTriangle className="text-yellow-400" />
                <h2 className="text-xl font-bold text-white font-mono tracking-wider">SERVICE AVAILABILITY</h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  DCIAFRICA provides services on an "as-is" basis with the following considerations:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400 mt-1">⚡</span>
                    <div>
                      <p className="text-gray-300 font-mono text-xs font-bold">SERVICE UPTIME</p>
                      <p className="text-gray-400 font-mono text-xs">
                        We strive for 99.9% uptime but cannot guarantee uninterrupted service due to maintenance, updates, or unforeseen circumstances.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-400 mt-1">🔄</span>
                    <div>
                      <p className="text-gray-300 font-mono text-xs font-bold">CONTENT UPDATES</p>
                      <p className="text-gray-400 font-mono text-xs">
                        Course content, features, and services may be modified, updated, or discontinued at any time to improve user experience.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 mt-1">🎓</span>
                    <div>
                      <p className="text-gray-300 font-mono text-xs font-bold">FREE ACCESS COMMITMENT</p>
                      <p className="text-gray-400 font-mono text-xs">
                        Core educational content remains free for African youth, aligned with our mission of digital empowerment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white font-mono tracking-wider">INTELLECTUAL PROPERTY</h2>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-blue-400 font-mono text-sm font-bold mb-2">DCIAFRICA CONTENT</h4>
                    <p className="text-gray-400 font-mono text-xs leading-relaxed">
                      All platform content, including courses, materials, logos, and software, remains the exclusive property of DCIAFRICA and its partners. 
                      Users receive a limited, non-transferable license for personal educational use only.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-mono text-sm font-bold mb-2">USER CONTRIBUTIONS</h4>
                    <p className="text-gray-400 font-mono text-xs leading-relaxed">
                      By submitting content (projects, comments, feedback), you grant DCIAFRICA a worldwide, royalty-free license to use, 
                      display, and distribute your contributions for educational and promotional purposes.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white font-mono tracking-wider">LIABILITY LIMITATIONS</h2>
              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-lg p-6">
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                  DCIAFRICA operates as a non-profit educational initiative. Our liability is limited as follows:
                </p>
                <ul className="space-y-2 text-gray-400 font-mono text-xs">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>No guarantees of employment or income resulting from course completion</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Limited liability for data loss, service interruptions, or technical issues</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>No responsibility for third-party content, links, or services</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Maximum liability limited to the value of services provided (free)</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-bold text-white font-mono tracking-wider mb-4">LEGAL CONTACT</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 font-mono text-sm">
                <div>
                  <p className="mb-2">For legal matters or disputes:</p>
                  <p className="text-blue-400">legal@dciafrica.org</p>
                </div>
                <div>
                  <p className="mb-2">Terms modifications will be communicated via:</p>
                  <p className="text-blue-400">Platform notifications and email</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsOfService;
