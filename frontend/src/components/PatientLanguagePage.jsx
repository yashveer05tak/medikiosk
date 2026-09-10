import React from 'react';
import { ArrowRight, Languages, ShieldCheck } from 'lucide-react';

export default function PatientLanguagePage({ language, onSelectLanguage, onContinue }) {
  const isEnglish = language === 'en';

  return (
    <section className="portal-page language-page max-w-3xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-10">
        <div className="language-hero-icon inline-flex items-center justify-center p-4 bg-sky-100 text-blue-700 rounded-2xl mb-5 shadow-sm">
          <Languages className="w-10 h-10" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700 mb-3">
          {isEnglish ? 'Patient Welcome' : 'रोगी स्वागत'}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          {isEnglish ? 'Choose your language' : 'अपनी भाषा चुनें'}
        </h2>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto">
          {isEnglish ? 'Your selected language will be used throughout the patient intake experience.' : 'आपकी चुनी हुई भाषा पूरे रोगी पंजीकरण अनुभव में उपयोग की जाएगी।'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { code: 'en', title: 'English', description: 'Continue in English' },
          { code: 'hi', title: 'हिन्दी', description: 'हिन्दी में जारी रखें' }
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => onSelectLanguage(item.code)}
            className={`language-option text-left p-6 rounded-2xl border-2 transition-all ${language === item.code ? 'language-option-selected border-blue-600 bg-blue-50 shadow-lg ring-4 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}`}
          >
            <span className="language-option-title block text-2xl font-black text-slate-900">{item.title}</span>
            <span className="language-option-description block text-sm text-slate-500 mt-2">{item.description}</span>
          </button>
        ))}
      </div>

      <div className="language-note mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <span>{isEnglish ? 'Your language choice stays on this device for the current visit.' : 'आपकी भाषा का चयन इस डिवाइस पर वर्तमान विज़िट के लिए सुरक्षित रहेगा।'}</span>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full mt-7 flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800 transition-all"
      >
        {isEnglish ? 'Continue to Patient Portal' : 'रोगी पोर्टल पर जाएँ'} <ArrowRight className="w-5 h-5" />
      </button>
    </section>
  );
}
