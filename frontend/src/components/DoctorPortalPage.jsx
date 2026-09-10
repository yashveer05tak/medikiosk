import React from 'react';
import { Activity, ClipboardCheck, FileSearch } from 'lucide-react';
import DoctorDashboard from './DoctorDashboard.jsx';

export default function DoctorPortalPage({ user, language }) {
  const isEnglish = language === 'en';

  return (
    <section className="portal-page max-w-6xl mx-auto px-4 py-6 sm:py-10">
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="portal-stat"><Activity className="w-5 h-5 text-blue-700" /><span>{isEnglish ? 'Live clinical queue' : 'लाइव क्लिनिकल कतार'}</span></div>
        <div className="portal-stat"><ClipboardCheck className="w-5 h-5 text-blue-700" /><span>{isEnglish ? 'Human verification' : 'मानवीय सत्यापन'}</span></div>
        <div className="portal-stat"><FileSearch className="w-5 h-5 text-blue-700" /><span>{isEnglish ? 'Reports attached to cases' : 'केस से जुड़ी रिपोर्ट'}</span></div>
      </div>
      <DoctorDashboard user={user} language={language} />
    </section>
  );
}
