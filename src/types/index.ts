export type Language = 'en' | 'hi' | 'gu';

export interface Vitals {
  temperature?: number; // °F
  systolic?: number; // mmHg
  diastolic?: number; // mmHg
  heartRate?: number; // bpm
  oxygenSat?: number; // %
  bloodSugar?: number; // mg/dL
}

export type TriageLevel = 'home' | 'consult' | 'emergency';

export interface TriageResult {
  level: TriageLevel;
  title: string;
  confidence: number;
  summary: string;
  explanation: string;
  actionSteps: string[];
  redFlags: string[];
  followUps: string[];
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  vitals?: Vitals;
  triageResult?: TriageResult;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export type SugarTiming = 'fasting' | 'post_meal' | 'before_bed' | 'random';

export interface MealEntry {
  name: string;
  carbs?: number;
  calories?: number;
}

export interface DiabetesLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  bloodSugar: number; // mg/dL
  timing: SugarTiming;
  meals: MealEntry[];
  waterIntake: number; // in ml or glasses (1 glass = 250ml)
  exerciseMins: number;
  exerciseType: string;
  medicationTaken: boolean;
  medicationName: string;
  weight: number; // kg
  mood: 'great' | 'good' | 'okay' | 'anxious' | 'unwell';
  sleepHours: number;
  notes?: string;
}

export interface SkinAnalysisResult {
  id: string;
  timestamp: string;
  imageUrl: string;
  possibleCondition: string;
  confidence: number;
  detectedFeatures: string[];
  suggestedCare: string[];
  redFlags: string[];
  hospitalAdvice: string;
  disclaimer: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Urgent Care' | 'Clinic' | 'Pharmacy' | 'Diagnostic';
  distanceKm: number;
  address: string;
  phone: string;
  isOpen24_7: boolean;
  isOpenNow: boolean;
  specialties: string[];
  rating: number;
}

export interface Reminder {
  id: string;
  title: string;
  type: 'medicine' | 'water' | 'exercise' | 'sugar_check' | 'sleep';
  time: string; // HH:mm
  enabled: boolean;
  repeat: 'daily' | 'hourly' | 'weekdays';
}

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
  doctorName: string;
  primaryPhone: string;
}

export interface UserSettings {
  language: Language;
  encrypted: boolean;
  consentGiven: boolean;
  soundEnabled: boolean;
}
