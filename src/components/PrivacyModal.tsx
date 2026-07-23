import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  FileJson,
} from 'lucide-react';
import { UserSettings, Language } from '../types';
import {
  exportAllDataJson,
  importAllDataJson,
  clearAllLocalData,
  saveSettings,
} from '../utils/storage';
import { t } from '../utils/i18n';

interface PrivacyModalProps {
  settings: UserSettings;
  onSettingsUpdate: (s: UserSettings) => void;
  onClose: () => void;
  language: Language;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  settings,
  onSettingsUpdate,
  onClose,
  language,
}) => {
  const [encrypted, setEncrypted] = useState<boolean>(settings.encrypted);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleToggleEncryption = () => {
    const updated = { ...settings, encrypted: !encrypted };
    setEncrypted(!encrypted);
    onSettingsUpdate(updated);
    saveSettings(updated);
  };

  const handleExport = () => {
    const jsonStr = exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Health_Data_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importAllDataJson(content);
        if (success) {
          setImportStatus('Data successfully restored! Refreshing...');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          setImportStatus('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteData = () => {
    clearAllLocalData();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-extrabold text-slate-900">{t(language, 'privacy.title')}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-sm font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Consent Notice Box */}
        <div className="p-4 rounded-2xl bg-teal-50/90 border border-teal-200 space-y-2 text-xs text-teal-950 shadow-2xs">
          <div className="font-extrabold text-teal-900 text-sm flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-teal-700" />
            <span>{t(language, 'privacy.consentTitle')}</span>
          </div>
          <p className="leading-relaxed font-medium">{t(language, 'privacy.consentText')}</p>
        </div>

        {/* Local Encryption Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 border border-slate-200 shadow-2xs">
          <div>
            <div className="text-xs font-bold text-slate-900">{t(language, 'privacy.encryptedToggle')}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Encodes local storage payload with base64 salt</div>
          </div>
          <input
            type="checkbox"
            checked={encrypted}
            onChange={handleToggleEncryption}
            className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
          />
        </div>

        {/* Export / Import Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/80 hover:bg-white text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>{t(language, 'privacy.exportData')}</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/80 hover:bg-white text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-cyan-700" />
            <span>{t(language, 'privacy.importData')}</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-900 text-xs text-center font-bold">
            {importStatus}
          </div>
        )}

        {/* Delete Data Danger Zone */}
        <div className="pt-2 border-t border-slate-200">
          {showConfirmDelete ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 shadow-2xs">
              <div className="font-extrabold flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Deletion of All Local Health Logs</span>
              </div>
              <p className="text-[11px] font-medium">This action cannot be undone. All triage history, diabetes logs, and reminders will be erased.</p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteData}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold cursor-pointer shadow-md"
                >
                  Permanently Erase All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t(language, 'privacy.deleteData')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
