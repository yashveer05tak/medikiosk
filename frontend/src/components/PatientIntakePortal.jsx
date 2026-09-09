import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, ArrowRight, ArrowLeft, Loader2, Heart, ShieldAlert } from 'lucide-react';
import { useVoiceRecognition } from '../utils/useVoiceRecognition.js';
import { getTranslation } from '../utils/translations.js';
import AyushSection from './AyushSection.jsx';
import SoapCaseSheetView from './SoapCaseSheetView.jsx';

export default function PatientIntakePortal({ language, onStructureComplete, onRedFlagDetected }) {
  const t = getTranslation(language);

  const [step, setStep] = useState(0); // 0: Demographics, 1: Speech/Text Narration, 2: AYUSH Assessment, 3: Generated Case Sheet
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [opdType, setOpdType] = useState('');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [formError, setFormError] = useState('');
  const [ayushData, setAyushData] = useState({
    prakriti: '',
    agni: '',
    koshtha: '',
    doshaImbalance: ''
  });

  const [loading, setLoading] = useState(false);
  const [structuredResult, setStructuredResult] = useState(null);

  // Voice Hook
  const {
    isListening,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    speakText
  } = useVoiceRecognition(language);

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((trans) => {
        setChiefComplaint((prev) => (prev ? prev + ' ' + trans : trans));
      });
    }
  };

  const PRESET_DEMO_SAMPLES = [
    {
      label: '🚨 Emergency Cardiac (Hindi Voice)',
      text: 'मुझे पिछले 2 घंटे से सीने में बहुत तेज भारी दर्द हो रहा है। सीने में दबाव लग रहा है और दर्द बाएं हाथ में जा रहा है। सांस नहीं आ रही है।'
    },
    {
      label: '🌿 AYUSH Chronic Indigestion (Hindi Voice)',
      text: 'मुझे 3 सप्ताह से पेट में भारीपन, खट्टी डकार और पेट जलने की शिकायत है। खाने के बाद पेट फूल जाता है और कब्ज रहता है।'
    },
    {
      label: '🦴 Osteoarthritis Knee Pain (English Voice)',
      text: 'My right knee has been paining for 6 months. Worsens when climbing stairs or walking, feels better when sitting down.'
    }
  ];

  const handleStep0Next = () => {
    if (!patientName.trim()) { setFormError('Kripya patient ka pura naam bharen (Patient Full Name required)'); return; }
    if (!age.trim()) { setFormError('Kripya age bharen'); return; }
    if (!gender) { setFormError('Kripya gender select karen'); return; }
    if (!opdType) { setFormError('Kripya OPD department select karen (Allopathic ya AYUSH)'); return; }
    setFormError('');
    setStep(1);
  };

  const handleSubmitStructuring = async () => {
    if (!chiefComplaint.trim()) {
      alert('Kripya apne symptoms voice ya text se batayein pehle.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        chiefComplaint,
        rawText: chiefComplaint,
        language,
        opdType,
        patientName,
        abhaId,
        age,
        gender,
        ayushData
      };

      const result = await onStructureComplete(payload);
      setStructuredResult(result.caseData);
      setStep(3);

      if (result.caseData?.isRedFlag) {
        onRedFlagDetected(result.caseData.redFlagReason);
      }
    } catch (err) {
      console.error('Error generating SOAP case sheet:', err);
      alert('Failed to process case sheet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Step Tracker Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
            Patient Intake Portal • SIH 2026
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-1">AI-Assisted Patient Case-Taking</h2>
        </div>

        <div className="flex gap-2">
          {['Demographics', 'Voice/Text Intake', 'AYUSH Assessment', 'SOAP Case Sheet'].map((s, idx) => (
            <span
              key={idx}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                step === idx
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx + 1}. {s}
            </span>
          ))}
        </div>
      </div>

      {/* STEP 0: Demographics & Identity */}
      {step === 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-3">{t.opdTitle || 'Step 1: Patient Registration & OPD Department'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => { setPatientName(e.target.value); setFormError(''); }}
                placeholder="e.g. Ramesh Kumar Patel"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ABHA ID (Ayushman Bharat) <span className="text-slate-400 font-normal text-[10px]">(optional)</span></label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="e.g. 91-XXXX-XXXX-XXXX"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => { setAge(e.target.value); setFormError(''); }}
                placeholder="e.g. 35"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender <span className="text-red-500">*</span></label>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setFormError(''); }}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800"
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male (Purush)</option>
                <option value="Female">Female (Mahila)</option>
                <option value="Other">Other (Anya)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Clinical Department: <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => { setOpdType('allopathic'); setFormError(''); }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  opdType === 'allopathic' ? 'border-teal-600 bg-teal-50 shadow-sm ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">🏥 Allopathic General Medicine</div>
                <div className="text-xs text-slate-500 mt-0.5">Modern Medical Practice & Diagnostics</div>
              </div>
              <div
                onClick={() => { setOpdType('ayush'); setFormError(''); }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  opdType === 'ayush' ? 'border-emerald-600 bg-emerald-50 shadow-sm ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">🌿 AYUSH Health Services</div>
                <div className="text-xs text-slate-500 mt-0.5">Ayurvedic Prakriti & Holistic Assessment</div>
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
              ⚠️ {formError}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleStep0Next}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
            >
              Continue to Voice/Text Intake <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Multilingual Voice/Text Narration */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Step 2: Describe Symptoms (Voice or Text)</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">
              Language: {language.toUpperCase()}
            </span>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Speak into microphone or type your symptoms below:
            </label>
            <textarea
              rows={6}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder={t.step1Placeholder || 'Speak or type your symptoms...'}
              className="w-full p-4 rounded-2xl border border-slate-300 text-lg text-slate-800 focus:ring-2 focus:ring-teal-500/20 pr-16 transition-all"
            />

            {/* Mic Pulse Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`absolute right-4 bottom-4 p-4 rounded-full shadow-lg transition-all kiosk-btn ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-200'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
              title={isListening ? 'Stop Listening' : 'Click to Speak (Voice Input)'}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          {isListening && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold animate-pulse flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span> {t.speakNow || `Listening in ${language.toUpperCase()}... Speak now.`}
            </div>
          )}

          {/* Quick Preset Samples */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">{t.presetTitle || '1-Click Voice Narration Presets:'}</span>
            <div className="space-y-2">
              {PRESET_DEMO_SAMPLES.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setChiefComplaint(sample.text)}
                  className="w-full text-left p-2.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-xs font-medium text-slate-700 transition-all shadow-sm"
                >
                  <span className="font-bold text-teal-800 block">{sample.label}</span>
                  <span className="text-slate-500 italic truncate block mt-0.5">"{sample.text}"</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (opdType === 'ayush') {
                  setStep(2);
                } else {
                  handleSubmitStructuring();
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md"
            >
              {opdType === 'ayush' ? (t.next || 'Next: AYUSH Assessment') : (t.generateSummary || 'Generate AI Case Sheet')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AYUSH Assessment */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800">{t.ayushHeader || 'Step 3: AYUSH Ayurvedic Assessment'}</h3>
          
          <AyushSection
            value={ayushData}
            onChange={(newVal) => setAyushData(newVal)}
            language={language}
          />

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmitStructuring}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Structuring SOAP Case Sheet...' : 'Submit & Generate SOAP Note'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Rendered Case Sheet View */}
      {step === 3 && structuredResult && (
        <div className="space-y-6">
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-teal-900 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Case Sheet structured into SOAP Format. Status: <strong>isVerified = false</strong> (Pending Doctor Verification).
            </div>
            <button
              onClick={() => setStep(0)}
              className="px-4 py-2 bg-white border border-teal-300 text-teal-800 text-xs font-bold rounded-xl hover:bg-teal-100"
            >
              New Intake Session
            </button>
          </div>

          <SoapCaseSheetView caseData={structuredResult} />
        </div>
      )}
    </div>
  );
}
