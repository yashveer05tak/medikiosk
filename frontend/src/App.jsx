import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar.jsx';
import AuthModal from './components/AuthModal.jsx';
import PatientIntakePortal from './components/PatientIntakePortal.jsx';
import DoctorDashboard from './components/DoctorDashboard.jsx';
import PatientHistoryView from './components/PatientHistoryView.jsx';
import TriageAlert from './components/TriageAlert.jsx';
import { getCurrentUser, structureCaseSheet } from './services/api.js';

export default function App() {
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [view, setView] = useState('intake'); // 'intake', 'dashboard', 'history'
  const [language, setLanguage] = useState('en');
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
            setView('dashboard');
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
      setView('dashboard');
    } else {
      setView('intake');
    }
  };

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    if (loggedUser.role === 'doctor') {
      setRole('doctor');
      setView('dashboard');
    } else {
      setRole('patient');
      setView('intake');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medikiosk_token');
    setUser(null);
    setRole('patient');
    setView('intake');
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
    <div className="app-shell min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Header Bar */}
      <HeaderBar
        user={user}
        role={role}
        language={language}
        onRoleSwitch={handleRoleSwitch}
        onLanguageChange={(lang) => setLanguage(lang)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Sub Navigation Bar for View switching */}
      <div className="app-nav bg-white border-b border-slate-200 px-4 sm:px-6 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {role === 'patient' ? (
              <>
                <button
                  onClick={() => setView('intake')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    view === 'intake' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📝 New Patient Intake
                </button>
                <button
                  onClick={() => setView('history')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    view === 'history' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📁 History & PDF Exports
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    view === 'dashboard' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🩺 Doctor Review Dashboard
                </button>
                <button
                  onClick={() => setView('history')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    view === 'history' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📁 All Clinical Case Sheets
                </button>
              </>
            )}
          </div>

          <div className="app-mode text-[11px] font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {role === 'doctor' ? '👨‍⚕️ Mode: Doctor Verification Portal' : '👤 Mode: Patient Case-Taking Portal'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow py-5 sm:py-7">
        {view === 'intake' && (
          <PatientIntakePortal
            key={language}
            language={language}
            onStructureComplete={handleStructureCase}
            onRedFlagDetected={handleRedFlagTrigger}
          />
        )}

        {view === 'dashboard' && (
          <DoctorDashboard user={user} />
        )}

        {view === 'history' && (
          <PatientHistoryView language={language} />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
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
        MediKiosk • Smart India Hackathon (SIH 2026) Problem Statement 26047
      </footer>
    </div>
  );
}
