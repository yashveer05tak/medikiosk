import React from 'react';
import { Languages, Volume2 } from 'lucide-react';
import { TRANSLATIONS } from '../utils/translations.js';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', sub: 'General & International' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', sub: 'उत्तर एवं मध्य भारत' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', sub: 'தமிழ்நாடு' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', sub: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', sub: 'ಕರ್ನಾಟಕ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', sub: 'കേരളം' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', sub: 'পশ্চিমবঙ্গ & ত্রিপুরা' }
];

export default function LanguageSelector({ selectedLanguage, onSelect }) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const handleSpeakWelcome = (langCode, e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const textToSpeak = TRANSLATIONS[langCode]?.welcome || "Welcome";
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = langCode === 'en' ? 'en-IN' : `${langCode}-IN`;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-teal-50 text-teal-600 rounded-full mb-4 shadow-sm">
          <Languages className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">{t.welcome}</h2>
        <p className="text-slate-500 mt-2 text-lg">{t.selectLanguage}</p>
        <p className="text-teal-600 font-medium text-sm mt-1">
          कृपया अपनी भाषा चुनें | மொழியைத் தேர்ந்தெடுக்கவும் | మీ భాషను ఎంచుకోండి
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 kiosk-btn relative group ${
              selectedLanguage === lang.code
                ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-slate-800">{lang.native}</div>
                <div className="text-sm text-slate-500 mt-0.5">{lang.name}</div>
                <div className="text-[11px] text-slate-400 mt-2">{lang.sub}</div>
              </div>
              <button
                type="button"
                onClick={(e) => handleSpeakWelcome(lang.code, e)}
                title="Listen voice test"
                className="p-2 rounded-full bg-slate-100 group-hover:bg-teal-100 text-slate-500 group-hover:text-teal-700 transition-all"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
