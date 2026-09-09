import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, ArrowLeft, ArrowRight, Activity, Smile, Frown, Volume2, Radio, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../utils/translations.js';
import { useVoiceRecognition } from '../utils/useVoiceRecognition.js';

export default function SocratesFlow({ session, onUpdate, onNext, onBack }) {
  const lang = session.language || 'en';
  const t = getTranslation(lang);

  const [chiefComplaint, setChiefComplaint] = useState(session.clinicalData?.chiefComplaint || '');
  const [hpi, setHpi] = useState({
    onset: session.clinicalData?.hpi?.onset || '',
    location: session.clinicalData?.hpi?.location || '',
    duration: session.clinicalData?.hpi?.duration || '',
    character: session.clinicalData?.hpi?.character || '',
    aggravating: session.clinicalData?.hpi?.aggravating || '',
    relieving: session.clinicalData?.hpi?.relieving || '',
    severity: session.clinicalData?.hpi?.severity || 0
  });

  const [activeStep, setActiveStep] = useState(0);

  // Voice recognition custom hook
  const {
    isListening,
    interimTranscript,
    error: voiceError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    speakText
  } = useVoiceRecognition(lang);

  // Multilingual Preset Scenarios
  const PRESET_SCENARIOS = [
    {
      name: lang === 'hi'
        ? "आपातकालीन सीने में दर्द (हृदय संबंधी रेड-फ्लैग)"
        : lang === 'ta'
        ? "அவசர நெஞ்சு வலி (கார்டியாக் எச்சரிக்கை)"
        : lang === 'te'
        ? "తీవ్రమైన ఛాతీ నొప్పి (కార్డియాక్ ఎమర్జెన్సీ)"
        : "Scenario A: Emergency Chest Pain (Cardiac Red-Flag)",
      narrative: lang === 'hi'
        ? "मुझे पिछले 2 घंटे से सीने में बहुत तेज भारी दर्द हो रहा है। सीने में दबाव जैसा लग रहा है और दर्द बाएं हाथ तक जा रहा है। मुझे सांस लेने में बहुत तकलीफ है और चक्कर आ रहे हैं।"
        : lang === 'ta'
        ? "கடந்த 2 மணி நேரமாக கடுமையான நெஞ்சு வலி உள்ளது. இடது கைக்கு வலி பரவுகிறது மற்றும் மூச்சுத் திணறல் உள்ளது."
        : lang === 'te'
        ? "నాకు గత 2 గంటలుగా తీవ్రమైన ఛాతీ నొప్పి వస్తోంది. నొప్పి ఎడమ చేయికి వ్యాపిస్తోంది మరియు శ్వాస తీసుకోవడం కష్టంగా ఉంది."
        : "I have this sudden heavy chest pain for the last 2 hours. It feels like a tight pressure in my chest and it is radiating to my left arm. I am also having severe breathlessness and feeling faint.",
      onset: lang === 'hi' ? "अचानक, 2 घंटे पहले" : "Sudden, 2 hours ago",
      location: lang === 'hi' ? "सीने में, बाएं हाथ और जबड़े तक" : "Chest, radiating to left arm and jaw",
      duration: lang === 'hi' ? "लगातार" : "Continuous",
      character: lang === 'hi' ? "भारी वजन और दबाव" : "Heavy pressure, squeezing tightness",
      aggravating: lang === 'hi' ? "गहरी सांस लेने से" : "Deep breathing, exertion",
      relieving: lang === 'hi' ? "कोई नहीं" : "None",
      severity: 9
    },
    {
      name: lang === 'hi'
        ? "घुटने का सामान्य दर्द (ऑस्टियोआर्थराइटिस)"
        : lang === 'ta'
        ? "வழக்கமான முழங்கால் வலி"
        : lang === 'te'
        ? "మోకాలి నొప్పి (సాధారణ)"
        : "Scenario B: Routine Knee Pain (Osteoarthritis)",
      narrative: lang === 'hi'
        ? "मेरे दाहिने घुटने में पिछले 6 महीने से दर्द है। जब मैं चलता हूँ या सीढ़ी चढ़ता हूँ तो दर्द बढ़ जाता है, और बैठने पर आराम मिलता है।"
        : lang === 'ta'
        ? "கடந்த 6 மாதங்களாக வலது முழங்காலில் வலி உள்ளது. நடக்கும்போது வலி அதிகமாகும்."
        : lang === 'te'
        ? "నా కుడి మోకాలిలో 6 నెలలుగా నొప్పి ఉంది. నడిచేటప్పుడు నొప్పి పెరుగుతుంది."
        : "My right knee has been paining for the last 6 months. It starts when I walk or climb stairs, and feels better when I sit down. The pain is a dull ache, and it gets stiff in the morning.",
      onset: lang === 'hi' ? "धीरे-धीरे, 6 महीने से" : "Gradual, 6 months ago",
      location: lang === 'hi' ? "दाहिना घुटना" : "Right knee joint",
      duration: lang === 'hi' ? "रुक-रुक कर" : "Intermittent, worse with activity",
      character: lang === 'hi' ? "हल्का दर्द" : "Dull ache, throbbing",
      aggravating: lang === 'hi' ? "सीढ़ी चढ़ने से" : "Climbing stairs, walking",
      relieving: lang === 'hi' ? "बैठने से" : "Resting, sitting down",
      severity: 5
    },
    {
      name: lang === 'hi'
        ? "पुरानी अपच एवं गैस (आयुष परामर्श हेतु)"
        : lang === 'ta'
        ? "செரிமானக் கோளாறு (ஆயுஷ்)"
        : lang === 'te'
        ? "జీర్ణ సమస్యలు (ఆయుష్)"
        : "Scenario C: Chronic Indigestion (For AYUSH mode)",
      narrative: lang === 'hi'
        ? "मुझे 3 सप्ताह से पेट में भारीपन, गैस और जलन की समस्या है। खाने के बाद पेट फूलता है और पाचन बहुत धीमा है।"
        : lang === 'ta'
        ? "3 வாரங்களாக அஜீரணம் மற்றும் நெஞ்செரிச்சல் உள்ளது. சாப்பிட்ட பிறகு வயிறு உப்புசம் ஆகிறது."
        : lang === 'te'
        ? "3 వారాలుగా అజీర్ణం మరియు కడుపు మంట ఉంది. తిన్న తర్వాత ఉబ్బరం వస్తుంది."
        : "I have bloating and severe stomach burn for 3 weeks now. It is continuous, getting worse after meals, and I have a bad appetite with sluggish digestion and hard stool.",
      onset: lang === 'hi' ? "3 सप्ताह से" : "Gradual, 3 weeks ago",
      location: lang === 'hi' ? "पेट का ऊपरी हिस्सा" : "Upper stomach / epigastric region",
      duration: lang === 'hi' ? "खाने के बाद लगातार" : "Continuous after meals",
      character: lang === 'hi' ? "जलन और एसिडिटी" : "Burning sensation",
      aggravating: lang === 'hi' ? "मसालेदार भोजन" : "Eating spicy foods, dairy",
      relieving: lang === 'hi' ? "ठंडा पानी पीने से" : "Drinking cold water",
      severity: 4
    }
  ];

  const handleApplyPreset = (scenario) => {
    setChiefComplaint(scenario.narrative);
    setHpi({
      onset: scenario.onset,
      location: scenario.location,
      duration: scenario.duration,
      character: scenario.character,
      aggravating: scenario.aggravating,
      relieving: scenario.relieving,
      severity: scenario.severity
    });
  };

  const handleToggleVoice = (targetField = 'chiefComplaint') => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        if (targetField === 'chiefComplaint') {
          setChiefComplaint((prev) => (prev ? prev + ' ' + text : text));
        } else if (targetField === 'onset') {
          setHpi((prev) => ({ ...prev, onset: (prev.onset ? prev.onset + ' ' : '') + text }));
        } else if (targetField === 'location') {
          setHpi((prev) => ({ ...prev, location: (prev.location ? prev.location + ' ' : '') + text }));
        } else if (targetField === 'duration') {
          setHpi((prev) => ({ ...prev, duration: (prev.duration ? prev.duration + ' ' : '') + text }));
        } else if (targetField === 'character') {
          setHpi((prev) => ({ ...prev, character: (prev.character ? prev.character + ' ' : '') + text }));
        }
      });
    }
  };

  // Sync with backend on change
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate({ chiefComplaint, hpi });
    }, 300);
    return () => clearTimeout(timer);
  }, [chiefComplaint, hpi]);

  const steps = [
    { title: t.step1Title, desc: t.step1Desc },
    { title: t.step2Title, desc: t.step2Desc },
    { title: t.step3Title, desc: t.step3Desc },
    { title: t.step4Title, desc: t.step4Desc },
    { title: t.step5Title, desc: t.step5Desc },
    { title: t.step6Title, desc: t.step6Desc },
    { title: t.step7Title, desc: t.step7Desc }
  ];

  const handleSpeakCurrentStep = () => {
    const current = steps[activeStep];
    const textToRead = `${current.title}. ${current.desc}`;
    speakText(textToRead, lang);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Kiosk Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6 flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
            {session.opdType === 'ayush' ? t.ayushBadge : t.allopathicBadge}
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">
            {session.opdType === 'ayush' ? t.ayushHeader : 'Clinical Assessment (SOCRATES)'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {session.isRedFlag && (
            <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-full animate-pulse">
              <AlertCircle className="w-4 h-4" /> {t.emergencyTitle}
            </span>
          )}
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            🌐 {lang.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Step tracker */}
        <div className="lg:col-span-4 space-y-2">
          {steps.map((s, index) => (
            <div
              key={index}
              onClick={() => setActiveStep(index)}
              className={`p-3.5 rounded-xl text-left cursor-pointer transition-all ${
                activeStep === index
                  ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <div className="text-[11px] uppercase tracking-wider opacity-80">
                {lang === 'hi' ? `चरण ${index + 1}` : `Step ${index + 1}`}
              </div>
              <div className="text-sm font-bold truncate mt-0.5">{s.title}</div>
            </div>
          ))}

          {/* Voice status banner */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-teal-600" />
                {isListening ? (
                  <span className="text-red-600 animate-pulse">{t.speakNow}</span>
                ) : (
                  <span>Voice Status: Active ({lang.toUpperCase()})</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleSpeakCurrentStep}
                title="Read question aloud"
                className="p-1.5 bg-white hover:bg-teal-100 text-teal-700 rounded-lg border border-slate-200 transition-all"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            {interimTranscript && (
              <div className="text-xs text-teal-700 font-medium italic mt-2 bg-teal-50 p-2 rounded border border-teal-100">
                "{interimTranscript}"
              </div>
            )}
            {voiceError && (
              <div className="text-[11px] text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                {voiceError}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive Form Section */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[420px] flex flex-col justify-between">
          <div>
            {/* Step Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase text-teal-600">{steps[activeStep].desc}</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{steps[activeStep].title}</h3>
              </div>
              <button
                type="button"
                onClick={handleSpeakCurrentStep}
                className="flex items-center gap-1 text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100"
              >
                <Volume2 className="w-4 h-4" /> {lang === 'hi' ? 'सुने' : 'Listen'}
              </button>
            </div>

            {/* Step 0: Narration */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t.step1Label}
                  </label>
                  <div className="relative">
                    <textarea
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder={t.step1Placeholder}
                      rows={5}
                      className="w-full p-4 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-lg transition-all pr-16"
                    />

                    {/* Mic button right inside textarea */}
                    <button
                      type="button"
                      onClick={() => handleToggleVoice('chiefComplaint')}
                      className={`absolute right-3 bottom-3 p-3.5 rounded-full shadow-lg transition-all kiosk-btn ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                      title={isListening ? t.stopSpeakBtn : t.speakBtn}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{t.voiceHint}</p>
                </div>

                {/* Preset scenarios */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {t.presetTitle}
                  </span>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {PRESET_SCENARIOS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPreset(p)}
                        className="text-left text-xs bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 p-2.5 rounded-lg text-slate-700 font-medium transition-all shadow-sm"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Onset */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">{t.step2Desc}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {t.step2Options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHpi((prev) => ({ ...prev, onset: opt }))}
                      className={`p-4 rounded-xl border text-center font-medium text-sm transition-all kiosk-btn ${
                        hpi.onset === opt
                          ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-3">
                  <input
                    type="text"
                    placeholder="Or type/speak specific details..."
                    value={hpi.onset}
                    onChange={(e) => setHpi((prev) => ({ ...prev, onset: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-slate-300 text-slate-800 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('onset')}
                    className={`absolute right-2.5 top-2.5 p-2 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-100'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">{t.step3Desc}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {t.step3Options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHpi((prev) => ({ ...prev, location: opt }))}
                      className={`p-4 rounded-xl border text-center font-medium text-sm transition-all kiosk-btn ${
                        hpi.location === opt
                          ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-3">
                  <input
                    type="text"
                    placeholder="e.g. Chest pain radiating to left arm..."
                    value={hpi.location}
                    onChange={(e) => setHpi((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-slate-300 text-slate-800 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('location')}
                    className={`absolute right-2.5 top-2.5 p-2 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-100'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Duration */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">{t.step4Desc}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {t.step4Options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHpi((prev) => ({ ...prev, duration: opt }))}
                      className={`p-4 rounded-xl border text-center font-medium text-sm transition-all kiosk-btn ${
                        hpi.duration === opt
                          ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-3">
                  <input
                    type="text"
                    placeholder="e.g. Continuous for past 2 hours..."
                    value={hpi.duration}
                    onChange={(e) => setHpi((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-slate-300 text-slate-800 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('duration')}
                    className={`absolute right-2.5 top-2.5 p-2 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-100'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Character */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">{t.step5Desc}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {t.step5Options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHpi((prev) => ({ ...prev, character: opt }))}
                      className={`p-4 rounded-xl border text-center font-medium text-sm transition-all kiosk-btn ${
                        hpi.character === opt
                          ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="relative mt-3">
                  <input
                    type="text"
                    placeholder="e.g. Squeezing heavy pressure..."
                    value={hpi.character}
                    onChange={(e) => setHpi((prev) => ({ ...prev, character: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-slate-300 text-slate-800 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleVoice('character')}
                    className={`absolute right-2.5 top-2.5 p-2 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-100'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Factors */}
            {activeStep === 5 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.aggravatingLabel}</label>
                  <input
                    type="text"
                    placeholder={t.aggravatingPlaceholder}
                    value={hpi.aggravating}
                    onChange={(e) => setHpi((prev) => ({ ...prev, aggravating: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.relievingLabel}</label>
                  <input
                    type="text"
                    placeholder={t.relievingPlaceholder}
                    value={hpi.relieving}
                    onChange={(e) => setHpi((prev) => ({ ...prev, relieving: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Severity */}
            {activeStep === 6 && (
              <div className="space-y-6">
                <label className="block text-sm font-semibold text-slate-700">{t.step7Desc}</label>

                <div className="flex justify-between items-center px-4">
                  <div className="flex flex-col items-center">
                    <Smile className="w-12 h-12 text-green-500" />
                    <span className="text-xs text-slate-500 mt-1">{t.noPain}</span>
                  </div>
                  <div className="text-5xl font-black text-teal-600 bg-teal-50 px-6 py-4 rounded-3xl border border-teal-200">
                    {hpi.severity}
                  </div>
                  <div className="flex flex-col items-center">
                    <Frown className="w-12 h-12 text-red-500 animate-bounce" />
                    <span className="text-xs text-slate-500 mt-1">{t.severePain}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={hpi.severity}
                    onChange={(e) => setHpi((prev) => ({ ...prev, severity: Number(e.target.value) }))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="grid grid-cols-11 text-center font-bold text-xs text-slate-400">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                      <span
                        key={val}
                        className={`cursor-pointer ${hpi.severity === val ? 'text-teal-600 text-sm font-black' : ''}`}
                        onClick={() => setHpi((prev) => ({ ...prev, severity: val }))}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Action Controls */}
          <div className="flex justify-between border-t border-slate-100 pt-6 mt-8">
            <button
              type="button"
              onClick={() => {
                if (activeStep > 0) {
                  setActiveStep((prev) => prev - 1);
                } else {
                  onBack();
                }
              }}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              {t.back}
            </button>

            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md shadow-teal-500/10 transition-all active:scale-[0.98]"
              >
                {t.next} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
              >
                {t.saveAndProceed}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
