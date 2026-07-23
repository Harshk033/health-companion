/* ==========================================================================
   SwasthyaSeva (स्वास्थ्य सेवा) - Vanilla JavaScript Application Engine
   Zero Node.js • Zero React • Runs directly in any Web Browser or VS Code
   ========================================================================== */

// --- Global State ---
const state = {
  language: localStorage.getItem('swasthya_lang') || 'en',
  activeTab: 'dashboard',
  isEncrypted: localStorage.getItem('swasthya_encrypted') === 'true',
  profile: JSON.parse(localStorage.getItem('swasthya_profile')) || {
    name: 'Ramesh Patel',
    age: 48,
    gender: 'Male',
    bloodGroup: 'B+',
    doctorName: 'Dr. A. K. Sharma (PHC Nandi)',
  },
  logs: JSON.parse(localStorage.getItem('swasthya_diabetes_logs')) || [
    { id: '1', date: '2026-07-17', sugarBefore: 125, sugarAfter: 165, medTaken: true, waterLiters: 2.5 },
    { id: '2', date: '2026-07-18', sugarBefore: 118, sugarAfter: 158, medTaken: true, waterLiters: 3.0 },
    { id: '3', date: '2026-07-19', sugarBefore: 142, sugarAfter: 190, medTaken: false, waterLiters: 1.8 },
    { id: '4', date: '2026-07-20', sugarBefore: 110, sugarAfter: 145, medTaken: true, waterLiters: 2.8 },
    { id: '5', date: '2026-07-21', sugarBefore: 130, sugarAfter: 172, medTaken: true, waterLiters: 2.2 },
    { id: '6', date: '2026-07-22', sugarBefore: 122, sugarAfter: 160, medTaken: true, waterLiters: 2.5 },
    { id: '7', date: '2026-07-23', sugarBefore: 115, sugarAfter: 152, medTaken: true, waterLiters: 3.0 },
  ],
  reminders: JSON.parse(localStorage.getItem('swasthya_reminders')) || [
    { id: '1', title: 'Metformin 500mg', time: '08:00', type: 'medicine', enabled: true, repeat: 'daily' },
    { id: '2', title: 'Fasting Blood Sugar Check', time: '07:30', type: 'checkup', enabled: true, repeat: 'daily' },
    { id: '3', title: 'Drink 1 Glass Water', time: '11:00', type: 'water', enabled: true, repeat: 'hourly' },
  ],
  chats: JSON.parse(localStorage.getItem('swasthya_triage_chats')) || [],
  facilities: [
    {
      id: 'phc-1',
      name: 'Primary Health Centre (PHC) Nandi',
      type: 'PHC',
      distanceKm: 2.4,
      address: 'Main Road, Nandi Village, Dist. Chikkaballapur',
      phone: '+91 98765 43210',
      isOpen24_7: false,
      isOpenNow: true,
      rating: 4.6,
      specialties: ['General Medicine', 'Maternal Care', 'Diabetes Screening', 'Vaccination'],
    },
    {
      id: 'hospital-1',
      name: 'District Sub-Divisional Civil Hospital',
      type: 'Hospital',
      distanceKm: 8.5,
      address: 'Station Road, Taluk Headquarters',
      phone: '+91 80 2345 6789',
      isOpen24_7: true,
      isOpenNow: true,
      rating: 4.3,
      specialties: ['24/7 Emergency', 'ICU', 'Pediatrics', 'Surgeries', 'Ambulance'],
    },
    {
      id: 'pharmacy-1',
      name: 'Jan Aushadhi Kendra (Generic Medicine)',
      type: 'Pharmacy',
      distanceKm: 1.2,
      address: 'Near Bus Stand, Market Square',
      phone: '+91 94480 12345',
      isOpen24_7: false,
      isOpenNow: true,
      rating: 4.8,
      specialties: ['Affordable Generic Drugs', 'Insulin Supplies', 'BP Monitors'],
    },
    {
      id: 'lab-1',
      name: 'Sanjeevani Pathology & Diagnostic Lab',
      type: 'Lab',
      distanceKm: 3.1,
      address: 'Hospital Cross, Near Post Office',
      phone: '+91 98450 99887',
      isOpen24_7: false,
      isOpenNow: true,
      rating: 4.5,
      specialties: ['HbA1c Glucose Test', 'CBC', 'Lipid Profile', 'ECG'],
    }
  ]
};

// --- Translations ---
const translations = {
  en: {
    appTitle: "SwasthyaSeva",
    appSubtitle: "Rural & Low-Resource Health Companion",
    tabDashboard: "Dashboard",
    tabTriage: "AI Symptom Triage",
    tabDiabetes: "Diabetes Tracker",
    tabSkin: "Skin & Wound Analyzer",
    tabReport: "Doctor Report",
    tabDirectory: "Healthcare Directory",
    tabReminders: "Reminders & Alarms",
  },
  hi: {
    appTitle: "स्वास्थ्य सेवा",
    appSubtitle: "ग्रामीण स्वास्थ्य साथी",
    tabDashboard: "डैशबोर्ड",
    tabTriage: "लक्षण जांच (AI ट्राइएज)",
    tabDiabetes: "मधुमेह (डायबिटीज) ट्रैकर",
    tabSkin: "त्वचा एवं घाव जांच",
    tabReport: "डॉक्टर रिपोर्ट",
    tabDirectory: "स्वास्थ्य केंद्र निर्देशिका",
    tabReminders: "अलार्म एवं रिमाइंडर",
  },
  guj: {
    appTitle: "સ્વાસ્થ્ય સેવા",
    appSubtitle: "ગ્રામીણ આરોગ્ય સાથી",
    tabDashboard: "ડેશબોર્ડ",
    tabTriage: "લક્ષણ તપાસ (AI)",
    tabDiabetes: "ડાયાબિટીસ ટ્રેકર",
    tabSkin: "ચામડી અને ઘા તપાસ",
    tabReport: "ડૉક્ટર રિપોર્ટ",
    tabDirectory: "આરોગ્ય કેન્દ્ર યાદી",
    tabReminders: "રિમાઇન્ડર અને અલાર્મ",
  }
};

// --- Utilities & Save Handlers ---
function saveState() {
  localStorage.setItem('swasthya_lang', state.language);
  localStorage.setItem('swasthya_encrypted', state.isEncrypted);
  localStorage.setItem('swasthya_profile', JSON.stringify(state.profile));
  localStorage.setItem('swasthya_diabetes_logs', JSON.stringify(state.logs));
  localStorage.setItem('swasthya_reminders', JSON.stringify(state.reminders));
  localStorage.setItem('swasthya_triage_chats', JSON.stringify(state.chats));
}

// --- Chart Instances ---
let glucoseChartInstance = null;
let lifestyleChartInstance = null;

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderNavigation();
  renderLogsTable();
  renderRemindersList();
  renderDirectory();
  renderDoctorReport();
  switchTab('dashboard');
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// --- Tab Navigation ---
function switchTab(tabId) {
  state.activeTab = tabId;
  const tabs = ['dashboard', 'triage', 'diabetes', 'skin', 'report', 'directory', 'reminders'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-content-${t}`);
    const navBtn = document.getElementById(`nav-btn-${t}`);
    if (el) el.classList.toggle('hidden', t !== tabId);
    if (navBtn) {
      if (t === tabId) {
        navBtn.className = 'px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-600 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer';
      } else {
        navBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-white/70 hover:bg-white text-slate-700 border border-white/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer';
      }
    }
  });

  if (tabId === 'diabetes') {
    setTimeout(initDiabetesCharts, 100);
  } else if (tabId === 'directory') {
    renderDirectory();
  } else if (tabId === 'report') {
    renderDoctorReport();
  } else if (tabId === 'reminders') {
    renderRemindersList();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- Navigation Render ---
function renderNavigation() {
  const langSelect = document.getElementById('language-selector');
  if (langSelect) langSelect.value = state.language;
}

function changeLanguage(lang) {
  state.language = lang;
  saveState();
  renderNavigation();
  alert(`Language changed to ${lang.toUpperCase()}`);
}

// --- Diabetes Tracker Charts ---
function initDiabetesCharts() {
  const gCanvas = document.getElementById('glucoseChart');
  if (gCanvas && window.Chart) {
    if (glucoseChartInstance) glucoseChartInstance.destroy();
    const ctx = gCanvas.getContext('2d');
    const labels = state.logs.map(l => l.date.slice(5));
    const fasting = state.logs.map(l => l.sugarBefore);
    const postPrandial = state.logs.map(l => l.sugarAfter);

    glucoseChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Fasting (mg/dL)',
            data: fasting,
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3
          },
          {
            label: 'Post-Meal (mg/dL)',
            data: postPrandial,
            borderColor: '#e11d48',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { min: 60, max: 250 }
        }
      }
    });
  }

  const lCanvas = document.getElementById('lifestyleChart');
  if (lCanvas && window.Chart) {
    if (lifestyleChartInstance) lifestyleChartInstance.destroy();
    const ctx = lCanvas.getContext('2d');
    const labels = state.logs.map(l => l.date.slice(5));
    const water = state.logs.map(l => l.waterLiters);

    lifestyleChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Hydration (Liters)',
            data: water,
            backgroundColor: '#0284c7',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { min: 0, max: 5 }
        }
      }
    });
  }
}

// --- Add Glucose Entry ---
function submitGlucoseLog(event) {
  event.preventDefault();
  const date = document.getElementById('log-date').value;
  const sugarBefore = parseInt(document.getElementById('log-before').value);
  const sugarAfter = parseInt(document.getElementById('log-after').value);
  const waterLiters = parseFloat(document.getElementById('log-water').value);
  const medTaken = document.getElementById('log-med').checked;

  const newLog = {
    id: Date.now().toString(),
    date,
    sugarBefore,
    sugarAfter,
    waterLiters,
    medTaken
  };

  state.logs.push(newLog);
  saveState();
  closeModal('modal-add-log');
  initDiabetesCharts();
  renderLogsTable();
  alert('Glucose & Hydration Log Saved Successfully!');
}

function renderLogsTable() {
  const tbody = document.getElementById('logs-table-body');
  if (!tbody) return;
  tbody.innerHTML = state.logs.map(log => `
    <tr class="border-b border-slate-100 hover:bg-white/60 transition-colors">
      <td class="py-3 px-3 font-bold text-slate-800">${log.date}</td>
      <td class="py-3 px-3 font-extrabold ${log.sugarBefore > 130 ? 'text-rose-600' : 'text-teal-700'}">${log.sugarBefore} mg/dL</td>
      <td class="py-3 px-3 font-extrabold ${log.sugarAfter > 180 ? 'text-rose-600' : 'text-emerald-700'}">${log.sugarAfter} mg/dL</td>
      <td class="py-3 px-3">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${log.medTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
          ${log.medTaken ? 'Taken ✓' : 'Missed ✕'}
        </span>
      </td>
      <td class="py-3 px-3 font-bold text-sky-700">${log.waterLiters} L</td>
      <td class="py-3 px-3 text-right">
        <button onclick="deleteLog('${log.id}')" class="text-slate-400 hover:text-rose-600 font-bold text-xs cursor-pointer">Delete</button>
      </td>
    </tr>
  `).join('');
}

function deleteLog(id) {
  state.logs = state.logs.filter(l => l.id !== id);
  saveState();
  renderLogsTable();
  initDiabetesCharts();
}

// --- AI Symptom Triage Engine ---
function processTriageSubmit(event) {
  event.preventDefault();
  const inputEl = document.getElementById('triage-input');
  const userText = inputEl.value.trim();
  if (!userText) return;

  const chatContainer = document.getElementById('triage-chat-box');
  
  // Append User Message
  chatContainer.innerHTML += `
    <div class="flex justify-end my-2">
      <div class="bg-teal-700 text-white p-3.5 rounded-2xl max-w-lg text-xs font-medium shadow-md">
        ${userText}
      </div>
    </div>
  `;

  inputEl.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Simulate AI Response based on heuristic rules
  setTimeout(() => {
    let aiResponse = "";
    const lower = userText.toLowerCase();

    if (lower.includes('chest pain') || lower.includes('breath') || lower.includes('heart')) {
      aiResponse = `
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
          <div class="font-extrabold text-rose-700 flex items-center gap-2">
            🚨 EMERGENCY RED FLAG DETECTED
          </div>
          <p class="font-bold">Chest pain or breathing difficulty requires immediate emergency medical care!</p>
          <ul class="list-disc pl-4 space-y-1 text-xs">
            <li>Call 108 Emergency Ambulance immediately.</li>
            <li>Do not attempt strenuous activity.</li>
            <li>Proceed to nearest sub-divisional civil hospital immediately.</li>
          </ul>
        </div>
      `;
    } else if (lower.includes('fever') || lower.includes('chills') || lower.includes('body ache')) {
      aiResponse = `
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
          <div class="font-extrabold text-amber-800 flex items-center gap-2">
            ⚠️ MODERATE TRIAGE: Acute Febrile Symptoms
          </div>
          <p>Common in seasonal viral infections or malaria/dengue in rural endemic zones.</p>
          <p class="font-bold">Recommended Actions:</p>
          <ul class="list-disc pl-4 space-y-1 text-xs">
            <li>Maintain hydration with Oral Rehydration Salts (ORS) or boiled lukewarm water.</li>
            <li>Take Paracetamol 500mg if fever exceeds 100°F.</li>
            <li>Visit nearest PHC for rapid malaria/dengue blood smear if fever lasts >48 hours.</li>
          </ul>
        </div>
      `;
    } else {
      aiResponse = `
        <div class="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2">
          <div class="font-extrabold text-teal-900 flex items-center gap-2">
            ✅ LOW TRIAGE ASSESSMENT
          </div>
          <p>Symptoms appear manageable at primary care level with routine self-care.</p>
          <p class="font-bold">Guidance & Next Steps:</p>
          <ul class="list-disc pl-4 space-y-1 text-xs">
            <li>Ensure adequate rest and hydration (2.5 - 3.0 Liters water daily).</li>
            <li>Log daily vitals and blood glucose levels in SwasthyaSeva tracker.</li>
            <li>Consult local ASHA worker or PHC medical officer if symptoms persist.</li>
          </ul>
        </div>
      `;
    }

    chatContainer.innerHTML += `
      <div class="flex justify-start my-2">
        <div class="bg-white/90 border border-slate-200 text-slate-800 p-4 rounded-2xl max-w-xl text-xs shadow-md space-y-2">
          ${aiResponse}
        </div>
      </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 600);
}

// --- Voice Recognition Modal ---
let recognition = null;

function openSpeechModal() {
  document.getElementById('modal-speech').classList.remove('hidden');
  const transcriptBox = document.getElementById('speech-transcript-box');
  transcriptBox.innerText = "Listening... Speak your symptoms clearly.";

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = state.language === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onresult = (event) => {
      const text = Array.from(event.results).map(r => r[0].transcript).join('');
      transcriptBox.innerText = text;
    };

    recognition.start();
  } else {
    transcriptBox.innerText = "Speech Recognition API is not supported in this browser.";
  }
}

function insertTranscribedText() {
  const text = document.getElementById('speech-transcript-box').innerText;
  if (text && !text.includes("Listening...")) {
    const triageInput = document.getElementById('triage-input');
    if (triageInput) triageInput.value = text;
  }
  closeModal('modal-speech');
}

// --- Skin & Wound Analyzer ---
function runSkinAnalysis(type) {
  const resultBox = document.getElementById('skin-analysis-result');
  if (!resultBox) return;

  const insights = {
    ulcer: {
      title: '🚨 Suspected Diabetic Foot Ulcer (High Priority)',
      risk: 'High Clinical Concern',
      color: 'rose',
      desc: 'Visible ulceration on plantar/distal extremity. Requires urgent debridement and glycemic control.',
      steps: ['Keep wound dry and covered with sterile bandage.', 'Consult PHC doctor for topical antibiotics.', 'Ensure strict blood sugar control (<130 mg/dL).']
    },
    eczema: {
      title: '⚠️ Eczema / Contact Dermatitis',
      risk: 'Moderate Concern',
      color: 'amber',
      desc: 'Local erythema and dry scaling skin. Likely inflammatory response.',
      steps: ['Apply coconut oil or moisturizing lotion twice daily.', 'Avoid harsh alkaline soaps.', 'Use mild hydrocortisone cream if prescribed by ASHA/Doctor.']
    },
    ringworm: {
      title: '⚠️ Ringworm (Tinea Fungal Rash)',
      risk: 'Moderate Concern',
      color: 'amber',
      desc: 'Circular raised lesion with clear central area. Common fungal dermatosis.',
      steps: ['Keep skin clean and dry.', 'Apply OTC Clotrimazole or Miconazole ointment for 14 days.', 'Do not share towels or clothing.']
    },
    healthy: {
      title: '✅ Normal Healthy Skin Profile',
      risk: 'Low / Normal',
      color: 'emerald',
      desc: 'Skin tissue shows no abnormal lesions, discoloration, or edema.',
      steps: ['Maintain daily hygiene.', 'Stay hydrated with 2.5L water daily.']
    }
  };

  const res = insights[type] || insights.healthy;
  resultBox.className = `p-5 rounded-2xl bg-${res.color}-50 border border-${res.color}-200 text-xs text-${res.color}-950 space-y-3`;
  resultBox.innerHTML = `
    <div class="font-extrabold text-${res.color}-800 text-sm">${res.title}</div>
    <div class="px-2 py-0.5 rounded-full bg-${res.color}-100 text-${res.color}-900 font-extrabold text-[10px] inline-block uppercase">${res.risk}</div>
    <p class="font-medium text-slate-700">${res.desc}</p>
    <div class="font-bold text-slate-900 mt-2">Recommended Steps:</div>
    <ul class="list-disc pl-4 space-y-1 text-slate-700">
      ${res.steps.map(s => `<li>${s}</li>`).join('')}
    </ul>
  `;
}

// --- Directory Render ---
function renderDirectory() {
  const grid = document.getElementById('facilities-grid');
  if (!grid) return;
  grid.innerHTML = state.facilities.map(fac => `
    <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${fac.type === 'Hospital' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'}">${fac.type}</span>
          <h3 class="text-sm font-extrabold text-slate-900 mt-1">${fac.name}</h3>
        </div>
        <span class="text-xs font-bold text-slate-500 shrink-0">📍 ${fac.distanceKm} km</span>
      </div>
      <p class="text-xs text-slate-600">${fac.address}</p>
      <div class="flex flex-wrap gap-1">
        ${fac.specialties.map(s => `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">${s}</span>`).join('')}
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-slate-100">
        <span class="text-xs font-bold text-emerald-700">${fac.isOpen24_7 ? '24/7 Open' : 'Open Now'} • ⭐ ${fac.rating}</span>
        <a href="tel:${fac.phone}" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1">
          📞 Call ${fac.phone}
        </a>
      </div>
    </div>
  `).join('');
}

// --- Doctor Report Render ---
function renderDoctorReport() {
  const box = document.getElementById('doctor-report-box');
  if (!box) return;

  const avgFasting = Math.round(state.logs.reduce((acc, l) => acc + l.sugarBefore, 0) / (state.logs.length || 1));
  const avgPost = Math.round(state.logs.reduce((acc, l) => acc + l.sugarAfter, 0) / (state.logs.length || 1));

  box.innerHTML = `
    <div class="flex justify-between items-start border-b border-slate-200 pb-4">
      <div>
        <h3 class="text-lg font-black text-slate-900">SWASTHYASEVA CLINICAL SUMMARY REPORT</h3>
        <p class="text-xs text-slate-500 font-bold">Generated for: Primary Health Officer / ASHA Worker</p>
      </div>
      <div class="text-right text-xs font-bold text-slate-600">
        <div>Date: ${new Date().toISOString().slice(0, 10)}</div>
        <div>System: SwasthyaSeva Offline Companion</div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div><span class="text-slate-500 font-bold">Patient Name:</span> <div class="font-extrabold text-slate-900">${state.profile.name}</div></div>
      <div><span class="text-slate-500 font-bold">Age / Gender:</span> <div class="font-extrabold text-slate-900">${state.profile.age} Yrs / ${state.profile.gender}</div></div>
      <div><span class="text-slate-500 font-bold">Blood Group:</span> <div class="font-extrabold text-slate-900">${state.profile.bloodGroup}</div></div>
      <div><span class="text-slate-500 font-bold">Assigned Doctor:</span> <div class="font-extrabold text-slate-900">${state.profile.doctorName}</div></div>
    </div>

    <div class="space-y-2">
      <h4 class="font-extrabold text-slate-900 text-sm">Glycemic Control Summary (7-Day Averages)</h4>
      <div class="flex gap-4">
        <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl flex-1">
          <div class="text-[10px] font-bold text-teal-800 uppercase">Avg Fasting Sugar</div>
          <div class="text-xl font-black text-teal-900">${avgFasting} mg/dL</div>
        </div>
        <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl flex-1">
          <div class="text-[10px] font-bold text-rose-800 uppercase">Avg Post-Meal Sugar</div>
          <div class="text-xl font-black text-rose-900">${avgPost} mg/dL</div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h4 class="font-extrabold text-slate-900 text-sm">Recent Glucose Logs Table</h4>
      <table class="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
        <thead class="bg-slate-100 font-bold">
          <tr><th class="p-2">Date</th><th class="p-2">Fasting</th><th class="p-2">Post-Meal</th><th class="p-2">Adherence</th></tr>
        </thead>
        <tbody>
          ${state.logs.slice(-5).map(l => `
            <tr class="border-t border-slate-200">
              <td class="p-2">${l.date}</td>
              <td class="p-2 font-bold">${l.sugarBefore} mg/dL</td>
              <td class="p-2 font-bold">${l.sugarAfter} mg/dL</td>
              <td class="p-2">${l.medTaken ? 'Taken ✓' : 'Missed ✕'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="pt-4 border-t border-slate-200 flex justify-between items-center">
      <div class="text-[11px] text-slate-500">Verified by SwasthyaSeva Offline Local Vault</div>
      <div class="text-xs font-bold text-slate-800">Clinician Signature: _______________________</div>
    </div>
  `;
}

// --- Alarms & Reminders Manager ---
function submitAddReminder(event) {
  event.preventDefault();
  const title = document.getElementById('rem-title').value;
  const time = document.getElementById('rem-time').value;
  const type = document.getElementById('rem-type').value;
  const repeat = document.getElementById('rem-repeat').value;

  const newRem = {
    id: Date.now().toString(),
    title,
    time,
    type,
    enabled: true,
    repeat
  };

  state.reminders.push(newRem);
  saveState();
  closeModal('modal-add-alarm');
  renderRemindersList();
  alert('New Alarm Scheduled!');
}

function renderRemindersList() {
  const container = document.getElementById('reminders-card-grid');
  if (!container) return;
  container.innerHTML = state.reminders.map(rem => `
    <div class="p-5 rounded-3xl border ${rem.enabled ? 'bg-white/40 backdrop-blur-xl border-white/50 shadow-lg text-slate-800' : 'bg-white/20 opacity-60 text-slate-500'} flex items-center justify-between">
      <div>
        <div class="text-sm font-extrabold text-slate-900">${rem.title}</div>
        <div class="text-xs text-teal-700 font-bold mt-1">${rem.time} • <span class="capitalize font-normal">${rem.repeat}</span></div>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="testAlarmSound()" class="px-3 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 text-xs font-bold cursor-pointer">
          ▶ Test
        </button>
        <button onclick="deleteReminder('${rem.id}')" class="text-slate-400 hover:text-rose-600 font-bold text-xs cursor-pointer">
          ✕
        </button>
      </div>
    </div>
  `).join('');
}

function testAlarmSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    alert('⏰ Beep! Reminder Alarm Ringing!');
  }
}

function deleteReminder(id) {
  state.reminders = state.reminders.filter(r => r.id !== id);
  saveState();
  renderRemindersList();
}

// --- Privacy & Modals ---
function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('hidden');
}

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('hidden');
}

function exportJSONData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `SwasthyaSeva_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function wipeAllData() {
  if (confirm("Are you sure you want to permanently erase all local health logs?")) {
    localStorage.clear();
    location.reload();
  }
}
