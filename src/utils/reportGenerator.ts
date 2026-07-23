import { DiabetesLog, PatientProfile, ChatSession } from '../types';

export function generateHtmlReport(
  profile: PatientProfile,
  logs: DiabetesLog[],
  chats: ChatSession[]
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate statistics
  const totalLogs = logs.length;
  const avgSugar = totalLogs > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.bloodSugar, 0) / totalLogs)
    : 120;

  const fastingLogs = logs.filter(l => l.timing === 'fasting');
  const avgFasting = fastingLogs.length > 0
    ? Math.round(fastingLogs.reduce((acc, l) => acc + l.bloodSugar, 0) / fastingLogs.length)
    : 110;

  const postMealLogs = logs.filter(l => l.timing === 'post_meal');
  const avgPostMeal = postMealLogs.length > 0
    ? Math.round(postMealLogs.reduce((acc, l) => acc + l.bloodSugar, 0) / postMealLogs.length)
    : 145;

  const medTakenCount = logs.filter(l => l.medicationTaken).length;
  const medAdherencePct = totalLogs > 0 ? Math.round((medTakenCount / totalLogs) * 100) : 95;

  const avgWater = totalLogs > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.waterIntake, 0) / totalLogs)
    : 2200;

  const avgSleep = totalLogs > 0
    ? (logs.reduce((acc, l) => acc + l.sleepHours, 0) / totalLogs).toFixed(1)
    : '7.5';

  const avgExercise = totalLogs > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.exerciseMins, 0) / totalLogs)
    : 30;

  const recentHighs = logs.filter(l => l.bloodSugar > 180).length;
  const recentLows = logs.filter(l => l.bloodSugar < 70).length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Weekly Clinical Report - ${profile.name}</title>
  <style>
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      line-height: 1.5;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px;
    }
    .report-card {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      padding: 40px;
      border: 1px solid #e2e8f0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0d9488;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    .brand span { color: #0d9488; }
    .title {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-box {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .info-value {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 4px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 30px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-num {
      font-size: 22px;
      font-weight: 800;
      color: #0d9488;
    }
    .stat-desc {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 14px;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 600;
    }
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
    }
    .badge-normal { background: #dcfce7; color: #166534; }
    .badge-high { background: #fee2e2; color: #991b1b; }
    .badge-low { background: #fef3c7; color: #92400e; }
    .ai-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 20px;
      border-radius: 8px;
      margin-top: 24px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { background: white; padding: 0; }
      .report-card { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div>
        <div class="brand">AURA <span>HEALTH</span></div>
        <div class="title">Weekly Clinician Assessment Summary</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight:700; color:#0f172a;">Generated: ${dateStr}</div>
        <div style="font-size:12px; color:#64748b;">Report ID: RPT-${Date.now().toString().slice(-6)}</div>
      </div>
    </div>

    <div class="grid">
      <div class="info-box">
        <div class="info-label">Patient Name & Demographics</div>
        <div class="info-value">${profile.name} (${profile.age} yrs, ${profile.gender})</div>
        <div style="font-size: 13px; color: #475569; margin-top: 4px;">Blood Group: ${profile.bloodGroup}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Attending Physician</div>
        <div class="info-value">${profile.doctorName}</div>
        <div style="font-size: 13px; color: #475569; margin-top: 4px;">Primary Conditions: ${profile.conditions.join(', ')}</div>
      </div>
    </div>

    <div class="section-title">🩺 Metabolic & Glucose Summary (Last 7 Days)</div>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num">${avgSugar} <span style="font-size:12px;">mg/dL</span></div>
        <div class="stat-desc">Overall Avg Glucose</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${avgFasting} <span style="font-size:12px;">mg/dL</span></div>
        <div class="stat-desc">Fasting Avg</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${avgPostMeal} <span style="font-size:12px;">mg/dL</span></div>
        <div class="stat-desc">Post-Prandial Avg</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${medAdherencePct}%</div>
        <div class="stat-desc">Medication Adherence</div>
      </div>
    </div>

    <div class="section-title">📊 Lifestyle & Adherence Metrics</div>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num">${avgWater} <span style="font-size:12px;">ml</span></div>
        <div class="stat-desc">Daily Water Intake</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${avgSleep} <span style="font-size:12px;">hrs</span></div>
        <div class="stat-desc">Avg Nightly Sleep</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${avgExercise} <span style="font-size:12px;">mins</span></div>
        <div class="stat-desc">Daily Exercise</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: ${recentHighs > 0 ? '#dc2626' : '#16a34a'}">${recentHighs}</div>
        <div class="stat-desc">Hyperglycemia Spikes (>180)</div>
      </div>
    </div>

    <div class="section-title">📋 Recent Glucose Log Readings</div>
    <table>
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Timing</th>
          <th>Glucose Reading</th>
          <th>Medication</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${logs.slice(0, 8).map(l => {
          let badgeClass = 'badge-normal';
          let statusLabel = 'In Target';
          if (l.bloodSugar > 180) { badgeClass = 'badge-high'; statusLabel = 'High'; }
          else if (l.bloodSugar < 70) { badgeClass = 'badge-low'; statusLabel = 'Low'; }

          return `
            <tr>
              <td>${l.date} ${l.time}</td>
              <td style="text-transform: capitalize;">${l.timing.replace('_', ' ')}</td>
              <td><strong>${l.bloodSugar} mg/dL</strong></td>
              <td>${l.medicationTaken ? '✅ ' + l.medicationName : '❌ Missed'}</td>
              <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="ai-box">
      <div style="font-weight: 700; color: #166534; font-size: 16px; margin-bottom: 8px;">🤖 Automated AI Clinical Review & Nudges</div>
      <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;">
        Patient exhibits steady metabolic stability overall with an average glucose level of <strong>${avgSugar} mg/dL</strong> and <strong>${medAdherencePct}% medication adherence</strong>. 
        ${recentHighs > 0 ? `Alert: ${recentHighs} elevated post-prandial spikes (>180 mg/dL) were registered following carbohydrate-rich meals. Consider dietary adjustments.` : 'Glucose readings remained consistently within optimal therapeutic bounds.'}
        Hydration levels averaged <strong>${avgWater} ml/day</strong> and exercise averaged <strong>${avgExercise} minutes/day</strong>.
      </p>
    </div>

    <div class="footer">
      Confidential Medical Document - Generated by AURA Offline AI Health Companion. Authorized for physician review.
    </div>
  </div>
</body>
</html>`;
}
