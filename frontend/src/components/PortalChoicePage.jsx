import React from 'react';
import { ArrowRight, Stethoscope, UserRound } from 'lucide-react';

export default function PortalChoicePage({ language, onPatient, onDoctor }) {
  const isEnglish = language === 'en';

  return (
    <section className="portal-page max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700 mb-3">
          {isEnglish ? 'Choose Your Portal' : 'अपना पोर्टल चुनें'}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          {isEnglish ? 'How would you like to continue?' : 'आप कैसे आगे बढ़ना चाहते हैं?'}
        </h2>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto">
          {isEnglish ? 'Select the workspace that matches your role.' : 'अपनी भूमिका के अनुसार कार्यक्षेत्र चुनें।'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button type="button" onClick={onPatient} className="portal-choice-card portal-choice-patient">
          <span className="portal-choice-icon"><UserRound className="w-8 h-8" /></span>
          <span className="block text-2xl font-black mt-6">{isEnglish ? 'Patient Portal' : 'रोगी पोर्टल'}</span>
          <span className="block text-sm text-slate-500 mt-2">{isEnglish ? 'Start a new intake, share reports, and view your records.' : 'नया पंजीकरण शुरू करें, रिपोर्ट साझा करें और रिकॉर्ड देखें।'}</span>
          <span className="inline-flex items-center gap-2 mt-7 text-sm font-black text-blue-700">{isEnglish ? 'Enter patient portal' : 'रोगी पोर्टल खोलें'} <ArrowRight className="w-4 h-4" /></span>
        </button>

        <button type="button" onClick={onDoctor} className="portal-choice-card portal-choice-doctor">
          <span className="portal-choice-icon"><Stethoscope className="w-8 h-8" /></span>
          <span className="block text-2xl font-black mt-6">{isEnglish ? 'Doctor Portal' : 'डॉक्टर पोर्टल'}</span>
          <span className="block text-sm text-slate-500 mt-2">{isEnglish ? 'Review submitted cases, reports, and verification tasks.' : 'जमा किए गए केस, रिपोर्ट और सत्यापन कार्य देखें।'}</span>
          <span className="inline-flex items-center gap-2 mt-7 text-sm font-black text-blue-700">{isEnglish ? 'Enter doctor portal' : 'डॉक्टर पोर्टल खोलें'} <ArrowRight className="w-4 h-4" /></span>
        </button>
      </div>
    </section>
  );
}
