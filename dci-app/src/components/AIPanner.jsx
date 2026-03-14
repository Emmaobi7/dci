import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { Button, Logo, Input, Card } from './index';
import { 
  FaMagic, FaRobot, FaCalendarAlt, FaCheckCircle, 
  FaClock, FaBook, FaChevronRight, FaPlay, 
  FaPaperPlane, FaSpinner, FaHistory, FaCheck,
  FaQuestionCircle, FaFileAlt, FaExternalLinkAlt, FaUserCircle
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const AIPanner = () => {
  const { user } = useAuth();
  const { myCourses, createCourseStructure } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: "Hello! I'm your AI Curriculum Sidekick. Select a course and tell me your vision. I'll help you map out modules, lessons, and live sessions perfectly." }
  ]);
  const [planDraft, setPlanDraft] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isGenerating]);

  // Clear chat when component unmounts for this session
  useEffect(() => {
    return () => {
      setChatHistory([
        { role: 'ai', content: "Hello! I'm your AI Curriculum Sidekick. Select a course and tell me your vision. I'll help you map out modules, lessons, and live sessions perfectly." }
      ]);
      setPlanDraft(null);
      setSelectedFile(null);
    };
  }, []);

  const selectedCourse = useMemo(() => 
    myCourses.find(c => c.id === selectedCourseId), 
    [myCourses, selectedCourseId]
  );

  const generatePlan = async () => {
    if (!selectedCourseId) {
      alert('Please select a course first.');
      return;
    }
    if (!prompt.trim() && !selectedFile) return;

    let fileData = null;
    if (selectedFile) {
      try {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve({
              base64Data: base64String,
              mimeType: selectedFile.type || 'text/plain'
            });
          };
          reader.onerror = error => reject(error);
        });
      } catch (err) {
        console.error("Error reading file:", err);
        alert("Could not process attached file.");
        return;
      }
    }

    const userMessage = { 
      role: 'user', 
      content: prompt + (selectedFile ? `\n[Attached File: ${selectedFile.name}]` : '') 
    };
    setChatHistory(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert instructional designer. Help the instructor plan their course: "${selectedCourse.title}".
          User Request: ${prompt}
          ${selectedFile ? 'The user has attached a document for you to reference. Please read the attached document carefully and use it as the primary basis for your curriculum plan if relevant.' : ''}
          Existing Draft (if any): ${JSON.stringify(planDraft)}


          Instructions:
          1. Propose a structured curriculum with modules and lessons.
          2. Each lesson MUST have:
             - 'title': Descriptive title.
             - 'type': One of 'video', 'text', 'quiz', 'assignment'.
             - 'duration': Estimated time.
              - 'content': 
                 - If type is 'video', provide a YouTube search query link EXACTLY like this: "https://www.youtube.com/results?search_query=[topic+keywords]". DO NOT guess watch links (watch?v=) because they often hallucinate unavailable videos.
                 - If type is 'text', 'quiz', or 'assignment', provide a link to a relevant external resource (e.g., a documentation site, a Google Form placeholder, or a GitHub repo/file template). Do NOT leave as plain text; it must be a URL.
          3. Propose at least 1 live session per week.
          4. Return a descriptive response for the chat AND a JSON object for the structure.
          
          OUTPUT FORMAT:
          [Descriptive text for the instructor]
          ---JSON---
          {
            "modules": [
              {
                "title": "Module Title",
                "description": "Short desc",
                "lessons": [
                  { "title": "Lesson 1", "type": "video", "duration": "10 mins", "content": "https://www.youtube.com/results?search_query=python+basics+tutorial" }
                ]
              }
            ],
            "sessions": [
              { "title": "Live Q&A", "description": "Weekly recap", "duration": "1 hour", "scheduledAt": "2026-03-20T10:00:00Z" }
            ]
          }`,
          file: fileData
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // Simple parser for the twin-output format
      const parts = result.text.split('---JSON---');
      const aiText = parts[0].trim();
      const jsonStr = parts[1]?.trim();

      setChatHistory(prev => [...prev, { role: 'ai', content: aiText }]);
      
      if (jsonStr) {
        try {
          const parsed = JSON.parse(jsonStr);
          setPlanDraft(parsed);
        } catch (e) {
          console.error("Failed to parse AI JSON", e);
        }
      }
    } catch (err) {
      console.error('Generation Error:', err);
      setChatHistory(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error while planning. Please try again." }]);
    } finally {
      setIsGenerating(false);
      setSelectedFile(null); // Clear file after sending
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit file size to ~10MB to be safe
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please select a file smaller than 10MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const applyPlan = async () => {
    if (!planDraft || !selectedCourseId) return;
    
    setIsApplying(true);
    try {
      await createCourseStructure(selectedCourseId, planDraft);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Successfully applied the plan! You can now see the new structure in Course Management." }]);
      setPlanDraft(null); // Clear draft after apply
    } catch (err) {
      alert("Failed to apply plan: " + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] gap-6 animate-fade-in-up">
      
      {/* LEFT: AI SIDEKICK CHAT */}
      <div className="w-full lg:w-1/3 flex flex-col bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-teal-500/10 to-blue-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <FaRobot className="text-gray-900 text-xl" />
            </div>
            <div>
              <h3 className="text-white font-mono font-bold tracking-wider">AI SIDEKICK</h3>
              <p className="text-[10px] text-teal-400 font-mono">READY_TO_PLAN</p>
            </div>
          </div>
          <FaHistory className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-1">
                    <FaRobot className="text-teal-400 text-sm" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className={`max-w-[85%] p-4 rounded-3xl shadow-lg relative ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-tr-sm ml-4 border border-teal-400/30' 
                    : 'bg-gray-800 border border-gray-700/50 text-gray-200 rounded-tl-sm mr-4 shadow-black/50'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none 
                      prose-p:leading-relaxed prose-p:my-2 
                      prose-headings:text-teal-400 prose-headings:font-mono prose-headings:mb-3 
                      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                      prose-li:my-1 prose-ul:my-2 prose-ol:my-2
                      prose-strong:text-white prose-strong:font-bold
                    ">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FaUserCircle className="text-blue-400 text-lg" />
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Thinking / Loading Indicator */}
            {isGenerating && (
              <motion.div 
                key="typing-indicator"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                  <FaRobot className="text-teal-400 text-sm animate-pulse" />
                </div>
                <div className="max-w-[85%] px-5 py-4 rounded-3xl bg-gray-800 border border-teal-500/30 rounded-tl-sm shadow-lg flex items-center gap-1.5">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-teal-500"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-teal-500/80"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-teal-500/60"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900/40 border-t border-gray-700/50">
          <div className="mb-4">
            <select 
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white font-mono text-xs focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">SELECT A COURSE...</option>
              {myCourses.map(c => (
                <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          {/* File Attachment Display */}
          {selectedFile && (
            <div className="mb-3 flex items-center justify-between bg-teal-500/10 border border-teal-500/30 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <FaFileAlt className="text-teal-400 shrink-0" />
                <span className="text-teal-400 font-mono text-xs truncate">{selectedFile.name}</span>
              </div>
              <button 
                onClick={removeFile}
                className="text-gray-400 hover:text-red-400 transition-colors p-1"
                title="Remove attachment"
              >
                <FaCheckCircle className="rotate-45" /> {/* Using check rotated as X for quick workaround */}
              </button>
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-100 transition duration-500"></div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.txt,.doc,.docx,.csv"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-3 top-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-gray-800 transition-colors z-10"
              title="Attach Document"
            >
              <FaFileAlt />
            </button>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), generatePlan())}
              placeholder="Describe your plan or attach a syllabus..."
              className="relative w-full bg-gray-900 border border-gray-700 rounded-2xl pl-12 pr-14 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none h-24 font-mono transition-all"
            />
            <button 
              onClick={generatePlan}
              disabled={isGenerating || (!selectedCourseId) || (!prompt.trim() && !selectedFile)}
              className="absolute bottom-3 right-3 w-10 h-10 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 text-gray-900 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-teal-500/20"
            >
              {isGenerating ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: INTERACTIVE TIMELINE / PREVIEW */}
      <div className="flex-1 flex flex-col bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between bg-gray-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-mono font-bold tracking-wider">CURRICULUM PLAN</h3>
              <p className="text-[10px] text-blue-400 font-mono">
                {planDraft ? 'DRAFT_GENERATED' : 'WAITING_FOR_INPUT'}
              </p>
            </div>
          </div>
          
          {planDraft && (
            <Button 
              onClick={applyPlan}
              disabled={isApplying}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/20"
            >
              {isApplying ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />}
              BUILD THIS COURSE
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {!planDraft ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-6">
                <FaMagic className="text-4xl text-gray-500" />
              </div>
              <p className="text-gray-500 font-mono max-w-xs">DESCRIBE YOUR VISION IN THE CHAT TO GENERATE A VISUAL TIMELINE</p>
            </div>
          ) : (
            <div className="space-y-8 relative">
              {/* Vertical Connection Line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-teal-500/50 via-blue-500/50 to-transparent"></div>

              {planDraft.modules.map((module, mIdx) => (
                <div key={mIdx} className="relative pl-16">
                  {/* Module Dot */}
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-teal-500 border-4 border-gray-800 shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
                  
                  <div className="bg-gray-800/60 rounded-3xl p-6 border border-gray-700/50 hover:border-teal-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-teal-400 font-mono font-bold text-lg leading-tight uppercase mb-1">
                          MODULE {mIdx + 1}: {module.title}
                        </h4>
                        <p className="text-gray-400 font-mono text-sm">{module.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {module.lessons.map((lesson, lIdx) => {
                        const getLessonIcon = () => {
                          if (lesson.type === 'video') return <FaPlay className="text-teal-500 text-xs" />;
                          return <FaExternalLinkAlt className="text-blue-400 text-xs" />;
                        };
                        const getTypeColor = () => {
                          switch (lesson.type) {
                            case 'video': return 'text-teal-500';
                            case 'quiz': return 'text-yellow-400';
                            case 'assignment': return 'text-red-400';
                            default: return 'text-blue-400';
                          }
                        };

                        return (
                          <div key={lIdx} className="bg-gray-900/50 rounded-2xl p-4 flex items-center justify-between border border-gray-700/30 hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center">
                                {getLessonIcon()}
                              </div>
                              <div>
                                <p className="text-white font-mono text-sm leading-tight">{lesson.title}</p>
                                <div className="flex flex-col gap-1 mt-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 ${getTypeColor()}`}>
                                      {lesson.type}
                                    </span>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase italic">{lesson.duration}</p>
                                  </div>
                                  {lesson.content && (
                                    <p className="text-[9px] text-gray-600 font-mono truncate max-w-[150px] italic">
                                      {lesson.content.startsWith('http') ? '🔗 ' : '📝 '} {lesson.content}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <FaCheck className="text-[10px] text-gray-700" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Live Sessions Section */}
              {planDraft.sessions && planDraft.sessions.length > 0 && (
                <div className="mt-12 pl-16 relative">
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-gray-800 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                  <h4 className="text-blue-400 font-mono font-bold mb-4 tracking-[0.2em]">SCHEDULED SESSIONS</h4>
                  <div className="grid gap-4">
                    {planDraft.sessions.map((session, sIdx) => (
                      <div key={sIdx} className="bg-blue-600/5 border border-blue-600/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <FaCalendarAlt className="text-white text-xl" />
                          </div>
                          <div>
                            <h5 className="text-white font-mono font-bold">{session.title}</h5>
                            <p className="text-gray-400 font-mono text-xs">{session.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-blue-400 font-mono text-sm font-bold">{new Date(session.scheduledAt).toLocaleDateString()}</p>
                            <p className="text-gray-500 font-mono text-xs">{new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration}</p>
                          </div>
                          <div className="px-3 py-1 bg-blue-600/20 rounded-full border border-blue-600/30 text-[10px] text-blue-400 font-mono font-bold">
                            SESSION
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPanner;
