import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Activity,
  Camera,
  FileText,
  MapPin,
  Bell,
} from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/i18n';

export type TabType = 'dashboard' | 'triage' | 'diabetes' | 'skin' | 'report' | 'directory' | 'reminders';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, language }) => {
  const tabs: { id: TabType; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { id: 'triage', labelKey: 'nav.triage', icon: Stethoscope },
    { id: 'diabetes', labelKey: 'nav.diabetes', icon: Activity },
    { id: 'skin', labelKey: 'nav.skinAnalyzer', icon: Camera },
    { id: 'report', labelKey: 'nav.report', icon: FileText },
    { id: 'directory', labelKey: 'nav.directory', icon: MapPin },
    { id: 'reminders', labelKey: 'nav.reminders', icon: Bell },
  ];

  return (
    <nav className="bg-white/20 backdrop-blur-xl border-b border-white/30 px-4 py-2 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/60 backdrop-blur-md border border-white/80 text-teal-800 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-teal-800 hover:bg-white/30 font-semibold'
              }`}
              id={`nav-tab-${tab.id}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
              <span>{t(language, tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
