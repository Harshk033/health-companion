import React, { useState } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Clock,
  Eye,
} from 'lucide-react';
import { SkinAnalysisResult, Language } from '../types';
import { analyzeSkinImage } from '../utils/skinAnalyzerEngine';
import { t } from '../utils/i18n';
import { getSkinAnalyses, saveSkinAnalyses } from '../utils/storage';

interface SkinAnalyzerProps {
  language: Language;
}

export const SkinAnalyzer: React.FC<SkinAnalyzerProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hintText, setHintText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [history, setHistory] = useState<SkinAnalysisResult[]>(() => getSkinAnalyses());

  // Sample preset images for instant hackathon demo
  const samplePresets = [
    {
      title: 'Skin Rash / Eczema',
      hint: 'itchy red rash on elbow',
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    },
    {
      title: 'Minor Burn',
      hint: 'burn from hot water with mild blister',
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60',
    },
    {
      title: 'Superficial Cut / Wound',
      hint: 'cut on finger bleeding stopped',
      url: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=500&auto=format&fit=crop&q=60',
    },
    {
      title: 'Circular Fungal Patch',
      hint: 'ring shaped itchy patch on forearm',
      url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSelectedImage(url);
        runAnalysis(url, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setSelectedImage(preset.url);
    setHintText(preset.hint);
    runAnalysis(preset.url, preset.hint);
  };

  const runAnalysis = (imageUrl: string, hint: string) => {
    setIsScanning(true);
    setResult(null);

    setTimeout(() => {
      const res = analyzeSkinImage(imageUrl, hint);
      setResult(res);
      setIsScanning(false);

      const updated = [res, ...history];
      setHistory(updated);
      saveSkinAnalyses(updated);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg space-y-2 text-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold shadow-2xs">
          <Camera className="w-3.5 h-3.5 text-cyan-700" />
          <span>Offline Visual Heuristic Classifier</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          {t(language, 'skin.title')}
        </h2>
        <p className="text-xs text-slate-600 max-w-xl font-medium">
          {t(language, 'skin.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload / Camera & Image Canvas */}
        <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-4 shadow-lg text-slate-800">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-700" />
            <span>Select or Capture Visual Sample</span>
          </h3>

          {/* Sample Preset Shortcut Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Test Presets (Instant Demo)
            </label>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-800 text-xs font-bold border border-white/80 transition-colors cursor-pointer shadow-2xs"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-slate-300 hover:border-cyan-600 rounded-2xl p-6 text-center transition-all bg-white/50">
            {selectedImage ? (
              <div className="space-y-3">
                <img
                  src={selectedImage}
                  alt="Visual Health Sample"
                  className="max-h-56 mx-auto rounded-2xl object-cover border border-white shadow-md"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Remove & Upload New Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto shadow-2xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">{t(language, 'skin.uploadPrompt')}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Supports JPG, PNG, WEBP files</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="skin-file-input"
                />
              </label>
            )}
          </div>

          {/* Optional Symptom Description Hint */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              Optional Description or Location (e.g., forearm, knee)
            </label>
            <input
              type="text"
              value={hintText}
              onChange={(e) => setHintText(e.target.value)}
              placeholder="e.g. Itchy rash noticed 2 days ago..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-cyan-600 shadow-2xs"
            />
          </div>

          {selectedImage && !isScanning && !result && (
            <button
              onClick={() => runAnalysis(selectedImage, hintText)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Analyze Image Now
            </button>
          )}
        </div>

        {/* Right Column: Diagnostic Output Card */}
        <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-4 shadow-lg min-h-[400px] text-slate-800">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-center">
              <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-slate-900">{t(language, 'skin.scanning')}</div>
                <p className="text-xs text-slate-600 font-medium">Comparing feature matrices and erythema patterns locally</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4 text-xs font-medium">
              {/* Result Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t(language, 'skin.possibleCondition')}</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{result.possibleCondition}</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 font-extrabold text-xs shadow-2xs">
                  {result.confidence}% Match
                </div>
              </div>

              {/* Detected Visual Features */}
              <div className="space-y-1.5">
                <div className="font-extrabold text-cyan-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-700" />
                  <span>{t(language, 'skin.detectedFeatures')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {result.detectedFeatures.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>

              {/* Suggested Home Care */}
              <div className="space-y-1.5">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t(language, 'skin.suggestedCare')}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
                  {result.suggestedCare.map((care, idx) => (
                    <li key={idx}>{care}</li>
                  ))}
                </ol>
              </div>

              {/* Red Flags */}
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 shadow-2xs">
                <div className="font-extrabold flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Red Flags to Watch For</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-800 font-medium">
                  {result.redFlags.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>

              {/* Hospital Advice & Disclaimer */}
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-slate-700 text-[11px] space-y-1 shadow-2xs">
                <div className="font-extrabold text-slate-900">Clinical Evaluation Advice:</div>
                <p>{result.hospitalAdvice}</p>
                <div className="pt-2 text-[10px] text-slate-500 italic">{result.disclaimer}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-3 text-slate-400">
              <Camera className="w-12 h-12 opacity-30 text-slate-500" />
              <p className="text-xs font-medium text-slate-500">Select or upload a skin/wound image to view visual diagnostic analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
