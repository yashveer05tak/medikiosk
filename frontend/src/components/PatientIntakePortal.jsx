import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useVoiceRecognition } from '../utils/useVoiceRecognition.js';
import { getTranslation } from '../utils/translations.js';
import DynamicClinicalQuestions from './DynamicClinicalQuestions.jsx';
import SoapCaseSheetView from './SoapCaseSheetView.jsx';
import { getClinicalQuestions } from '../services/api.js';

export default function PatientIntakePortal({ language, onStructureComplete, onRedFlagDetected }) {
  const t = getTranslation(language);
  const isEnglish = language === 'en';

  const [step, setStep] = useState(0); // 0: Demographics, 1: Speech/Text Narration, 2: AI Interview Questions, 3: Generated Case Sheet
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [opdType, setOpdType] = useState('allopathic');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [formError, setFormError] = useState('');
  const [clinicalAnswers, setClinicalAnswers] = useState({});
  const [aiQuestions, setAiQuestions] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

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
      label: '🧠 AI symptom interview (Hindi Voice)',
      text: 'मुझे 3 सप्ताह से पेट में भारीपन, खट्टी डकार और पेट जलने की शिकायत है। खाने के बाद पेट फूल जाता है और कब्ज रहता है।'
    },
    {
      label: isEnglish ? '🦴 Osteoarthritis Knee Pain (English Voice)' : '🦴 घुटने का ऑस्टियोआर्थराइटिस दर्द (हिन्दी आवाज़)',
      text: 'My right knee has been paining for 6 months. Worsens when climbing stairs or walking, feels better when sitting down.'
    }
  ];

  const handleStep0Next = () => {
    if (!patientName.trim()) { setFormError('Kripya patient ka pura naam bharen (Patient Full Name required)'); return; }
    if (!age.trim()) { setFormError('Kripya age bharen'); return; }
    if (!gender) { setFormError('Kripya gender select karen'); return; }
    if (!opdType) { setFormError('Please select a clinical department.'); return; }
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
        clinicalAnswers
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

  const handleOpenInterview = async () => {
    if (!chiefComplaint.trim()) {
      alert('Kripya apne symptoms voice ya text se batayein pehle.');
      return;
    }

    setQuestionsLoading(true);
    try {
      const result = await getClinicalQuestions({ complaint: chiefComplaint, language, age, gender });
      setAiQuestions(result.questions || null);
    } catch (error) {
      console.warn('Using local clinical questions:', error.message);
      setAiQuestions(null);
    } finally {
      setQuestionsLoading(false);
      setStep(2);
    }
  };

  return (
    <div className="intake-flow max-w-4xl mx-auto px-4 py-4 sm:py-8">

      {/* STEP 0: Demographics & Identity */}
      {step === 0 && (
        <div className="intake-stage bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="intake-stage-label">{isEnglish ? 'Step 1 of 4' : 'चरण 1 / 4'}</div>
          <h3 className="text-2xl font-black text-slate-800 border-b pb-3">{t.opdTitle || 'Step 1: Patient Registration & OPD Department'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Patient Full Name' : 'रोगी का पूरा नाम'} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => { setPatientName(e.target.value); setFormError(''); }}
                placeholder="e.g. Ramesh Kumar Patel"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'ABHA ID (Ayushman Bharat)' : 'आभा आईडी (आयुष्मान भारत)'} <span className="text-slate-400 font-normal text-[10px]">({isEnglish ? 'optional' : 'वैकल्पिक'})</span></label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="e.g. 91-XXXX-XXXX-XXXX"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Age' : 'आयु'} <span className="text-red-500">*</span></label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Gender' : 'लिंग'} <span className="text-red-500">*</span></label>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setFormError(''); }}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800"
              >
                <option value="">-- {isEnglish ? 'Select Gender' : 'लिंग चुनें'} --</option>
                <option value="Male">{isEnglish ? 'Male' : 'पुरुष'}</option>
                <option value="Female">{isEnglish ? 'Female' : 'महिला'}</option>
                <option value="Other">{isEnglish ? 'Other' : 'अन्य'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">{isEnglish ? 'Select Clinical Department:' : 'क्लिनिकल विभाग चुनें:'} <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => { setOpdType('allopathic'); setFormError(''); }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  opdType === 'allopathic' ? 'border-teal-600 bg-teal-50 shadow-sm ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">{isEnglish ? '🏥 General Clinical Intake' : '🏥 सामान्य क्लिनिकल पंजीकरण'}</div>
                <div className="text-xs text-slate-500 mt-0.5">{isEnglish ? 'AI interview tailored to your symptoms' : 'आपके लक्षणों के अनुसार एआई साक्षात्कार'}</div>
              </div>
              <div
                onClick={() => { setOpdType('general'); setFormError(''); }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  opdType === 'general' ? 'border-emerald-600 bg-emerald-50 shadow-sm ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">{isEnglish ? '🧠 AI Clinical Interview' : '🧠 एआई क्लिनिकल साक्षात्कार'}</div>
                <div className="text-xs text-slate-500 mt-0.5">{isEnglish ? 'Adaptive questions for the reported problem' : 'बताई गई समस्या के अनुसार प्रश्न'}</div>
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
              {isEnglish ? 'Continue to Voice/Text Intake' : 'आवाज़/टेक्स्ट पंजीकरण पर जाएँ'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Multilingual Voice/Text Narration */}
      {step === 1 && (
        <div className="intake-stage bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="intake-stage-label">{isEnglish ? 'Step 2 of 4' : 'चरण 2 / 4'}</div>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{isEnglish ? 'Describe Symptoms (Voice or Text)' : 'लक्षण बताएं (आवाज़ या टेक्स्ट)'}</h3>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">
              {isEnglish ? 'Language: English' : 'भाषा: हिन्दी'}
            </span>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {isEnglish ? 'Speak into microphone or type your symptoms below:' : 'माइक्रोफ़ोन में बोलें या नीचे अपने लक्षण लिखें:'}
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
              {isEnglish ? 'Back' : 'पीछे जाएँ'}
            </button>
            <button
              onClick={handleOpenInterview}
              disabled={questionsLoading}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md"
            >
              {questionsLoading ? (isEnglish ? 'Preparing questions...' : 'प्रश्न तैयार हो रहे हैं...') : (t.next || (isEnglish ? 'Next: AI Interview' : 'आगे: एआई साक्षात्कार'))} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI Interview Questions */}
      {step === 2 && (
        <div className="intake-stage bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="intake-stage-label">{isEnglish ? 'Step 3 of 4' : 'चरण 3 / 4'}</div>
          <h3 className="text-2xl font-black text-slate-800">{isEnglish ? 'AI Clinical Interview' : 'एआई क्लिनिकल साक्षात्कार'}</h3>
          <p className="text-sm text-slate-500">{isEnglish ? 'Questions adapt to the reported complaint to capture the most relevant clinical context.' : 'सबसे उपयोगी क्लिनिकल जानकारी लेने के लिए प्रश्न आपकी शिकायत के अनुसार बदलते हैं।'}</p>

          <DynamicClinicalQuestions
            complaint={chiefComplaint}
            answers={clinicalAnswers}
            onChange={setClinicalAnswers}
            questions={aiQuestions}
            isAiGenerated={Boolean(aiQuestions)}
          />

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50"
            >
              {isEnglish ? 'Back' : 'पीछे जाएँ'}
            </button>
            <button
              onClick={handleSubmitStructuring}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? (isEnglish ? 'Structuring SOAP Case Sheet...' : 'SOAP केस शीट तैयार हो रही है...') : (isEnglish ? 'Submit & Generate SOAP Note' : 'जमा करें और SOAP नोट बनाएं')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Rendered Case Sheet View */}
      {step === 3 && structuredResult && (
        <div className="intake-stage space-y-6">
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-teal-900 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-teal-600" />
              {isEnglish ? 'Case Sheet structured into SOAP Format. Status:' : 'केस शीट SOAP प्रारूप में तैयार है। स्थिति:'} <strong>isVerified = false</strong> ({isEnglish ? 'Pending Doctor Verification' : 'डॉक्टर सत्यापन लंबित'}).
            </div>
            <button
              onClick={() => setStep(0)}
              className="px-4 py-2 bg-white border border-teal-300 text-teal-800 text-xs font-bold rounded-xl hover:bg-teal-100"
            >
              {isEnglish ? 'New Intake Session' : 'नया पंजीकरण सत्र'}
            </button>
          </div>

          <SoapCaseSheetView caseData={structuredResult} language={language} />
        </div>
      )}
    </div>
  );
}
