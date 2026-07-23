import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Pill,
  Droplets,
  Footprints,
  HeartPulse,
  Moon,
  Trash2,
  CheckCircle2,
  Volume2,
  Play,
  AlertCircle,
} from 'lucide-react';
import { Reminder, Language } from '../types';
import { t } from '../utils/i18n';
import { addDiabetesLog } from '../utils/storage';

interface ReminderManagerProps {
  reminders: Reminder[];
  onRemindersChange: (updated: Reminder[]) => void;
  language: Language;
  onTriggerToast: (title: string, message: string) => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  onRemindersChange,
  language,
  onTriggerToast,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<Reminder['type']>('medicine');
  const [time, setTime] = useState<string>('08:00');
  const [repeat, setRepeat] = useState<Reminder['repeat']>('daily');

  const handleToggle = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onRemindersChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    onRemindersChange(updated);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRem: Reminder = {
      id: 'rem-' + Date.now(),
      title,
      type,
      time,
      enabled: true,
      repeat,
    };

    const updated = [...reminders, newRem];
    onRemindersChange(updated);
    setShowAddModal(false);
    setTitle('');
  };

  const handleTestTrigger = (rem: Reminder) => {
    onTriggerToast(`⏰ ALARM DUE: ${rem.title}`, `Scheduled time: ${rem.time} • Tap to mark as completed.`);
  };

  const getTypeIcon = (t: Reminder['type']) => {
    switch (t) {
      case 'medicine': return <Pill className="w-4 h-4 text-indigo-400" />;
      case 'water': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'exercise': return <Footprints className="w-4 h-4 text-emerald-400" />;
      case 'sugar_check': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'sleep': return <Moon className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg text-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold mb-2 shadow-2xs">
            <Bell className="w-3.5 h-3.5 text-indigo-700" />
            <span>Offline Alarm & Notification Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {t(language, 'reminders.title')}
          </h2>
          <p className="text-xs text-slate-600 max-w-xl font-medium">
            {t(language, 'reminders.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t(language, 'reminders.addReminder')}</span>
        </button>
      </div>

      {/* Reminders List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between ${
              rem.enabled
                ? 'bg-white/40 backdrop-blur-xl border-white/50 shadow-lg text-slate-800'
                : 'bg-white/20 backdrop-blur-md border-white/30 text-slate-500 opacity-60 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/80 border border-white/90 shadow-2xs">
                  {getTypeIcon(rem.type)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{rem.title}</h3>
                  <div className="text-xs text-teal-700 font-extrabold mt-0.5">
                    {rem.time} • <span className="text-slate-500 font-medium capitalize">{rem.repeat}</span>
                  </div>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rem.enabled}
                  onChange={() => handleToggle(rem.id)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Test Alarm & Delete Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
              <button
                onClick={() => handleTestTrigger(rem)}
                className="flex items-center gap-1.5 text-teal-800 hover:text-teal-900 font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-teal-700 text-teal-700" />
                <span>{t(language, 'reminders.triggerTest')}</span>
              </button>

              <button
                onClick={() => handleDelete(rem.id)}
                className="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Create New Alarm</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-800 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-500 font-bold block mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Evening Glimepiride Dose"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Reminder['type'])}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold cursor-pointer shadow-2xs"
                  >
                    <option value="medicine">Medication</option>
                    <option value="water">Water Hydration</option>
                    <option value="sugar_check">Glucose Check</option>
                    <option value="exercise">Exercise</option>
                    <option value="sleep">Sleep Target</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Frequency</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as Reminder['repeat'])}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold cursor-pointer shadow-2xs"
                >
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                  <option value="weekdays">Weekdays Only</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer shadow-md"
                >
                  Save Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
