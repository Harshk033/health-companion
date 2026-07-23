import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  Droplets,
  Footprints,
  Moon,
  Scale,
  Smile,
  Pill,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { DiabetesLog, SugarTiming, Language } from '../types';
import { t } from '../utils/i18n';
import { addDiabetesLog, deleteDiabetesLog } from '../utils/storage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DiabetesTrackerProps {
  logs: DiabetesLog[];
  onLogsChange: () => void;
  language: Language;
}

export const DiabetesTracker: React.FC<DiabetesTrackerProps> = ({
  logs,
  onLogsChange,
  language,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State for Log Entry
  const [bloodSugar, setBloodSugar] = useState<number>(115);
  const [timing, setTiming] = useState<SugarTiming>('fasting');
  const [mealName, setMealName] = useState<string>('Oatmeal & Green Tea');
  const [waterIntake, setWaterIntake] = useState<number>(2500);
  const [exerciseMins, setExerciseMins] = useState<number>(30);
  const [exerciseType, setExerciseType] = useState<string>('Brisk Walk');
  const [medicationTaken, setMedicationTaken] = useState<boolean>(true);
  const [medicationName, setMedicationName] = useState<string>('Metformin 500mg');
  const [weight, setWeight] = useState<number>(74.5);
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'anxious' | 'unwell'>('good');
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [notes, setNotes] = useState<string>('');

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    addDiabetesLog({
      date: today.toISOString().split('T')[0],
      time: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bloodSugar,
      timing,
      meals: [{ name: mealName, carbs: 35 }],
      waterIntake,
      exerciseMins,
      exerciseType,
      medicationTaken,
      medicationName,
      weight,
      mood,
      sleepHours,
      notes,
    });
    setShowAddModal(false);
    onLogsChange();
  };

  const handleDelete = (id: string) => {
    deleteDiabetesLog(id);
    onLogsChange();
  };

  // Trend detection and health nudges
  const nudges: string[] = [];
  const recentLogs = logs.slice(0, 5);
  const avgGlucose = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((acc, l) => acc + l.bloodSugar, 0) / recentLogs.length)
    : 120;

  if (avgGlucose > 160) {
    nudges.push('⚠️ Elevated glucose trend detected (Avg > 160 mg/dL). Consider reducing simple carbohydrate intake and consulting your endocrinologist.');
  } else if (avgGlucose < 80) {
    nudges.push('⚡ Hypoglycemia risk detected (Avg < 80 mg/dL). Ensure you keep fast-acting glucose tablets or juice nearby.');
  }

  const missedMeds = recentLogs.filter(l => !l.medicationTaken).length;
  if (missedMeds > 0) {
    nudges.push(`💊 You missed ${missedMeds} medication dose(s) recently. Consistent medication schedule improves long-term HbA1c.`);
  }

  const avgWaterRecent = recentLogs.reduce((acc, l) => acc + l.waterIntake, 0) / (recentLogs.length || 1);
  if (avgWaterRecent < 1800) {
    nudges.push('💧 Hydration intake is below target (1800 ml/day). Drinking more water supports renal glucose clearance.');
  }

  // Prepare Chart.js Data
  const sortedLogs = [...logs].reverse(); // oldest to newest for graph
  const chartLabels = sortedLogs.map(l => `${l.date.slice(5)} (${l.time})`);
  const sugarData = sortedLogs.map(l => l.bloodSugar);
  const waterData = sortedLogs.map(l => l.waterIntake);
  const exerciseData = sortedLogs.map(l => l.exerciseMins);
  const sleepData = sortedLogs.map(l => l.sleepHours);

  // Glucose Line Chart Config
  const glucoseChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Blood Glucose (mg/dL)',
        data: sugarData,
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.15)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: sugarData.map(v => (v > 180 ? '#ef4444' : v < 70 ? '#f59e0b' : '#10b981')),
        pointRadius: 5,
      },
    ],
  };

  const glucoseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#334155', font: { size: 12, weight: 'bold' as const } } },
      tooltip: { backgroundColor: '#0f172a', titleColor: '#38bdf8', bodyColor: '#f1f5f9' },
    },
    scales: {
      x: { ticks: { color: '#475569', font: { size: 10, weight: 'bold' as const } }, grid: { color: '#cbd5e1' } },
      y: { ticks: { color: '#475569', font: { weight: 'bold' as const } }, grid: { color: '#cbd5e1' }, min: 50, max: 240 },
    },
  };

  // Lifestyle Multi Bar Chart Config
  const lifestyleChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Water Intake (ml)',
        data: waterData,
        backgroundColor: '#0284c7',
        borderRadius: 4,
      },
      {
        label: 'Exercise (mins)',
        data: exerciseData,
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Sleep (hours)',
        data: sleepData.map(s => s * 100), // scale for visual comparison
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg text-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold mb-2 shadow-xs">
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Type 2 Diabetes Self-Care</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {t(language, 'diabetes.title')}
          </h2>
          <p className="text-xs text-slate-600 max-w-xl font-medium">
            {t(language, 'diabetes.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          id="add-glucose-log-btn"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>{t(language, 'diabetes.logGlucose')}</span>
        </button>
      </div>

      {/* Health Nudges & Automated Trend Warnings */}
      {nudges.length > 0 && (
        <div className="space-y-2">
          {nudges.map((nudge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-2xl bg-amber-100/80 backdrop-blur-md border border-amber-300 text-amber-950 text-xs shadow-xs font-semibold"
            >
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1 font-medium">{nudge}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart.js Trends & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Glucose Line Graph */}
        <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-4 shadow-lg text-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Daily Glucose Readings (mg/dL)</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Target Range: 70 - 180 mg/dL</p>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs">
              Avg: {avgGlucose} mg/dL
            </span>
          </div>

          <div className="h-64 relative">
            <Line data={glucoseChartData} options={glucoseChartOptions} />
          </div>
        </div>

        {/* Lifestyle Multi-Bar Graph */}
        <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-4 shadow-lg text-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Lifestyle & Hydration Analytics</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Water (ml), Exercise (mins), Sleep (x10 hrs)</p>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-2xs">
              7-Day Activity
            </span>
          </div>

          <div className="h-64 relative">
            <Bar data={lifestyleChartData} options={glucoseChartOptions} />
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-4 shadow-lg text-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">{t(language, 'diabetes.historyHeader')}</h3>
          <span className="text-xs font-bold text-slate-500">{logs.length} Total Logs Saved</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-white/60 text-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Date & Time</th>
                <th className="p-3">Glucose</th>
                <th className="p-3">Timing</th>
                <th className="p-3">Water</th>
                <th className="p-3">Exercise</th>
                <th className="p-3">Medication</th>
                <th className="p-3">Mood</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{log.date} {log.time}</td>
                  <td className="p-3">
                    <span className={`font-extrabold px-2 py-0.5 rounded-full ${
                      log.bloodSugar > 180 ? 'bg-rose-100 text-rose-800' : log.bloodSugar < 70 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.bloodSugar} mg/dL
                    </span>
                  </td>
                  <td className="p-3 capitalize font-medium">{log.timing.replace('_', ' ')}</td>
                  <td className="p-3 font-medium">{log.waterIntake} ml</td>
                  <td className="p-3 font-medium">{log.exerciseMins} mins</td>
                  <td className="p-3 font-medium">
                    {log.medicationTaken ? <span className="text-emerald-700 font-bold">✅ {log.medicationName}</span> : <span className="text-rose-600 font-bold">❌ Missed</span>}
                  </td>
                  <td className="p-3 capitalize font-medium">{log.mood}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Log Daily Glucose & Vitals</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-800 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    required
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Timing</label>
                  <select
                    value={timing}
                    onChange={(e) => setTiming(e.target.value as SugarTiming)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold cursor-pointer shadow-2xs"
                  >
                    <option value="fasting">Fasting</option>
                    <option value="post_meal">Post-Meal (2h)</option>
                    <option value="before_bed">Before Bed</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Meals & Carbohydrates Logged</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium shadow-2xs"
                  placeholder="e.g., Brown Rice, Dal, Salad"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Water Intake (ml)</label>
                  <input
                    type="number"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Exercise Duration (mins)</label>
                  <input
                    type="number"
                    value={exerciseMins}
                    onChange={(e) => setExerciseMins(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/60 border border-white rounded-2xl">
                <input
                  type="checkbox"
                  id="med-check"
                  checked={medicationTaken}
                  onChange={(e) => setMedicationTaken(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
                <label htmlFor="med-check" className="text-slate-800 font-semibold cursor-pointer">
                  Prescribed Medication Taken Today ({medicationName})
                </label>
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
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold cursor-pointer shadow-md"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
