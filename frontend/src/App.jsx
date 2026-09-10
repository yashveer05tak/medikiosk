import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar.jsx';
import AuthModal from './components/AuthModal.jsx';
import PatientLanguagePage from './components/PatientLanguagePage.jsx';
import PatientPortalPage from './components/PatientPortalPage.jsx';
import DoctorPortalPage from './components/DoctorPortalPage.jsx';
import TriageAlert from './components/TriageAlert.jsx';
import { getCurrentUser, structureCaseSheet } from './services/api.js';

export default function App() {
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [view, setView] = useState('language'); // 'language', 'patient', 'doctor'
  const [language, setLanguage] = useState('hi');
  const [darkTheme, setDarkTheme] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [triageAlertOpen, setTriageAlertOpen] = useState(false);
  const [triageReason, setTriageReason] = useState('');

  // Check saved user session
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await getCurrentUser();
        if (res.user && res.user.id !== 'guest') {
          setUser(res.user);
          if (res.user.role === 'doctor') {
            setRole('doctor');
            setView('doctor');
          }
        }
      } catch (err) {
        console.log('Running in guest mode');
      }
    };
    fetchMe();
  }, []);

  const handleRoleSwitch = (newRole) => {
    if (newRole === 'doctor' && user?.role !== 'doctor' && user?.role !== 'admin') {
      setIsAuthOpen(true);
      return;
    }
    setRole(newRole);
    if (newRole === 'doctor') {
      setView('doctor');
    } else {
      setView('language');
    }
  };

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    if (loggedUser.role === 'doctor') {
      setRole('doctor');
      setView('doctor');
    } else {
      setRole('patient');
      setView('language');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medikiosk_token');
    setUser(null);
    setRole('patient');
    setView('language');
  };

  const handleStructureCase = async (payload) => {
    const res = await structureCaseSheet(payload);
    return res;
  };

  const handleRedFlagTrigger = (reason) => {
    setTriageReason(reason);
    setTriageAlertOpen(true);
  };

  return (
    <div className={`app-shell min-h-screen flex flex-col font-sans ${darkTheme ? 'theme-dark' : 'theme-light'}`}>
      {/* Header Bar */}
      <HeaderBar
        user={user}
        role={role}
        language={language}
        darkTheme={darkTheme}
        onRoleSwitch={handleRoleSwitch}
        onLanguageChange={(lang) => setLanguage(lang)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onToggleTheme={() => setDarkTheme((prev) => !prev)}
      />

      {view !== 'language' && (
        <div className="app-nav bg-white/80 border-b border-slate-200 px-4 sm:px-6 py-3 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <span className="app-mode text-[11px] font-black uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              {role === 'doctor'
                ? (language === 'en' ? 'Doctor Portal' : 'डॉक्टर पोर्टल')
                : (language === 'en' ? 'Patient Portal' : 'रोगी पोर्टल')}
            </span>
            <button type="button" onClick={() => role === 'doctor' ? setView('doctor') : setView('language')} className="text-xs font-bold text-slate-600 hover:text-blue-700">
              {role === 'doctor' ? (language === 'en' ? 'Review Cases' : 'केस की समीक्षा करें') : (language === 'en' ? 'Change language' : 'भाषा बदलें')}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow py-5 sm:py-7">
        {view === 'language' && (
          <PatientLanguagePage
            language={language}
            onSelectLanguage={setLanguage}
            onContinue={() => setView('patient')}
          />
        )}

        {view === 'patient' && (
          <PatientPortalPage
            language={language}
            onLanguageChange={() => setView('language')}
            onStructureComplete={handleStructureCase}
            onRedFlagDetected={handleRedFlagTrigger}
          />
        )}

        {view === 'doctor' && <DoctorPortalPage user={user} language={language} />}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        language={language}
      />

      {/* Emergency Red Flag Overlay */}
      <TriageAlert
        isOpen={triageAlertOpen}
        reason={triageReason}
        language={language}
        onClose={() => setTriageAlertOpen(false)}
      />

      {/* SIH 2026 Kiosk Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white px-6 py-4 text-center text-xs text-slate-400">
        {language === 'en' ? 'MediKiosk • Smart India Hackathon (SIH 2026) Problem Statement 26047' : 'MediKiosk • स्मार्ट इंडिया हैकाथॉन (SIH 2026) समस्या विवरण 26047'}
      </footer>
    </div>
  );
}
