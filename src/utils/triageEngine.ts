import { Vitals, TriageResult } from '../types';

interface SymptomAnalysisInput {
  query: string;
  vitals?: Vitals;
}

export function analyzeSymptoms({ query, vitals }: SymptomAnalysisInput): TriageResult {
  const text = query.toLowerCase();
  const redFlags: string[] = [];
  const actionSteps: string[] = [];
  const followUps: string[] = [];

  // 1. Scan Vitals for Red Flags
  if (vitals) {
    if (vitals.oxygenSat && vitals.oxygenSat < 90) {
      redFlags.push(`Critical Hypoxia: Oxygen Saturation is ${vitals.oxygenSat}% (Normal > 95%)`);
    }
    if (vitals.systolic && vitals.systolic >= 180) {
      redFlags.push(`Hypertensive Crisis: Systolic Blood Pressure is ${vitals.systolic} mmHg (Threshold >= 180)`);
    }
    if (vitals.diastolic && vitals.diastolic >= 120) {
      redFlags.push(`Hypertensive Crisis: Diastolic Blood Pressure is ${vitals.diastolic} mmHg (Threshold >= 120)`);
    }
    if (vitals.bloodSugar) {
      if (vitals.bloodSugar < 60) {
        redFlags.push(`Severe Hypoglycemia: Blood Glucose is ${vitals.bloodSugar} mg/dL (Requires fast-acting carbs)`);
      } else if (vitals.bloodSugar >= 300) {
        redFlags.push(`Severe Hyperglycemia / Potential DKA Risk: Blood Glucose is ${vitals.bloodSugar} mg/dL`);
      }
    }
    if (vitals.temperature && vitals.temperature >= 103.5) {
      redFlags.push(`High Hyperpyrexia: Temperature is ${vitals.temperature}°F`);
    }
    if (vitals.heartRate) {
      if (vitals.heartRate > 130) {
        redFlags.push(`Severe Tachycardia: Heart rate is ${vitals.heartRate} bpm at rest`);
      } else if (vitals.heartRate < 45) {
        redFlags.push(`Severe Bradycardia: Heart rate is ${vitals.heartRate} bpm`);
      }
    }
  }

  // 2. Scan Text for Textual Red Flags
  const redFlagKeywords = [
    { kw: ['chest pain', 'chest pressure', 'tightness in chest', 'radiating to arm', 'heart attack'], label: 'Chest pain or crushing pressure radiating to jaw, neck, or left arm' },
    { kw: ['shortness of breath', 'can\'t breathe', 'difficulty breathing', 'gasping', 'stridor', 'severe breathlessness'], label: 'Severe respiratory distress / dyspnea' },
    { kw: ['stroke', 'face drooping', 'slurred speech', 'arm weakness', 'numbness on one side', 'loss of vision'], label: 'Stroke alert (FAST symptoms: Face drooping, Arm weakness, Speech difficulty)' },
    { kw: ['unconscious', 'fainted', 'passed out', 'unresponsive', 'blackout'], label: 'Loss of consciousness / syncope' },
    { kw: ['severe bleeding', 'coughing blood', 'vomiting blood', 'hemorrhage'], label: 'Uncontrolled hemorrhage / active internal bleeding' },
    { kw: ['seizure', 'convulsions', 'epileptic fit'], label: 'Seizure activity or altered mental status' },
    { kw: ['stiff neck', 'neck stiffness'], label: 'High fever combined with nuchal rigidity (Meningitis warning)' },
  ];

  for (const rf of redFlagKeywords) {
    if (rf.kw.some(k => text.includes(k))) {
      redFlags.push(rf.label);
    }
  }

  // If ANY Critical Red Flag exists -> Instant EMERGENCY output
  if (redFlags.length > 0) {
    return {
      level: 'emergency',
      title: '🔴 IMMEDIATE EMERGENCY EVALUATION REQUIRED',
      confidence: 96,
      summary: 'Critical medical red flags or abnormal vitals were detected requiring immediate urgent care.',
      explanation: `Clinical rule-based analysis identified high-risk indicators (${redFlags.length} active red flags) that cannot be safely managed at home.`,
      actionSteps: [
        'Call 911 or emergency medical services immediately.',
        'Do not drive yourself to the hospital; await paramedics or use emergency transit.',
        'If chest pain is present, remain seated, loosen tight clothing, and stay calm.',
        'If experiencing hypoglycemia (<60 mg/dL) while conscious, consume 15-20g of fast-acting glucose (e.g. 4 oz fruit juice or 3-4 glucose tablets).',
        'Have a list of your current medications and emergency contacts ready for paramedics.',
      ],
      redFlags,
      followUps: [
        'Are paramedics on their way?',
        'Are you experiencing nausea, sweating, or lightheadedness along with these symptoms?',
      ],
      disclaimer: 'CRITICAL ALERT: This AI rule engine identified emergency symptoms. Seek immediate medical attention at the nearest Emergency Department.',
    };
  }

  // 3. Scan for Moderate / Consult Doctor Symptoms
  const consultKeywords = [
    'fever', 'persistent cough', 'wheezing', 'abdominal pain', 'stomach ache', 
    'frequent urination', 'burning urination', 'ear pain', 'deep cut', 
    'joint swelling', 'unexplained weight loss', 'persistent diarrhea', 
    'high blood sugar', 'blurred vision', 'dizziness', 'migraine'
  ];

  const matchedConsult = consultKeywords.filter(k => text.includes(k));

  if (matchedConsult.length > 0 || (vitals?.bloodSugar && (vitals.bloodSugar > 180 || vitals.bloodSugar < 70)) || (vitals?.temperature && vitals.temperature >= 100.4)) {
    actionSteps.push('Schedule an appointment with your primary care provider or endocrinologist within 24-48 hours.');
    actionSteps.push('Monitor your vitals every 4 hours and record them in the Diabetes & Vitals tracker.');
    actionSteps.push('Stay hydrated with water and oral rehydration salts if feeling fatigued.');
    actionSteps.push('Avoid strenuous exercise until evaluated by a clinician.');

    if (vitals?.bloodSugar && vitals.bloodSugar > 180) {
      actionSteps.push('Administer prescribed insulin or medication according to your clinician\'s dosage plan.');
    }

    return {
      level: 'consult',
      title: '🟡 CONSULT DOCTOR WITHIN 24-48 HOURS',
      confidence: 91,
      summary: 'Symptoms or vital metrics indicate a moderate health issue that warrants clinical consultation.',
      explanation: `Analysis detected active clinical symptoms (${matchedConsult.join(', ') || 'sub-optimal vitals'}) requiring medical assessment to prevent escalation.`,
      actionSteps,
      redFlags: [
        'Chest discomfort or pressure',
        'Inability to keep liquids down for more than 12 hours',
        'Sudden severe spike in blood glucose (>250 mg/dL) with ketones',
      ],
      followUps: [
        'How many days have you had these symptoms?',
        'Have you taken any over-the-counter fever or pain medications today?',
        'What was your latest blood sugar reading?',
      ],
      disclaimer: 'Medical Disclaimer: Non-emergency clinical evaluation recommended within 48 hours. Contact your healthcare provider.',
    };
  }

  // 4. Default / Mild Symptoms -> Home Care
  return {
    level: 'home',
    title: '🟢 HOME CARE & SELF-MONITORING',
    confidence: 89,
    summary: 'Symptoms appear mild and consistent with routine self-limiting conditions or minor fatigue.',
    explanation: 'No emergency red flags or severe vital abnormalities were detected. Safe for conservative home management with active symptom tracking.',
    actionSteps: [
      'Get ample rest and ensure 7-8 hours of sound sleep.',
      'Maintain hydration target of 2.0 - 2.5 liters of clean water daily.',
      'Log your meals and blood glucose twice daily to monitor stability.',
      'Use mild saline gargles or warm compresses if experiencing mild upper respiratory congestion or muscle strain.',
      'Re-assess symptoms in 24 hours or sooner if new symptoms develop.',
    ],
    redFlags: [
      'Development of high fever (>102°F)',
      'Sudden onset of shortness of breath or chest pain',
      'Blood glucose consistently remaining above 200 mg/dL',
    ],
    followUps: [
      'Would you like to log your morning blood sugar in the Diabetes Manager?',
      'Have you been drinking enough water today?',
    ],
    disclaimer: 'Medical Disclaimer: This self-care advice is for informational guidance only. Consult a doctor if symptoms worsen.',
  };
}
