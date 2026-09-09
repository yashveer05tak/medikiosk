import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { uploadDocument } from '../services/api.js';
import { getTranslation } from '../utils/translations.js';

export default function DocUploader({ session, onUploadSuccess, onNext, onBack }) {
  const lang = session?.language || 'en';
  const t = getTranslation(lang);

  const [loading, setLoading] = useState(false);
  const [customText, setCustomText] = useState('');
  const [docType, setDocType] = useState('Lab Report');
  const [message, setMessage] = useState(null);

  const MOCK_DOCS = [
    {
      title: lang === 'hi' ? "रक्त रिपोर्ट (कम हीमोग्लोबिन / हाई शुगर)" : "Preset: Blood Lab Report (Hb & Glucose)",
      text: "PATIENT BLOOD ANALYSIS - DATE: 2026-05-15\nHemoglobin (Hb): 9.2 g/dL (LOW)\nFasting Blood Sugar (FBS): 155 mg/dL (HIGH)\nUrea: 24 mg/dL\nPatient presents indications of mild anemia and hyperglycemia.",
      type: "Lab Report"
    },
    {
      title: lang === 'hi' ? "डिस्चार्ज रिपोर्ट (हाई बीपी / हृदय समस्या)" : "Preset: Discharge Summary (Hypertension / Cardiac)",
      text: "DISCHARGE REPORT - DEPT OF CARDIOLOGY\nDiagnoses: Essential Hypertension, history of mild angina.\nActive Medications:\nAmlodipine 5mg OD\nMetformin 500mg BD\nParacetamol 650mg SOS",
      type: "Discharge Summary"
    },
    {
      title: lang === 'hi' ? "सामान्य पर्ची (गैस एवं दर्द की दवा)" : "Preset: General Prescription (Gastric & Cough)",
      text: "CLINIC HEALTH PRESCRIPTION\nPatient complained of bloating and acid reflux.\nMedications: Pantoprazole 40mg (Pan-40) before food morning, Dolo 650mg.",
      type: "Prescription"
    }
  ];

  const handleSimulatedUpload = async (docText, selectedType) => {
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('docText', docText);
      formData.append('docType', selectedType || docType);
      
      const updatedSession = await uploadDocument(session.sessionId, formData);
      onUploadSuccess(updatedSession);
      setMessage({ type: 'success', text: `Successfully parsed & integrated ${selectedType || docType}!` });
      setCustomText('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to process document. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', docType);
      formData.append('docText', `File: ${file.name}. Raw OCR simulated text scan.`);

      const updatedSession = await uploadDocument(session.sessionId, formData);
      onUploadSuccess(updatedSession);
      setMessage({ type: 'success', text: `Successfully scanned and integrated ${file.name}!` });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error uploading file.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-full mb-4">
          <Upload className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">{t.docTitle}</h2>
        <p className="text-slate-500 mt-2">{t.docSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left side: Upload area */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.docTypeLabel}</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="Lab Report">Lab / Blood Report</option>
              <option value="Prescription">Doctor Prescription</option>
              <option value="Discharge Summary">Discharge Summary</option>
            </select>
          </div>

          {/* Drag & drop box */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-all relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,.pdf,.txt"
            />
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <span className="block font-bold text-slate-700">{t.uploadBox}</span>
            <span className="block text-xs text-slate-400 mt-1">{t.uploadHelp}</span>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase">{t.orManual}</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div>
            <textarea
              placeholder={t.manualPlaceholder}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              onClick={() => handleSimulatedUpload(customText)}
              disabled={!customText.trim() || loading}
              className="w-full mt-2 py-3 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} {t.parseBtn}
            </button>
          </div>
        </div>

        {/* Right side: Mock Presets & Active documents checklist */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-100/80 p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider mb-3">{t.presetDocsTitle}</h4>
            <div className="space-y-2">
              {MOCK_DOCS.map((doc, index) => (
                <button
                  key={index}
                  onClick={() => handleSimulatedUpload(doc.text, doc.type)}
                  disabled={loading}
                  className="w-full p-3 text-left text-xs bg-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-xl text-slate-700 font-semibold transition-all active:scale-[0.98] flex items-start gap-2 shadow-sm"
                >
                  <FileText className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{doc.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-normal truncate max-w-[200px]">
                      {doc.text.slice(0, 50)}...
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Status Feedbacks */}
          {message && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Active Documents List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-sm text-slate-800 mb-3">{t.linkedRecords} ({session.clinicalData?.extractedDocuments?.length || 0})</h4>
            {session.clinicalData?.extractedDocuments?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No documents linked to this session yet.</p>
            ) : (
              <div className="space-y-2.5">
                {session.clinicalData.extractedDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-700">{doc.docType}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full font-medium">
                      {doc.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between border-t border-slate-200 pt-6 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          {t.back}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
        >
          {t.generateSummary}
        </button>
      </div>
    </div>
  );
}
