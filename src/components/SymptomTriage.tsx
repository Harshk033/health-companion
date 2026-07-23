import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  Check,
  Stethoscope,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  Bot,
  User,
  ShieldAlert,
  Info,
  Clock,
  Mic,
} from 'lucide-react';
import { ChatSession, ChatMessage, Vitals, Language } from '../types';
import { analyzeSymptoms } from '../utils/triageEngine';
import { t } from '../utils/i18n';
import { getChatSessions, saveChatSessions } from '../utils/storage';

interface SymptomTriageProps {
  language: Language;
  onOpenSpeech: () => void;
  speechText: string;
  onClearSpeech: () => void;
}

export const SymptomTriage: React.FC<SymptomTriageProps> = ({
  language,
  onOpenSpeech,
  speechText,
  onClearSpeech,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [showVitals, setShowVitals] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // Vitals State
  const [vitals, setVitals] = useState<Vitals>({
    temperature: undefined,
    systolic: undefined,
    diastolic: undefined,
    heartRate: undefined,
    oxygenSat: undefined,
    bloodSugar: undefined,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions from LocalStorage on mount
  useEffect(() => {
    const loaded = getChatSessions();
    if (loaded.length === 0) {
      // Create default welcome session
      const newSession: ChatSession = {
        id: 'session-' + Date.now(),
        title: 'Initial Health Consultation',
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-welcome',
            sender: 'ai',
            text: 'Hello! I am your offline AI Symptom Triage Assistant. Describe any symptoms you are experiencing (e.g., headache, fever, cough, chest pressure) and optionally enter your vital signs. I will analyze your input using clinical rules and red-flag protocols.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
      saveChatSessions([newSession]);
    } else {
      setSessions(loaded);
      setCurrentSessionId(loaded[0].id);
    }
  }, []);

  // Sync speech recognition text into input query
  useEffect(() => {
    if (speechText) {
      setInputQuery((prev) => (prev ? `${prev} ${speechText}` : speechText));
      onClearSpeech();
    }
  }, [speechText, onClearSpeech]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isTyping]);

  const activeSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const handleStartNewChat = () => {
    const newSess: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Symptom Consultation',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-welcome-' + Date.now(),
          sender: 'ai',
          text: 'New consultation started. Please describe your symptoms or provide vitals.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    const updated = [newSess, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSess.id);
    saveChatSessions(updated);
  };

  const handleSendMessage = () => {
    if (!inputQuery.trim() && !vitals.temperature && !vitals.bloodSugar) return;

    const userText = inputQuery.trim() || 'Vitals Submitted for Analysis';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp,
      vitals: { ...vitals },
    };

    // Update session with user message
    const updatedSessionsWithUser = sessions.map((s) => {
      if (s.id === currentSessionId) {
        const title = s.messages.length <= 1 ? (userText.slice(0, 30) + '...') : s.title;
        return {
          ...s,
          title,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, userMsg],
        };
      }
      return s;
    });

    setSessions(updatedSessionsWithUser);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI clinical triage calculation delay
    setTimeout(() => {
      const triageResult = analyzeSymptoms({ query: userText, vitals });

      const aiMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: triageResult.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageResult,
      };

      const finalSessions = updatedSessionsWithUser.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, aiMsg],
          };
        }
        return s;
      });

      setSessions(finalSessions);
      saveChatSessions(finalSessions);
      setIsTyping(false);

      // Reset vitals input after analysis
      setVitals({
        temperature: undefined,
        systolic: undefined,
        diastolic: undefined,
        heartRate: undefined,
        oxygenSat: undefined,
        bloodSugar: undefined,
      });
      setShowVitals(false);
    }, 1200);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveChatSessions(updated);
    if (currentSessionId === id && updated.length > 0) {
      setCurrentSessionId(updated[0].id);
    }
  };

  const handleRenameSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sess = sessions.find((s) => s.id === id);
    if (sess) {
      setEditingSessionId(id);
      setEditingTitle(sess.title);
    }
  };

  const handleSaveTitle = (id: string) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: editingTitle || s.title } : s));
    setSessions(updated);
    saveChatSessions(updated);
    setEditingSessionId(null);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[680px]">
      {/* Sidebar: Chat History List */}
      <div className="lg:col-span-1 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-5 flex flex-col justify-between h-full space-y-4 shadow-lg text-slate-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Past Consultations</span>
            </h3>
            <button
              onClick={handleStartNewChat}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t(language, 'triage.newChat')}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, 'triage.searchChat')}
              className="w-full bg-white/70 border border-white/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
            />
          </div>

          {/* Sessions List */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
            {filteredSessions.map((s) => {
              const isSelected = s.id === currentSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setCurrentSessionId(s.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white/80 backdrop-blur-md border-white/90 text-teal-900 font-bold shadow-xs'
                      : 'bg-white/30 border-white/40 hover:bg-white/60 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex-1 truncate mr-2">
                    {editingSessionId === s.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveTitle(s.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(s.id)}
                        autoFocus
                        className="w-full bg-white border border-teal-600 rounded px-1.5 py-0.5 text-xs text-slate-900 font-bold"
                      />
                    ) : (
                      <>
                        <div className="truncate font-bold">{s.title}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{s.createdAt}</div>
                      </>
                    )}
                  </div>

                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => handleRenameSession(s.id, e)}
                      className="p-1 hover:text-teal-700 text-slate-400"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-1 hover:text-rose-600 text-slate-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clear All History Button */}
        {sessions.length > 0 && (
          <button
            onClick={() => {
              setSessions([]);
              saveChatSessions([]);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t(language, 'triage.clearAllChats')}</span>
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl flex flex-col justify-between h-[640px] shadow-lg overflow-hidden">
        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          {activeSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm space-y-3 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none font-medium'
                    : 'bg-white/80 backdrop-blur-md border border-white/90 text-slate-800 rounded-tl-none font-medium'
                }`}
              >
                {/* User Vitals Summary Badge */}
                {msg.vitals && (
                  <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-200/80">
                    {msg.vitals.temperature && <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-700">Temp: {msg.vitals.temperature}°F</span>}
                    {msg.vitals.systolic && <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-700">BP: {msg.vitals.systolic}/{msg.vitals.diastolic}</span>}
                    {msg.vitals.oxygenSat && <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-700">SpO2: {msg.vitals.oxygenSat}%</span>}
                    {msg.vitals.bloodSugar && <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-700">Sugar: {msg.vitals.bloodSugar} mg/dL</span>}
                  </div>
                )}

                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Structured Triage Outcome Card */}
                {msg.triageResult && (
                  <div className="mt-3 p-4 rounded-2xl bg-white/90 border border-white shadow-xs space-y-3 text-slate-800">
                    {/* Triage Level Banner */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-extrabold text-sm text-slate-900">{msg.triageResult.title}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                        {msg.triageResult.confidence}% {t(language, 'triage.confidence')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">{msg.triageResult.explanation}</p>

                    {/* Red Flags Alert List */}
                    {msg.triageResult.redFlags.length > 0 && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5 text-rose-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Red Flags & Critical Alerts</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-800">
                          {msg.triageResult.redFlags.map((rf, idx) => (
                            <li key={idx}>{rf}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Action Steps */}
                    <div className="space-y-1.5">
                      <div className="font-extrabold text-xs text-teal-900">Recommended Clinical Action Steps:</div>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 font-medium">
                        {msg.triageResult.actionSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Medical Disclaimer */}
                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 italic flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span>{msg.triageResult.disclaimer}</span>
                    </div>
                  </div>
                )}

                {/* Message Footer: Timestamp & Copy Button */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className="hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white/80 border border-white/90 rounded-2xl px-4 py-2 text-xs text-teal-800 font-bold animate-pulse shadow-2xs">
                {t(language, 'triage.typing')}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Controls Bar */}
        <div className="p-3 bg-white/50 backdrop-blur-md border-t border-white/60 space-y-3">
          {/* Optional Vitals Input Panel Toggle */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setShowVitals(!showVitals)}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>{t(language, 'triage.vitalsToggle')}</span>
              {showVitals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] text-slate-500 font-bold">Offline Rules-Based AI</span>
          </div>

          {/* Collapsible Vitals Input Fields */}
          {showVitals && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-white/70 border border-white/80 rounded-2xl text-xs shadow-2xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={vitals.temperature || ''}
                  onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-800 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">BP (Sys/Dia)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="120"
                    value={vitals.systolic || ''}
                    onChange={(e) => setVitals({ ...vitals, systolic: parseInt(e.target.value) || undefined })}
                    className="w-1/2 bg-white border border-slate-200 rounded-xl px-1 py-1 text-slate-800 text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="80"
                    value={vitals.diastolic || ''}
                    onChange={(e) => setVitals({ ...vitals, diastolic: parseInt(e.target.value) || undefined })}
                    className="w-1/2 bg-white border border-slate-200 rounded-xl px-1 py-1 text-slate-800 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={vitals.heartRate || ''}
                  onChange={(e) => setVitals({ ...vitals, heartRate: parseInt(e.target.value) || undefined })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-800 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Oxygen SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={vitals.oxygenSat || ''}
                  onChange={(e) => setVitals({ ...vitals, oxygenSat: parseInt(e.target.value) || undefined })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-800 text-xs font-bold"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Sugar (mg/dL)</label>
                <input
                  type="number"
                  placeholder="110"
                  value={vitals.bloodSugar || ''}
                  onChange={(e) => setVitals({ ...vitals, bloodSugar: parseInt(e.target.value) || undefined })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-800 text-xs font-bold"
                />
              </div>
            </div>
          )}

          {/* Message Text Input & Send Button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t(language, 'triage.typePlaceholder')}
              className="flex-1 bg-white/80 border border-white/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
              id="triage-chat-input"
            />
            <button
              onClick={onOpenSpeech}
              className="p-2.5 rounded-xl bg-white/60 text-teal-800 border border-white/80 hover:bg-white transition-colors cursor-pointer shadow-2xs"
              title="Voice Microphone Speech Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputQuery.trim() && !vitals.temperature && !vitals.bloodSugar}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              id="triage-send-btn"
            >
              <span>{t(language, 'triage.analyzeBtn')}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
