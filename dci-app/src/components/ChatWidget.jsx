import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FaCommentDots, FaTimes, FaRobot, 
  FaPaperPlane, FaSpinner, FaUserCircle,
  FaExpand, FaCompress
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: "Hi there! I'm your DCI Africa assistant. How can I help you today?" }
  ]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Small timeout to ensure the element is rendered and not blocked by animation frames
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [chatHistory, isOpen, isGenerating]);

  // Clear chat entirely on unmount to mimic transient requirement
  useEffect(() => {
    return () => {
      setChatHistory([{ role: 'ai', content: "Hi there! I'm your DCI Africa assistant. How can I help you today?" }]);
      setIsOpen(false);
      setIsFullscreen(false);
    };
  }, []);

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: prompt.trim() };
    const updatedHistory = [...chatHistory, userMessage];
    
    setChatHistory(updatedHistory);
    setPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedHistory })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to connect to AI');
      }

      setChatHistory(prev => [...prev, { role: 'ai', content: data.text }]);
    } catch (error) {
      console.error('Chat Widget Error:', error);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: "I'm having a little trouble connecting right now. Please try again in a moment!" 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Popover Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, originX: 1, originY: 1 }}
            animate={
              isFullscreen 
                ? { opacity: 1, y: 0, x: 0, scale: 1, width: '100vw', height: '100vh', borderRadius: 0 }
                : { opacity: 1, y: 0, x: 0, scale: 1, width: 380, height: 550, borderRadius: 24 }
            }
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed z-[100] bg-gray-900 border-gray-700 shadow-2xl flex flex-col overflow-hidden ${
              isFullscreen 
                ? 'inset-0 border-0' 
                : 'bottom-24 right-6 max-h-[80vh] border'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <FaRobot className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold font-mono tracking-wide leading-tight">PLATFORM AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-teal-100 text-[10px] font-mono uppercase">Online • Transient</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/30 text-white transition-colors"
                  title={isFullscreen ? "Minimize" : "Full Screen"}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    // Optional: reset fullscreen when closed so it opens normal next time
                    setTimeout(() => setIsFullscreen(false), 300);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                  title="Close chat"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide bg-gray-800/50 backdrop-blur-md">
              <AnimatePresence>
                {chatHistory.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-1">
                        <FaRobot className="text-teal-400 text-xs" />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-lg relative ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-tr-sm ml-4 border border-teal-400/30' 
                        : 'bg-gray-800 border border-gray-700/80 text-gray-200 rounded-tl-sm mr-4 shadow-black/50'
                    }`}>
                      {msg.role === 'user' ? (
                        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none 
                          prose-p:leading-relaxed prose-p:my-1 
                          prose-headings:text-teal-400 prose-headings:font-mono prose-headings:mb-2 prose-headings:mt-3
                          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                          prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1
                          prose-strong:text-white prose-strong:font-bold
                        ">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <FaUserCircle className="text-blue-400" />
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Animated Typing Indicator */}
                {isGenerating && (
                  <motion.div 
                    key="typing-indicator"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                      <FaRobot className="text-teal-400 text-xs animate-pulse" />
                    </div>
                    <div className="max-w-[85%] px-4 py-3.5 rounded-2xl bg-gray-800 border border-teal-500/30 rounded-tl-sm shadow-lg flex items-center gap-1.5">
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-teal-500" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-teal-500/80" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-teal-500/60" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 relative z-10">
              <div className="relative flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-2xl p-1 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/50 transition-all">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="w-full bg-transparent text-white font-mono text-sm placeholder-gray-500 resize-none outline-none px-3 py-2.5 max-h-32 min-h-[44px] overflow-y-auto"
                  rows={prompt.split('\n').length > 1 ? Math.min(prompt.split('\n').length, 4) : 1}
                />
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-10 h-10 shrink-0 flex items-center justify-center bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 rounded-xl transition-colors mb-0.5 mr-0.5"
                >
                  {isGenerating ? <FaSpinner className="animate-spin" /> : <FaPaperPlane className="ml-1" />}
                </button>
              </div>
              <div className="text-center mt-2 pb-1">
                <span className="text-[9px] text-gray-600 font-mono">DCI AI can make mistakes. Consider verifying important info.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-[100]"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 shadow-[0_0_30px_rgba(20,184,166,0.5)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_40px_rgba(20,184,166,0.7)] transition-all active:scale-95 group"
            >
              <FaCommentDots className="text-white text-2xl group-hover:animate-wiggle" />
              
              {/* Ping notification dot */}
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-gray-900 rounded-full animate-pulse"></span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
