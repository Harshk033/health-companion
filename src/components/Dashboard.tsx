import React from 'react';
import {
  Activity,
  HeartPulse,
  Droplets,
  Footprints,
  Moon,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  Camera,
  MapPin,
  Flame,
} from 'lucide-react';
import { DiabetesLog, Reminder, Language, PatientProfile } from '../types';
import { t } from '../utils/i18n';
import confetti from 'canvas-confetti';

interface DashboardProps {
  profile: PatientProfile;
  logs: DiabetesLog[];
  reminders: Reminder[];
  language: Language;
  onNavigate: (tab: any) => void;
  onToggleReminder: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  logs,
  reminders,
  language,
  onNavigate,
  onToggleReminder,
}) => {
  // Compute health stats
  const latestLog = logs[0] || { bloodSugar: 110, waterIntake: 2000, sleepHours: 7.5, exerciseMins: 30, medicationTaken: true };
  const totalLogs = logs.length;

  const avgGlucose = totalLogs > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.bloodSugar, 0) / totalLogs)
    : 115;

  const medAdherence = totalLogs > 0
    ? Math.round((logs.filter(l => l.medicationTaken).length / totalLogs) * 100)
    : 90;

  const avgWater = totalLogs > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.waterIntake, 0) / totalLogs)
    : 2200;

  const avgSleep = totalLogs > 0
    ? (logs.reduce((acc, l) => acc + l.sleepHours, 0) / totalLogs).toFixed(1)
    : '7.5';

  const avgExercise = totalLogs > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.exerciseMins, 0) / totalLogs)
    : 30;

  // Health Score Calculation (0 - 100)
  let healthScore = 100;
  if (avgGlucose > 180) healthScore -= 20;
  else if (avgGlucose > 140) healthScore -= 10;
  if (avgGlucose < 70) healthScore -= 25;
  if (medAdherence < 80) healthScore -= 15;
  if (avgWater < 1500) healthScore -= 10;
  if (parseFloat(avgSleep) < 6) healthScore -= 10;
  if (avgExercise < 15) healthScore -= 10;
  healthScore = Math.max(35, Math.min(100, healthScore));

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Overall Health Score Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 p-6 sm:p-8 shadow-lg text-slate-800">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-xs">
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>Offline AI Health Engine Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Outfit']">
              Welcome back, <span className="text-teal-700">{profile.name}</span>
            </h2>
            <p className="text-sm text-slate-600 max-w-xl font-medium">
              Here is your daily health intelligence summary based on recent metabolic vitals and glucose logs.
            </p>
          </div>

          {/* Health Score Gauge Circle */}
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-sm min-w-[240px]">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={healthScore >= 80 ? 'text-teal-600' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-500'}
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xl font-extrabold text-slate-900 font-['Outfit']">
                {healthScore}
              </span>
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Health Score</div>
              <div className="text-sm font-bold text-teal-800 mt-0.5">
                {healthScore >= 85 ? 'Optimal Stability' : healthScore >= 70 ? 'Good Condition' : 'Needs Attention'}
              </div>
              <button
                onClick={triggerCelebration}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
              >
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Goal Streaks 🔥</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Red Flag Notice Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950">Emergency Red Flag Triage Protocol</h4>
            <p className="text-xs text-rose-700">Experiencing severe chest pain, breathlessness, or blood sugar &gt; 300 mg/dL?</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('triage')}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
        >
          Check Symptoms Now
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blood Sugar */}
        <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Glucose</span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{latestLog.bloodSugar}</span>
            <span className="text-xs text-slate-500 font-bold">mg/dL</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="text-slate-500">Weekly Avg: {avgGlucose} mg/dL</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
              latestLog.bloodSugar <= 140 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {latestLog.bloodSugar <= 140 ? 'Normal' : 'Elevated'}
            </span>
          </div>
        </div>

        {/* Card 2: Medication Adherence */}
        <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Med Adherence</span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{medAdherence}%</span>
            <span className="text-xs text-slate-500 font-bold">Taken</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${medAdherence}%` }} />
          </div>
        </div>

        {/* Card 3: Water Intake */}
        <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Water Hydration</span>
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{latestLog.waterIntake}</span>
            <span className="text-xs text-slate-500 font-bold">/ 2500 ml</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (latestLog.waterIntake / 2500) * 100)}%` }} />
          </div>
        </div>

        {/* Card 4: Daily Exercise */}
        <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Activity</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{latestLog.exerciseMins}</span>
            <span className="text-xs text-slate-500 font-bold">/ 30 mins</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="text-slate-500">Sleep: {latestLog.sleepHours}h</span>
            <span className="text-emerald-700 font-extrabold">Goal Met</span>
          </div>
        </div>
      </div>

      {/* Quick Launch Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('triage')}
          className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/50 text-center transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
          id="quick-triage-btn"
        >
          <div className="p-3 rounded-2xl bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-2">
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">AI Symptom Triage</span>
        </button>

        <button
          onClick={() => onNavigate('diabetes')}
          className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/50 text-center transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
          id="quick-diabetes-btn"
        >
          <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">Log Blood Sugar</span>
        </button>

        <button
          onClick={() => onNavigate('skin')}
          className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/50 text-center transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
          id="quick-skin-btn"
        >
          <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white transition-colors mb-2">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">Scan Skin / Rash</span>
        </button>

        <button
          onClick={() => onNavigate('directory')}
          className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/50 text-center transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
          id="quick-facilities-btn"
        >
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-colors mb-2">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">Find Emergency ER</span>
        </button>
      </div>

      {/* Reminders & Daily Schedule Checklist (Slate-900 Dark Contrast Card) */}
      <div className="p-6 rounded-3xl bg-slate-900 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Medication & Schedule Reminders</h3>
              <p className="text-xs text-slate-400">Active offline alarms</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reminders')}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
          >
            Manage All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reminders.slice(0, 4).map((rem) => (
            <div
              key={rem.id}
              onClick={() => onToggleReminder(rem.id)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                rem.enabled
                  ? 'bg-slate-800/80 border-slate-700 hover:border-teal-500/50'
                  : 'bg-slate-800/30 border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${rem.enabled ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{rem.title}</div>
                  <div className="text-[11px] text-slate-400">{rem.time} • {rem.repeat}</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={rem.enabled}
                onChange={() => onToggleReminder(rem.id)}
                className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
