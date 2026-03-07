import React, { useState, useEffect, useRef } from 'react';
import {
    FaMagic, FaCode, FaEye, FaExclamationTriangle,
    FaMobileAlt, FaTabletAlt, FaDesktop, FaExpand, FaCompress,
    FaTerminal, FaSync, FaRocket, FaGithub, FaCloudUploadAlt, FaCheckCircle
} from 'react-icons/fa';
import { Button } from './index';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';

// Backend Configuration
const API_URL = import.meta.env.VITE_API_URL;

const AIAssistant = () => {
    const [prompt, setPrompt] = useState(() => localStorage.getItem('ai_studio_prompt') || '');
    const [code, setCode] = useState(() => localStorage.getItem('ai_studio_code') || '<!-- Your generated code will appear here -->\n<div style="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#0f172a] text-slate-200 font-sans">\n  <div style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); padding: 3rem; border-radius: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">\n    <h1 style="font-size: 3rem; font-weight: 800; background: linear-gradient(to right, #2dd4bf, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1.5rem;">AI Design Studio</h1>\n    <p style="font-size: 1.25rem; color: #94a3b8; max-width: 32rem; margin: 0 auto 2rem;">Describe your vision and watch the AI bring it to life instantly with 100% production-ready code.</p>\n    <div style="height: 4px; width: 64px; background: #2dd4bf; margin: 0 auto; border-radius: 2px;"></div>\n  </div>\n</div>');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('preview'); // 'code' or 'preview'
    const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop', 'tablet', 'mobile'
    const [isFullscreen, setIsFullscreen] = useState(false);

    // User Profile context for persisting keys
    const { userProfile, updateUserProfile } = useUser();
    const { linkGithub } = useAuth();

    // Deployment States
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployStep, setDeployStep] = useState(''); // 'github', 'render', 'success'
    const [deployData, setDeployData] = useState({ repoUrl: '', liveUrl: '' });
    const [showDeployConfig, setShowDeployConfig] = useState(false);
    const [config, setConfig] = useState({
        githubToken: localStorage.getItem('ai_studio_github_token') || '',
        repoName: localStorage.getItem('ai_studio_repoName') || ''
    });

    // Persistence Sync
    useEffect(() => {
        localStorage.setItem('ai_studio_prompt', prompt);
    }, [prompt]);

    useEffect(() => {
        localStorage.setItem('ai_studio_code', code);
    }, [code]);

    useEffect(() => {
        localStorage.setItem('ai_studio_repoName', config.repoName);
    }, [config.repoName]);

    // Sync githubToken whenever userProfile changes
    useEffect(() => {
        console.log('AIAssistant: Syncing githubToken from profile:', {
            profileToken: !!userProfile?.githubToken,
            currentConfigToken: !!config.githubToken
        });
        if (userProfile?.githubToken && userProfile.githubToken !== config.githubToken) {
            setConfig(prev => ({
                ...prev,
                githubToken: userProfile.githubToken,
            }));
        }
    }, [userProfile, config.githubToken]);

    const iframeRef = useRef(null);

    const generateCode = async () => {
        if (!prompt.trim()) return;

        // Clear previous generation from localStorage and state
        localStorage.removeItem('ai_studio_code');
        localStorage.removeItem('ai_studio_repoName');
        setCode('');
        setConfig(prev => ({ ...prev, repoName: '' }));

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Role: Expert Frontend Architect & UI Designer. 
Task: ${prompt}

Instructions:
- Return ONLY valid HTML with embedded CSS (in <style>) and JS (in <script>).
- Do NOT include any markdown, triple backticks, or explanations.
- The output must be a single, complete, professional, and responsive HTML document.
- Use high-end aesthetics: glassmorphism, smooth gradients, modern typography (Inter/Roboto), and subtle animations.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Ensure the body has a consistent background or resets that make it look like a standalone web app.`,
                    config: {
                        temperature: 0.8,
                        maxOutputTokens: 8192,
                    }
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to generate content');
            }

            let generatedHtml = result.text || '';
            generatedHtml = generatedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '');

            setCode(generatedHtml);
            setActiveTab('preview');
        } catch (err) {
            console.error('Generation Error:', err);
            setError(err.message || 'Failed to generate code');
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGithub = async () => {
        try {
            setError(null);
            setLoading(true);
            const { token } = await linkGithub();
            if (token) {
                console.log('AIAssistant: GitHub connected via OAuth. Syncing token...');
                setConfig(prev => ({ ...prev, githubToken: token }));
                localStorage.setItem('ai_studio_github_token', token);
                await updateUserProfile({ githubToken: token });
            }
        } catch (err) {
            console.error('AIAssistant: GitHub OAuth error:', err);
            setError(err.message || 'Failed to connect GitHub. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleShipToProd = async () => {
        console.log('Ship to Prod Initiated. Config:', {
            hasToken: !!config.githubToken,
            repoName: config.repoName
        });

        if (!config.githubToken || !config.repoName) {
            console.warn('Ship to Prod aborted: Missing token or repo name');
            setShowDeployConfig(true);
            return;
        }

        setIsDeploying(true);
        setDeployStep('github');
        setError(null);

        // Save credentials to profile if they changed
        try {
            if (config.githubToken !== userProfile?.githubToken || config.renderKey !== userProfile?.renderKey) {
                await updateUserProfile({
                    githubToken: config.githubToken,
                    renderKey: config.renderKey
                });
            }
        } catch (err) {
            console.error('Failed to save credentials:', err);
        }

        try {
            // 1. Create GitHub Repo and Push code
            const ghResponse = await fetch(`${API_URL}/api/github/create-and-ship`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: config.githubToken,
                    repoName: config.repoName,
                    description: `Vibe-coded project: ${prompt.substring(0, 50)}...`,
                    content: code
                })
            });

            const ghResult = await ghResponse.json();
            if (!ghResult.success) throw new Error(ghResult.error || 'GitHub Deployment Failed');

            setDeployData({
                repoUrl: ghResult.repoUrl,
                liveUrl: ghResult.pagesUrl
            });
            setDeployStep('success');
        } catch (err) {
            setError(err.message);
            setIsDeploying(false);
        }
    };

    const updatePreview = () => {
        if (iframeRef.current) {
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            iframeRef.current.src = url;
        }
    };

    useEffect(() => {
        updatePreview();
    }, [code]);

    const getPreviewWidth = () => {
        if (previewMode === 'mobile') return '375px';
        if (previewMode === 'tablet') return '768px';
        return '100%';
    };

    return (
        <>
            <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-10rem)] sm:rounded-3xl'} bg-[#0f172a] text-slate-200 overflow-hidden border border-white/5 shadow-2xl transition-all duration-500`}>
                {/* Main Header / Command Bar */}
                {!isFullscreen && (
                    <div className="px-3 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-5 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex flex-col gap-3">

                        {/* Row 1: Icon + Title + Tab switcher */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <FaMagic className="text-slate-900 text-sm sm:text-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm sm:text-lg font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2 truncate">
                                    AI Design Studio
                                    {config.githubToken && (
                                        <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold tracking-tighter shrink-0">
                                            <FaGithub className="text-[10px]" /> CONNECTED
                                        </span>
                                    )}
                                </h2>
                                <p className="hidden sm:block text-[10px] text-teal-400/70 font-mono tracking-widest uppercase">Powered by Gemini 3.0 Flash</p>
                            </div>

                            {/* Tab switcher — always visible, right-aligned */}
                            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-white/5 shrink-0">
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${activeTab === 'preview' ? 'bg-teal-500 text-slate-900 font-bold shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <FaEye className="inline sm:mr-2" /><span className="hidden sm:inline">PREVIEW</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('code')}
                                    className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <FaCode className="inline sm:mr-2" /><span className="hidden sm:inline">SOURCE</span>
                                </button>
                            </div>

                            {/* Ship button — icon-only on mobile */}
                            <button
                                onClick={handleShipToProd}
                                className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-900 rounded-xl font-bold font-mono text-xs transition-all shadow-lg shadow-teal-500/10 active:scale-95"
                            >
                                <FaRocket />
                                <span className="hidden sm:inline">SHIP_TO_PRODUCTION</span>
                            </button>
                        </div>

                        {/* Row 2: Prompt + Generate button */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch">
                            <div className="flex-1 relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/30 to-blue-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your interface..."
                                    className="relative w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm focus:outline-none focus:border-teal-500/50 transition-all resize-none h-16 sm:h-20 leading-relaxed placeholder:text-slate-600 font-sans"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) generateCode();
                                    }}
                                />
                                <div className="absolute right-4 bottom-3 text-slate-700 font-mono text-[10px] pointer-events-none hidden sm:block">
                                    CTRL + ENTER TO GENERATE
                                </div>
                            </div>
                            <button
                                onClick={generateCode}
                                disabled={loading || !prompt.trim()}
                                className="relative overflow-hidden group bg-gradient-to-r from-teal-500 to-blue-600 disabled:from-slate-700 disabled:to-slate-800 text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-teal-500/10"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {loading ? (
                                    <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                                        <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                                        <span className="font-mono text-sm">BUILDING...</span>
                                    </div>
                                ) : (
                                    <div className="relative flex items-center justify-center gap-2 sm:gap-3 font-mono text-sm">
                                        <FaMagic />
                                        <span>GENERATE</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 text-red-400 text-xs font-mono bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
                                <FaExclamationTriangle className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Workspace */}
                <div className="flex-1 flex overflow-hidden bg-[#020617] relative">
                    {/* Fullscreen floating toolbar */}
                    {isFullscreen && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl">
                                <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}><FaMobileAlt size={14} /></button>
                                <button onClick={() => setPreviewMode('tablet')} className={`p-2 rounded-lg transition-all ${previewMode === 'tablet' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}><FaTabletAlt size={14} /></button>
                                <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}><FaDesktop size={14} /></button>
                            </div>
                            <div className="h-6 w-px bg-white/10 mx-1"></div>
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all font-mono text-xs font-bold"
                            >
                                <FaCompress size={12} /> EXIT
                            </button>
                        </div>
                    )}

                    {/* Code panel */}
                    <div className={`${activeTab === 'code' ? 'flex' : 'hidden'} flex-1 flex flex-col border-r border-white/5`}>
                        <div className="bg-slate-900/50 px-4 sm:px-6 py-3 border-b border-white/5 flex justify-between items-center shrink-0">
                            <span className="text-[10px] font-mono font-bold text-teal-400 flex items-center gap-2 tracking-[0.2em] uppercase">
                                <FaTerminal className="text-xs" /> Source_Manifest.html
                            </span>
                            <button onClick={() => navigator.clipboard.writeText(code)} className="text-[10px] text-slate-500 hover:text-teal-400 font-mono transition-colors uppercase">COPY</button>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck="false" className="w-full h-full bg-[#0d1117] text-slate-300 font-mono text-xs sm:text-sm p-4 sm:p-8 focus:outline-none resize-none leading-relaxed" />
                        </div>
                    </div>

                    {/* Preview panel */}
                    <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} flex-1 flex flex-col bg-white/5`}>
                        {!isFullscreen && (
                            <div className="bg-slate-900/50 px-3 sm:px-6 py-2 border-b border-white/5 flex justify-between items-center min-h-[44px] shrink-0">
                                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
                                    <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}><FaMobileAlt size={12} /></button>
                                    <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded-md transition-all ${previewMode === 'tablet' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}><FaTabletAlt size={12} /></button>
                                    <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}><FaDesktop size={12} /></button>
                                </div>
                                <button onClick={() => setIsFullscreen(true)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><FaExpand size={14} /></button>
                            </div>
                        )}
                        <div className={`flex-1 flex items-center justify-center bg-slate-950 overflow-auto scrollbar-hide ${isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-8'}`}>
                            <div
                                className={`bg-white shadow-[0_0_100px_rgba(45,212,191,0.1)] overflow-hidden transition-all duration-500 h-full ${isFullscreen && previewMode === 'desktop' ? 'rounded-none' : 'rounded-xl'}`}
                                style={{ width: getPreviewWidth(), maxHeight: (previewMode === 'desktop' || isFullscreen) ? '100%' : '800px' }}
                            >
                                <iframe ref={iframeRef} title="AI Generated Content" className="w-full h-full border-none" sandbox="allow-scripts" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer status bar */}
                {!isFullscreen && (
                    <div className="bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-2.5 border-t border-white/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-teal-500'}`}></div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{loading ? 'Processing' : 'System_Ready'}</span>
                        </div>
                        <button onClick={updatePreview} className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                            <FaSync className={loading ? 'animate-spin' : ''} /> Sync
                        </button>
                    </div>
                )}
            </div>


            {/* MODALS - MOVED TO TOP LEVEL TO AVOID CLIPPING */}
            {isDeploying && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8">
                    <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative scale-100 animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-blue-500 animate-pulse w-full"></div>
                        <div className="text-center mb-8">
                            <FaRocket className="text-4xl text-teal-400 mx-auto mb-4 animate-bounce" />
                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Deploying to Production</h3>
                            <p className="text-slate-400 text-sm">Your vision is becoming reality...</p>
                        </div>
                        <div className="space-y-6">
                            <div className={`flex items-center gap-4 transition-all ${deployStep === 'github' ? 'opacity-100 scale-100' : 'opacity-40 grayscale scale-95'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deployStep === 'github' ? 'bg-teal-500 text-slate-900 animate-spin' : 'bg-slate-800 text-slate-500'}`}>
                                    <FaGithub />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-white">GitHub Orchestration</p>
                                    <p className="text-[10px] text-slate-500 font-mono text-xs uppercase tracking-tighter">CREATING_REPO & PUSHING_CODE</p>
                                </div>
                                {deployData.repoUrl && <FaCheckCircle className="text-teal-400" />}
                            </div>
                            <div className={`flex items-center gap-4 transition-all ${deployStep === 'render' ? 'opacity-100 scale-100' : 'opacity-40 grayscale scale-95'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deployStep === 'render' ? 'bg-blue-500 text-white animate-pulse text-lg' : 'bg-slate-800 text-slate-500'}`}>
                                    <FaCloudUploadAlt />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-white">GitHub Pages</p>
                                    <p className="text-[10px] text-slate-500 font-mono text-xs uppercase tracking-tighter">ENABLING_HOSTING & SSL_PROVISIONING</p>
                                </div>
                                {deployData.liveUrl && <FaCheckCircle className="text-blue-400" />}
                            </div>
                        </div>
                        {deployStep === 'success' && (
                            <div className="mt-10 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h4 className="text-teal-400 font-bold mb-4 flex items-center justify-center gap-2">
                                    <FaCheckCircle className="text-xl" /> PROJECT LIVE
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <a href={deployData.repoUrl} target="_blank" rel="noopener" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-center transition-all border border-white/5">
                                        <FaGithub className="mx-auto mb-2 text-lg" />
                                        <span className="text-[10px] font-bold block uppercase">View Repo</span>
                                    </a>
                                    <a href={deployData.liveUrl || deployData.repoUrl} target="_blank" rel="noopener" className="p-3 bg-teal-500/10 hover:bg-teal-500/20 rounded-xl text-center transition-all border border-teal-500/20">
                                        <FaEye className="mx-auto mb-2 text-lg text-teal-400" />
                                        <span className="text-[10px] font-bold block text-teal-400 uppercase">Live Site</span>
                                    </a>
                                </div>
                                <button onClick={() => { setIsDeploying(false); setDeployStep(''); }} className="w-full mt-6 py-3 text-slate-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-all">
                                    Return to Studio
                                </button>
                            </div>
                        )}
                        {error && (
                            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-red-400 text-xs font-mono mb-4 text-center">{error}</p>
                                <button onClick={() => setIsDeploying(false)} className="w-full py-2 bg-red-500 text-white rounded-lg text-xs font-bold font-mono">
                                    EXIT_DEPLOYMENT
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showDeployConfig && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto scale-100 animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                            <FaRocket className="text-teal-400" /> Deployment Setup
                        </h3>
                        <div className="space-y-5">
                            {/* GitHub Token Section */}
                            <div>
                                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">GitHub Connection</label>
                                {config.githubToken ? (
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                <FaGithub className="text-emerald-400 text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest mb-1">Status</p>
                                                <p className="text-xs font-bold text-emerald-400 font-mono lowercase">connected</p>
                                            </div>
                                        </div>
                                        <button onClick={handleConnectGithub} className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold transition-all uppercase tracking-wider border border-emerald-500/20">
                                            Switch
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={handleConnectGithub} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50 rounded-xl px-4 py-4 transition-all shadow-xl shadow-white/5 active:scale-[0.98]">
                                            <FaGithub className="text-xl" />
                                            <span className="font-bold">{loading ? 'Connecting...' : 'Connect GitHub Account'}</span>
                                        </button>
                                        {error && <p className="mt-2 text-red-400 text-[10px] font-mono">{error}</p>}
                                    </>
                                )}
                            </div>

                            {/* Project Name */}
                            <div>
                                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Project Name</label>
                                <input type="text" placeholder="my-awesome-site" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 text-slate-300 placeholder:text-slate-700 font-mono" value={config.repoName} onChange={(e) => setConfig({ ...config, repoName: e.target.value })} />
                            </div>
                            <p className="text-[10px] font-mono text-slate-600 italic">Deployment to GitHub Pages is automatic.</p>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowDeployConfig(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold text-slate-400 transition-all uppercase tracking-widest">
                                Cancel
                            </button>
                            <button onClick={() => { setShowDeployConfig(false); handleShipToProd(); }} disabled={!config.githubToken || !config.repoName || loading} className="flex-[1.5] py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl text-xs font-bold text-slate-900 transition-all shadow-xl shadow-teal-500/20 uppercase tracking-widest">
                                {loading ? 'Processing...' : 'Start Deployment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
