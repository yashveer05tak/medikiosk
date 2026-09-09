import React from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SoapCaseSheetView({ caseData, editable = false, onChange }) {
  if (!caseData) return null;

  const { caseId, patientName, abhaId, age, gender, isVerified, verifiedBy, soapNote } = caseData;
  const sub = soapNote?.subjective || {};
  const obj = soapNote?.objective || {};
  const ass = soapNote?.assessment || {};
  const pla = soapNote?.plan || {};

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      {/* Header Info */}
      <div className="bg-slate-900 text-white p-6">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                {caseId}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(caseData.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-2 text-white">{patientName}</h2>
            <p className="text-xs text-slate-400">
              Age/Gender: {age} / {gender} • ABHA: {abhaId || 'Walk-in'}
            </p>
          </div>

          <div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> Doctor Verified & Signed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/30">
                <Clock className="w-4 h-4 animate-pulse" /> Pending Doctor Review (isVerified: false)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. SUBJECTIVE */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-black text-teal-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" /> 1. Subjective (S) — Patient History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 block">Primary Complaint:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{sub.primaryComplaints || 'None'}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Duration & Severity:</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {sub.duration || 'N/A'} • Severity: <span className="text-teal-700 font-bold">{sub.symptomSeverity}/10</span>
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Medical History:</span>
              <p className="text-slate-700 mt-0.5">{(sub.medicalHistory || []).join(', ') || 'None'}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Known Allergies:</span>
              <p className="text-amber-700 font-bold mt-0.5">{(sub.allergies || []).join(', ') || 'NKDA'}</p>
            </div>
          </div>
        </div>

        {/* 2. OBJECTIVE */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-black text-teal-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" /> 2. Objective (O) — Clinical Findings
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-500 block">Physical Symptoms:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(obj.physicalSymptoms || []).map((symptom, i) => (
                  <span key={i} className="bg-teal-100 text-teal-800 font-semibold px-2.5 py-0.5 rounded-md">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Clinical Findings:</span>
              <p className="text-slate-700 mt-1">{(obj.clinicalFindings || []).join(', ') || 'No examination findings entered'}</p>
            </div>
          </div>
        </div>

        {/* 3. ASSESSMENT */}
        <div className="bg-teal-50/60 p-5 rounded-2xl border border-teal-200">
          <h3 className="text-sm font-black text-teal-900 uppercase tracking-wider mb-3">
            3. Assessment (A) — AI Preliminary Diagnosis
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 font-bold block">Preliminary Clinical Diagnosis:</span>
              <p className="text-sm font-extrabold text-teal-950 mt-0.5">{ass.preliminaryDiagnosis}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-slate-500 font-bold block">Differential Diagnosis:</span>
                <p className="text-slate-700 font-medium">{(ass.differentialDiagnosis || []).join(', ')}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Risk Level:</span>
                <p className="text-amber-900 font-bold uppercase">{ass.riskLevel || 'Routine'}</p>
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">Clinical Reasoning:</span>
              <p className="text-slate-700 mt-0.5">{ass.reasoning || 'Pending clinician review.'}</p>
            </div>
          </div>
        </div>

        {/* 4. PLAN */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-black text-teal-800 uppercase tracking-wider mb-3">
            4. Plan (P) — Diagnostic & Treatment Plan
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-500 block">Recommended Diagnostics:</span>
              <p className="text-slate-800 font-medium">{(pla.recommendedTests || []).join(', ')}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Pathya Ahara / Diet & Lifestyle:</span>
              <ul className="list-disc ml-4 text-slate-700 mt-1 space-y-0.5">
                {(pla.dietLifestyleAdvice || []).map((advice, i) => (
                  <li key={i}>{advice}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Prescribed Medications:</span>
              <div className="bg-white p-3 rounded-xl border border-slate-200 mt-1 font-mono text-teal-800 font-bold">
                {(pla.medications || []).map((med, i) => (
                  <div key={i}>💊 {med}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Footer Sign-off details */}
        {isVerified && verifiedBy && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900">
            <div className="font-bold">Doctor Verification Sign-Off:</div>
            <div>Signed By: <strong>{verifiedBy.doctorName}</strong> (Reg: {verifiedBy.registrationNumber})</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Timestamp: {new Date(verifiedBy.verifiedAt || Date.now()).toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
