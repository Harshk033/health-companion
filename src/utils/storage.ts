import { DiabetesLog, ChatSession, SkinAnalysisResult, Reminder, PatientProfile, UserSettings } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'aura_profile',
  DIABETES_LOGS: 'aura_diabetes_logs',
  CHAT_SESSIONS: 'aura_chat_sessions',
  SKIN_ANALYSES: 'aura_skin_analyses',
  REMINDERS: 'aura_reminders',
  SETTINGS: 'aura_settings',
};

const DEFAULT_PROFILE: PatientProfile = {
  name: 'Rajesh Sharma',
  age: 52,
  gender: 'Male',
  bloodGroup: 'B+',
  conditions: ['Type 2 Diabetes', 'Mild Hypertension'],
  allergies: ['Penicillin'],
  doctorName: 'Dr. Anita Roy (Endocrinologist)',
  primaryPhone: '+91 98765 43210',
};

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  encrypted: false,
  consentGiven: true,
  soundEnabled: true,
};

const DEFAULT_REMINDERS: Reminder[] = [
  { id: 'rem-1', title: 'Morning Metformin (500mg)', type: 'medicine', time: '08:00', enabled: true, repeat: 'daily' },
  { id: 'rem-2', title: 'Fasting Blood Sugar Check', type: 'sugar_check', time: '07:30', enabled: true, repeat: 'daily' },
  { id: 'rem-3', title: 'Hydration - Drink 2 Glasses Water', type: 'water', time: '11:00', enabled: true, repeat: 'hourly' },
  { id: 'rem-4', title: 'Brisk Evening Walk (30 mins)', type: 'exercise', time: '18:00', enabled: true, repeat: 'daily' },
  { id: 'rem-5', title: 'Bedtime Glucose Check & Sleep', type: 'sleep', time: '22:30', enabled: true, repeat: 'daily' },
];

// Helper for simulated encryption
function encodeData(data: any, isEncrypted: boolean): string {
  const jsonStr = JSON.stringify(data);
  if (!isEncrypted) return jsonStr;
  try {
    return 'ENC:' + btoa(encodeURIComponent(jsonStr));
  } catch {
    return jsonStr;
  }
}

function decodeData<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    if (raw.startsWith('ENC:')) {
      const decoded = decodeURIComponent(atob(raw.substring(4)));
      return JSON.parse(decoded);
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Generate rich initial seed data for 7 days if empty
function generateSeedLogs(): DiabetesLog[] {
  const logs: DiabetesLog[] = [];
  const today = new Date();
  
  const sampleMeals = [
    [{ name: 'Oatmeal & Green Tea', carbs: 35, calories: 280 }],
    [{ name: 'Brown Rice, Dal & Spinach Curry', carbs: 55, calories: 450 }],
    [{ name: 'Roti, Grilled Chicken & Salad', carbs: 40, calories: 380 }],
    [{ name: 'Sprouted Moong Salad & Nuts', carbs: 20, calories: 180 }],
  ];

  for (let i = 6; i >= 0; i--) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - i);
    const dateStr = dateObj.toISOString().split('T')[0];

    // Fasting log
    logs.push({
      id: `seed-fast-${i}`,
      date: dateStr,
      time: '07:45',
      bloodSugar: Math.floor(105 + Math.random() * 30 - 10), // ~100-125
      timing: 'fasting',
      meals: sampleMeals[0],
      waterIntake: 2250 + Math.floor(Math.random() * 500),
      exerciseMins: 30 + (i % 2 === 0 ? 15 : 0),
      exerciseType: 'Brisk Walking',
      medicationTaken: i !== 2, // simulated missed dose on day 2
      medicationName: 'Metformin 500mg',
      weight: 74.5 - (6 - i) * 0.1,
      mood: i === 2 ? 'anxious' : 'good',
      sleepHours: 7 + (i % 3) * 0.5,
      notes: i === 2 ? 'Felt slightly tired in the afternoon' : 'Feeling energetic',
    });

    // Post-meal log
    logs.push({
      id: `seed-post-${i}`,
      date: dateStr,
      time: '14:15',
      bloodSugar: Math.floor(140 + Math.random() * 40 - 10), // ~135-170
      timing: 'post_meal',
      meals: sampleMeals[1],
      waterIntake: 2000,
      exerciseMins: 0,
      exerciseType: 'None',
      medicationTaken: true,
      medicationName: 'Glimepiride 1mg',
      weight: 74.5,
      mood: 'good',
      sleepHours: 7,
    });
  }

  return logs;
}

export function getProfile(): PatientProfile {
  const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return decodeData(raw, DEFAULT_PROFILE);
}

export function saveProfile(profile: PatientProfile): void {
  const settings = getSettings();
  localStorage.setItem(STORAGE_KEYS.PROFILE, encodeData(profile, settings.encrypted));
}

export function getSettings(): UserSettings {
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return decodeData(raw, DEFAULT_SETTINGS);
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getDiabetesLogs(): DiabetesLog[] {
  const raw = localStorage.getItem(STORAGE_KEYS.DIABETES_LOGS);
  let logs = decodeData<DiabetesLog[]>(raw, []);
  if (logs.length === 0) {
    logs = generateSeedLogs();
    saveDiabetesLogs(logs);
  }
  return logs;
}

export function saveDiabetesLogs(logs: DiabetesLog[]): void {
  const settings = getSettings();
  localStorage.setItem(STORAGE_KEYS.DIABETES_LOGS, encodeData(logs, settings.encrypted));
}

export function addDiabetesLog(entry: Omit<DiabetesLog, 'id'>): DiabetesLog {
  const logs = getDiabetesLogs();
  const newLog: DiabetesLog = {
    ...entry,
    id: 'log-' + Date.now(),
  };
  const updated = [newLog, ...logs];
  saveDiabetesLogs(updated);
  return newLog;
}

export function deleteDiabetesLog(id: string): void {
  const logs = getDiabetesLogs().filter(l => l.id !== id);
  saveDiabetesLogs(logs);
}

export function getChatSessions(): ChatSession[] {
  const raw = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
  return decodeData<ChatSession[]>(raw, []);
}

export function saveChatSessions(sessions: ChatSession[]): void {
  const settings = getSettings();
  localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, encodeData(sessions, settings.encrypted));
}

export function getSkinAnalyses(): SkinAnalysisResult[] {
  const raw = localStorage.getItem(STORAGE_KEYS.SKIN_ANALYSES);
  return decodeData<SkinAnalysisResult[]>(raw, []);
}

export function saveSkinAnalyses(analyses: SkinAnalysisResult[]): void {
  const settings = getSettings();
  localStorage.setItem(STORAGE_KEYS.SKIN_ANALYSES, encodeData(analyses, settings.encrypted));
}

export function getReminders(): Reminder[] {
  const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
  const rems = decodeData<Reminder[]>(raw, []);
  if (rems.length === 0) {
    saveReminders(DEFAULT_REMINDERS);
    return DEFAULT_REMINDERS;
  }
  return rems;
}

export function saveReminders(reminders: Reminder[]): void {
  const settings = getSettings();
  localStorage.setItem(STORAGE_KEYS.REMINDERS, encodeData(reminders, settings.encrypted));
}

export function exportAllDataJson(): string {
  const exportPayload = {
    auraVersion: '1.0.0',
    exportDate: new Date().toISOString(),
    profile: getProfile(),
    settings: getSettings(),
    diabetesLogs: getDiabetesLogs(),
    chatSessions: getChatSessions(),
    skinAnalyses: getSkinAnalyses(),
    reminders: getReminders(),
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importAllDataJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.profile) saveProfile(data.profile);
    if (data.diabetesLogs) saveDiabetesLogs(data.diabetesLogs);
    if (data.chatSessions) saveChatSessions(data.chatSessions);
    if (data.skinAnalyses) saveSkinAnalyses(data.skinAnalyses);
    if (data.reminders) saveReminders(data.reminders);
    return true;
  } catch (err) {
    console.error('Failed to import JSON data:', err);
    return false;
  }
}

export function clearAllLocalData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
