import React, { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle2, FileText, Download, Edit3, Save, ShieldAlert, Sparkles, UserCheck, RefreshCw } from 'lucide-react';
import { getAllCases, verifyCaseSheet, getPDFDownloadUrl } from '../services/api.js';
import SoapCaseSheetView from './SoapCaseSheetView.jsx';

export default function DoctorDashboard({ user }) {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editMedications, setEditMedications] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await getAllCases();
      const caseList = res.cases || [];
      setCases(caseList);
      // On initial load pick first case; on refresh update the currently selected case with latest data
      if (caseList.length > 0) {
        if (!selectedCase) {
          setSelectedCase(caseList[0]);
          initEditState(caseList[0]);
        } else {
          // Find and refresh the currently selected case
          const refreshed = caseList.find(c => c.caseId === selectedCase.caseId);
          if (refreshed) {
            setSelectedCase(refreshed);
            initEditState(refreshed);
          } else {
            // If previous case no longer exists, pick first
            setSelectedCase(caseList[0]);
            initEditState(caseList[0]);
          }
        }
      } else {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error('Error fetching doctor dashboard cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const initEditState = (c) => {
    if (!c) return;
    setEditDiagnosis(c.soapNote?.assessment?.preliminaryDiagnosis || '');
    setEditMedications((c.soapNote?.plan?.medications || []).join('\n'));
    setDoctorNotes(c.doctorNotes || '');
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setIsEditing(false);
    initEditState(c);
  };

  const handleVerifySignOff = async () => {
    if (!selectedCase) return;
    setActionError('');
    setSaving(true);
    try {
      const updatedSoap = {
        ...selectedCase.soapNote,
        assessment: {
          ...selectedCase.soapNote?.assessment,
          preliminaryDiagnosis: editDiagnosis || selectedCase.soapNote?.assessment?.preliminaryDiagnosis
        },
        plan: {
          ...selectedCase.soapNote?.plan,
          medications: editMedications ? editMedications.split('\n').filter(Boolean) : (selectedCase.soapNote?.plan?.medications || [])
        }
      };

      const payload = {
        soapNote: updatedSoap,
        doctorNotes,
        doctorName: user?.name,
        registrationNumber: user?.registrationNumber
      };

      const res = await verifyCaseSheet(selectedCase.caseId, payload);
      setSelectedCase(res.caseSheet);
      setIsEditing(false);
      fetchCases();
      alert('Case sheet verified and digitally signed off by doctor!');
    } catch (err) {
      console.error('Error signing off case:', err);
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      setActionError(serverMessage || (err.response?.status === 401
        ? 'Your doctor session has expired. Please sign in again.'
        : err.response?.status === 403
          ? 'Only a doctor or administrator can sign off a case.'
          : 'The case could not be signed off. Confirm that the backend is running.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedCase) return;
    const url = getPDFDownloadUrl(selectedCase.caseId);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Dashboard Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl mb-6 flex justify-between items-center flex-wrap gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 text-slate-950 p-3 rounded-2xl font-black">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">Doctor Review & Human-in-the-Loop Dashboard</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                SIH 2026 Verification Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Review AI SOAP case sheets, edit diagnosis/prescriptions, and perform digital sign-off.
            </p>
          </div>
        </div>

        <button
          onClick={fetchCases}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Cases'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side 1: Cases Navigation List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Incoming Intake Queue ({cases.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {cases.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No active case sheets in queue. Submit an intake form to test.
              </div>
            ) : (
              cases.map((c) => (
                <div
                  key={c.caseId}
                  onClick={() => handleSelectCase(c)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedCase?.caseId === c.caseId
                      ? 'border-teal-500 bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">
                      {c.caseId}
                    </span>
                    {c.isVerified ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-slate-800 text-sm mt-2">{c.patientName}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {c.soapNote?.assessment?.preliminaryDiagnosis || 'General Clinical Review'}
                  </div>

                  {c.isRedFlag && (
                    <span className="inline-block mt-2 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      🚨 Red Flag Emergency
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Split View Layout */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCase ? (
            <div className="space-y-6">
              
              {/* Top Split Header Action Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center flex-wrap gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Case ID: {selectedCase.caseId}</span>
                  <span className="text-xs text-slate-400">| {selectedCase.opdType.toUpperCase()} OPD</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Case Sheet'}
                  </button>

                  <button
                    onClick={handleVerifySignOff}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" /> {selectedCase.isVerified ? 'Update Doctor Sign-Off' : 'Approve & Verify (Doctor Sign-off)'}
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Encrypted PDF
                  </button>
                </div>
              </div>

              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl text-xs font-semibold">
                  {actionError}
                </div>
              )}

              {/* Split View Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Panel: Raw Input & PII Sanitization Status */}
                <div className="md:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">
                    Left Panel: Raw Patient Narration
                  </h4>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-teal-700 uppercase block mb-1">
                      Transcribed Speech / Text ({selectedCase.language.toUpperCase()})
                    </span>
                    <p className="text-xs text-slate-800 italic leading-relaxed">
                      "{selectedCase.rawInput}"
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[11px] text-emerald-900 font-medium">
                    🛡️ <strong>PII Redaction Engine:</strong> Aadhaar numbers, phone contacts, and emails stripped prior to LLM processing.
                  </div>

                  {selectedCase.isRedFlag && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-xs font-bold text-red-800 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>Emergency Red-Flag Triggered</div>
                        <div className="text-[10px] text-red-600 font-normal mt-0.5">{selectedCase.redFlagReason}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel: AI-Structured SOAP Case Sheet / Doctor Edit Form */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">
                    Right Panel: AI-Structured SOAP Sheet (SOAP Note Format)
                  </h4>

                  {isEditing ? (
                    <div className="bg-white p-6 rounded-3xl border border-teal-300 shadow-sm space-y-4">
                      <h5 className="font-bold text-sm text-teal-900 flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-teal-600" /> Doctor Amendments & Prescriptions
                      </h5>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Preliminary Diagnosis</label>
                        <input
                          type="text"
                          value={editDiagnosis}
                          onChange={(e) => setEditDiagnosis(e.target.value)}
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Prescribed Medications (1 per line)</label>
                        <textarea
                          rows={4}
                          value={editMedications}
                          onChange={(e) => setEditMedications(e.target.value)}
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Remarks & Clinical Notes</label>
                        <textarea
                          rows={3}
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="e.g. Patient advised to return in 5 days for follow-up..."
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800"
                        />
                      </div>

                      <button
                        onClick={handleVerifySignOff}
                        disabled={saving}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                      >
                        {saving ? 'Saving...' : 'Save & Digital Sign-off Case Sheet'}
                      </button>
                    </div>
                  ) : (
                    <SoapCaseSheetView caseData={selectedCase} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-sm">
              Select a patient case sheet from the left queue to begin review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
