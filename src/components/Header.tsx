import React from 'react';
import { Activity, ShieldCheck, Wifi, Mic, Globe, Lock } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/i18n';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenPrivacy: () => void;
  onOpenSpeech: () => void;
  isOffline: boolean;
  isEncrypted: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenPrivacy,
  onOpenSpeech,
  isOffline,
  isEncrypted,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/30 backdrop-blur-xl border-b border-white/40 px-4 py-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-600 text-white font-black shadow-lg shadow-teal-600/20">
            <Activity className="w-5 h-5 animate-pulse text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-300"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-['Outfit']">
                AURA <span className="text-teal-700 font-bold text-lg">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/50 backdrop-blur-md text-teal-800 border border-white/60 shadow-xs">
                Offline PWA
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              {t(language, 'appSubtitle')}
            </p>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Offline / Online Badge */}
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-md ${
              isOffline
                ? 'bg-amber-100/70 text-amber-900 border-amber-200'
                : 'bg-emerald-100/70 text-emerald-900 border-emerald-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {isOffline ? t(language, 'common.offlineReady') : t(language, 'common.online')}
            </span>
          </div>

          {/* Encryption Indicator */}
          {isEncrypted && (
            <div className="hidden lg:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/50 backdrop-blur-md text-indigo-800 border border-white/60 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>AES-256</span>
            </div>
          )}

          {/* Speech-to-Text Microphone Button */}
          <button
            onClick={onOpenSpeech}
            className="flex items-center justify-center p-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md text-teal-700 border border-white/50 transition-colors shadow-xs cursor-pointer"
            title="Speech-to-Text Microphone Input"
            id="mic-header-btn"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative flex items-center bg-white/40 backdrop-blur-md border border-white/50 rounded-xl px-2.5 py-1 text-xs shadow-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer py-1"
              id="language-select"
            >
              <option value="en" className="bg-white text-slate-800">English</option>
              <option value="hi" className="bg-white text-slate-800">हिंदी (Hindi)</option>
              <option value="gu" className="bg-white text-slate-800">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          {/* Privacy Modal Trigger Button */}
          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md text-teal-800 border border-white/50 transition-all shadow-xs cursor-pointer"
            id="privacy-settings-btn"
          >
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">{t(language, 'privacy.title')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
