import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SymptomTriage } from './components/SymptomTriage';
import { DiabetesTracker } from './components/DiabetesTracker';
import { SkinAnalyzer } from './components/SkinAnalyzer';
import { ClinicianReport } from './components/ClinicianReport';
import { HealthcareDirectory } from './components/HealthcareDirectory';
import { ReminderManager } from './components/ReminderManager';
import { PrivacyModal } from './components/PrivacyModal';
import { SpeechModal } from './components/SpeechModal';

import {
  PatientProfile,
  DiabetesLog,
  ChatSession,
  Reminder,
  UserSettings,
  Language,
} from './types';

import {
  getProfile,
  saveProfile,
  getSettings,
  saveSettings,
  getDiabetesLogs,
  getChatSessions,
  getReminders,
  saveReminders,
} from './utils/storage';

import { Bell, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showSpeechModal, setShowSpeechModal] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('');

  // Toast Notification State
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // App Data States
  const [profile, setProfile] = useState<PatientProfile>(() => getProfile());
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [diabetesLogs, setDiabetesLogs] = useState<DiabetesLog[]>(() => getDiabetesLogs());
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => getChatSessions());
  const [reminders, setReminders] = useState<Reminder[]>(() => getReminders());

  // Listen to network status for PWA offline indicator
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker for offline PWA functionality
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration skipped or error:', err);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update language when settings change
  useEffect(() => {
    if (settings.language) {
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    const updated = { ...settings, language: newLang };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setReminders(updated);
    saveReminders(updated);
  };

  const handleTriggerToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleSpeechTranscript = (text: string) => {
    setSpeechText(text);
    setActiveTab('triage');
  };

  return (
    <div className="min-h-screen bg-[#e0f7fa] bg-gradient-to-br from-teal-100 via-blue-50 to-cyan-100 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative overflow-x-hidden">
      {/* Frosted Ambient Glowing Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Alarm / Notification Toast Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-teal-300/60 text-slate-900 shadow-2xl flex items-start justify-between gap-3 animate-bounce">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
              <Bell className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="font-bold text-sm text-teal-900">{toast.title}</div>
              <div className="text-xs text-slate-600 mt-0.5">{toast.message}</div>
            </div>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onOpenSpeech={() => setShowSpeechModal(true)}
        isOffline={isOffline}
        isEncrypted={settings.encrypted}
      />

      {/* Tab Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        language={language}
      />

      {/* Main Module Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 z-10">
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            logs={diabetesLogs}
            reminders={reminders}
            language={language}
            onNavigate={(tab) => setActiveTab(tab)}
            onToggleReminder={handleToggleReminder}
          />
        )}

        {activeTab === 'triage' && (
          <SymptomTriage
            language={language}
            onOpenSpeech={() => setShowSpeechModal(true)}
            speechText={speechText}
            onClearSpeech={() => setSpeechText('')}
          />
        )}

        {activeTab === 'diabetes' && (
          <DiabetesTracker
            logs={diabetesLogs}
            onLogsChange={() => setDiabetesLogs(getDiabetesLogs())}
            language={language}
          />
        )}

        {activeTab === 'skin' && (
          <SkinAnalyzer language={language} />
        )}

        {activeTab === 'report' && (
          <ClinicianReport
            profile={profile}
            onProfileUpdate={(p) => setProfile(p)}
            logs={diabetesLogs}
            chats={chatSessions}
            language={language}
          />
        )}

        {activeTab === 'directory' && (
          <HealthcareDirectory language={language} />
        )}

        {activeTab === 'reminders' && (
          <ReminderManager
            reminders={reminders}
            onRemindersChange={(rems) => {
              setReminders(rems);
              saveReminders(rems);
            }}
            language={language}
            onTriggerToast={handleTriggerToast}
          />
        )}
      </main>

      {/* Modals */}
      {showPrivacyModal && (
        <PrivacyModal
          settings={settings}
          onSettingsUpdate={(s) => setSettings(s)}
          onClose={() => setShowPrivacyModal(false)}
          language={language}
        />
      )}

      {showSpeechModal && (
        <SpeechModal
          onTranscript={handleSpeechTranscript}
          onClose={() => setShowSpeechModal(false)}
        />
      )}
    </div>
  );
}
