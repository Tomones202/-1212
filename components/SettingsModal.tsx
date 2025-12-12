

import React, { useState, useEffect } from 'react';
import { X, Save, Key, ExternalLink, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { verifyGeminiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [polloKey, setPolloKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  
  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const storedPollo = localStorage.getItem('pollo_api_key');
    const storedGemini = localStorage.getItem('gemini_api_key');
    if (storedPollo) setPolloKey(storedPollo);
    if (storedGemini) {
        setGeminiKey(storedGemini);
        setGeminiStatus('success'); // Assume valid if stored previously, or re-verify quietly
    }
  }, [isOpen]);

  const handleVerifyAndSave = async () => {
    let isValidGemini = true;

    // 1. Verify Gemini Key if present
    if (geminiKey.trim()) {
        setIsVerifying(true);
        setGeminiStatus('idle');
        isValidGemini = await verifyGeminiKey(geminiKey.trim());
        setIsVerifying(false);

        if (isValidGemini) {
            setGeminiStatus('success');
            localStorage.setItem('gemini_api_key', geminiKey.trim());
        } else {
            setGeminiStatus('error');
            return; // Don't close or save others if this fails
        }
    } else {
        // If cleared, remove it
        localStorage.removeItem('gemini_api_key');
        setGeminiStatus('idle');
    }

    // 2. Save Pollo Key (No verification implemented for this demo)
    if (polloKey.trim()) {
        localStorage.setItem('pollo_api_key', polloKey.trim());
    } else {
        localStorage.removeItem('pollo_api_key');
    }

    setIsSaved(true);
    setTimeout(() => { 
        setIsSaved(false); 
        onClose();
    }, 1000);
  };

  const handleClearKeys = () => {
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('pollo_api_key');
      setGeminiKey('');
      setPolloKey('');
      setGeminiStatus('idle');
      setIsCleared(true);
      setTimeout(() => setIsCleared(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-[480px] bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Key size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">API 配置 (Setup)</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8 relative">
          
          {/* Gemini Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-wider">Google Gemini API Key</label>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20 hover:bg-cyan-500/20">
                    <span>获取 Key</span>
                    <ExternalLink size={10} />
                </a>
            </div>
            
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-mono text-xs">AI-</span>
                </div>
                <input 
                    type="password" 
                    autoComplete="off"
                    className={`
                        w-full bg-black/30 border rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-mono
                        ${geminiStatus === 'error' ? 'border-red-500/50 focus:border-red-500' : geminiStatus === 'success' ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-cyan-500/50'}
                    `}
                    placeholder="粘贴您的 Gemini API Key..."
                    value={geminiKey}
                    onChange={(e) => { setGeminiKey(e.target.value); setGeminiStatus('idle'); }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {isVerifying ? <Loader2 size={14} className="animate-spin text-cyan-500" /> : 
                     geminiStatus === 'success' ? <CheckCircle size={14} className="text-green-500" /> :
                     geminiStatus === 'error' ? <AlertCircle size={14} className="text-red-500" /> : null
                    }
                </div>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                <p>🔑 您的 Key 将仅存储在本地浏览器中。</p>
                {geminiStatus === 'error' && <p className="text-red-400 mt-1 font-bold">验证失败: 请检查 Key 是否正确或已过期。</p>}
                {!geminiKey && <p className="text-cyan-400/70 mt-1">请输入 Key 以激活 AI 功能。</p>}
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Pollo Section */}
          <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pollo.ai API Key (Optional)</label>
                <a href="https://pollo.ai/dashboard/api-keys" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
                    <span>获取 Key</span>
                    <ExternalLink size={10} />
                </a>
            </div>
            
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-mono text-xs">key-</span>
                </div>
                <input 
                    type="password" 
                    autoComplete="off"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                    placeholder="粘贴您的 Pollo API Key..."
                    value={polloKey}
                    onChange={(e) => setPolloKey(e.target.value)}
                />
            </div>
            <p className="text-[10px] text-slate-500">
                用于激活 <strong>Wan 2.1</strong> 视频模型。如果不填写，部分功能不可用。
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-[#121214] flex justify-between items-center">
            <button 
                onClick={handleClearKeys}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                title="清除本地存储的所有 Key"
            >
                {isCleared ? <CheckCircle size={12}/> : <LogOut size={12} />}
                {isCleared ? '已清除' : '清除 (Log out)'}
            </button>

            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    取消
                </button>
                <button 
                    onClick={handleVerifyAndSave}
                    disabled={isVerifying || !geminiKey.trim()}
                    className={`
                        px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg
                        ${isSaved 
                            ? 'bg-green-500 text-white' 
                            : !geminiKey.trim()
                                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 hover:shadow-cyan-500/25'}
                    `}
                >
                    {isVerifying && <Loader2 size={12} className="animate-spin" />}
                    {isSaved ? '已保存!' : isVerifying ? '验证中...' : '验证并保存'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};