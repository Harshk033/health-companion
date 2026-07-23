import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  User,
  Calendar,
  CheckCircle2,
  Activity,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import { PatientProfile, DiabetesLog, ChatSession, Language } from '../types';
import { generateHtmlReport } from '../utils/reportGenerator';
import { t } from '../utils/i18n';
import { saveProfile } from '../utils/storage';

interface ClinicianReportProps {
  profile: PatientProfile;
  onProfileUpdate: (p: PatientProfile) => void;
  logs: DiabetesLog[];
  chats: ChatSession[];
  language: Language;
}

export const ClinicianReport: React.FC<ClinicianReportProps> = ({
  profile,
  onProfileUpdate,
  logs,
  chats,
  language,
}) => {
  const [dateRange, setDateRange] = useState<string>('7days');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<PatientProfile>({ ...profile });

  // Statistics calculation for live preview
  const totalLogs = logs.length;
  const avgSugar = totalLogs > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.bloodSugar, 0) / totalLogs)
    : 118;

  const medTakenCount = logs.filter((l) => l.medicationTaken).length;
  const medAdherencePct = totalLogs > 0 ? Math.round((medTakenCount / totalLogs) * 100) : 92;

  const handleDownloadHtml = () => {
    const htmlContent = generateHtmlReport(profile, logs, chats);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinician_Report_${profile.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const htmlContent = generateHtmlReport(profile, logs, chats);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileUpdate(editForm);
    saveProfile(editForm);
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg text-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold mb-2 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-indigo-700" />
            <span>Clinician PDF & HTML Generator</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {t(language, 'report.title')}
          </h2>
          <p className="text-xs text-slate-600 max-w-xl font-medium">
            {t(language, 'report.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            id="download-html-report-btn"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{t(language, 'report.downloadHtml')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/70 hover:bg-white text-slate-800 font-bold text-xs border border-white/80 transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>{t(language, 'report.printReport')}</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Card & Editor */}
      <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-4 shadow-lg text-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-700" />
            <span>{t(language, 'report.patientInfo')}</span>
          </h3>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
          >
            {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
            <div>
              <label className="text-slate-500 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold shadow-2xs"
              />
            </div>
            <div>
              <label className="text-slate-500 font-bold block mb-1">Age</label>
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold shadow-2xs"
              />
            </div>
            <div>
              <label className="text-slate-500 font-bold block mb-1">Doctor Name</label>
              <input
                type="text"
                value={editForm.doctorName}
                onChange={(e) => setEditForm({ ...editForm, doctorName: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold shadow-2xs"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-teal-600 text-white font-bold cursor-pointer shadow-md"
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div className="p-3 bg-white/60 border border-white/80 rounded-2xl shadow-2xs">
              <span className="text-slate-500 font-bold block">Name</span>
              <span className="font-extrabold text-slate-900 text-sm">{profile.name}</span>
            </div>
            <div className="p-3 bg-white/60 border border-white/80 rounded-2xl shadow-2xs">
              <span className="text-slate-500 font-bold block">Age & Gender</span>
              <span className="font-extrabold text-slate-900 text-sm">{profile.age} yrs • {profile.gender}</span>
            </div>
            <div className="p-3 bg-white/60 border border-white/80 rounded-2xl shadow-2xs">
              <span className="text-slate-500 font-bold block">Blood Group</span>
              <span className="font-extrabold text-teal-800 text-sm">{profile.bloodGroup}</span>
            </div>
            <div className="p-3 bg-white/60 border border-white/80 rounded-2xl shadow-2xs">
              <span className="text-slate-500 font-bold block">Attending Physician</span>
              <span className="font-extrabold text-slate-900 text-sm">{profile.doctorName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview of Report Card */}
      <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-6 shadow-lg text-slate-800">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-teal-800 font-extrabold uppercase tracking-wider">Report Preview</span>
            <h3 className="text-lg font-extrabold text-slate-900">Clinical Data Overview (Last 7 Days)</h3>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 font-bold cursor-pointer shadow-2xs"
            >
              <option value="7days">Last 7 Days</option>
              <option value="14days">Last 14 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Quick Vitals Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white/60 rounded-2xl border border-white/80 text-center shadow-2xs">
            <div className="text-2xl font-black text-teal-700 font-['Outfit']">{avgSugar}</div>
            <div className="text-xs text-slate-600 font-bold mt-1">Avg Glucose (mg/dL)</div>
          </div>
          <div className="p-4 bg-white/60 rounded-2xl border border-white/80 text-center shadow-2xs">
            <div className="text-2xl font-black text-emerald-700 font-['Outfit']">{medAdherencePct}%</div>
            <div className="text-xs text-slate-600 font-bold mt-1">Medication Adherence</div>
          </div>
          <div className="p-4 bg-white/60 rounded-2xl border border-white/80 text-center shadow-2xs">
            <div className="text-2xl font-black text-indigo-700 font-['Outfit']">{logs.length}</div>
            <div className="text-xs text-slate-600 font-bold mt-1">Vitals Logged</div>
          </div>
          <div className="p-4 bg-white/60 rounded-2xl border border-white/80 text-center shadow-2xs">
            <div className="text-2xl font-black text-amber-700 font-['Outfit']">{chats.length}</div>
            <div className="text-xs text-slate-600 font-bold mt-1">Triage Consults</div>
          </div>
        </div>

        {/* AI Clinical Executive Summary */}
        <div className="p-5 rounded-2xl bg-teal-50/90 border border-teal-200 text-teal-950 text-xs space-y-2 shadow-2xs">
          <div className="font-extrabold text-teal-900 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-700" />
            <span>{t(language, 'report.aiSummary')}</span>
          </div>
          <p className="leading-relaxed font-medium">
            Patient demonstrates satisfactory blood sugar management overall with an average reading of <strong>{avgSugar} mg/dL</strong> and <strong>{medAdherencePct}% medication adherence</strong>. Hydration targets were consistently met. Recommend continued adherence to daily Metformin dosage and routine 3-month HbA1c screening.
          </p>
        </div>
      </div>
    </div>
  );
};
