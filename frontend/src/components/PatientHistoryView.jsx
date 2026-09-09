import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { getAllCases, getPDFDownloadUrl } from '../services/api.js';

export default function PatientHistoryView() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await getAllCases();
        setCases(res.cases || []);
      } catch (err) {
        console.error('Error loading patient history:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> ABDM Digital Health Records
          </div>
          <h2 className="text-2xl font-black">Patient Clinical History & PDF Exports</h2>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading historical records...</div>
      ) : cases.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border text-center text-slate-400 text-sm">
          No medical case sheets recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((item) => (
            <div key={item.caseId} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md">
                    {item.caseId}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  {item.isVerified ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Doctor Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending Verification
                    </span>
                  )}
                </div>

                <div className="font-bold text-slate-800 text-base">{item.patientName}</div>
                <div className="text-xs text-teal-900 font-semibold">
                  Diagnosis: {item.soapNote?.assessment?.preliminaryDiagnosis || 'General OPD Evaluation'}
                </div>
              </div>

              <a
                href={getPDFDownloadUrl(item.caseId)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Download PDF Case Sheet
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
