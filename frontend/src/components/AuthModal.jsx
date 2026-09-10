import React, { useState } from 'react';
import { X, Lock, Mail, User, Stethoscope, ShieldCheck, KeyRound } from 'lucide-react';
import { loginUser, registerUser } from '../services/api.js';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, language = 'hi' }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('doctor'); // 'patient' or 'doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isEnglish = language === 'en';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ email, password });
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await registerUser({
          name,
          email,
          password,
          role,
          abhaId,
          specialization,
          registrationNumber
        });
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoType) => {
    if (demoType === 'doctor') {
      setIsLogin(true);
      setEmail('doctor@medikiosk.org');
      setPassword('doctor123');
    } else {
      setIsLogin(true);
      setEmail('patient@medikiosk.org');
      setPassword('patient123');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> {isEnglish ? 'Secure Authentication' : 'सुरक्षित प्रमाणीकरण'}
          </div>
          <h2 className="text-2xl font-black">{isLogin ? (isEnglish ? 'Sign In to MediKiosk' : 'MediKiosk में प्रवेश करें') : (isEnglish ? 'Create New Account' : 'नया खाता बनाएं')}</h2>
          <p className="text-xs text-slate-400 mt-1">{isEnglish ? 'SIH 2026 EMR Role-Based Access Control System' : 'SIH 2026 ईएमआर भूमिका-आधारित प्रवेश प्रणाली'}</p>
        </div>

        <div className="p-6">
          {/* Quick Demo Autofill Bar */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl mb-6 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">{isEnglish ? '⚡ Quick SIH Judge Demo Autofill:' : '⚡ त्वरित SIH डेमो ऑटो-फिल:'}</span>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => fillQuickDemo('doctor')}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold rounded-lg transition-all"
              >
                {isEnglish ? '👨‍⚕️ Demo Doctor Account' : '👨‍⚕️ डेमो डॉक्टर खाता'}
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('patient')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-all"
              >
                {isEnglish ? '👤 Demo Patient Account' : '👤 डेमो रोगी खाता'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Role Switcher in Signup */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">{isEnglish ? 'Select Account Role:' : 'खाते की भूमिका चुनें:'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        role === 'patient'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <User className="w-4 h-4" /> {isEnglish ? 'Patient' : 'रोगी'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('doctor')}
                      className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        role === 'doctor'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4" /> {isEnglish ? 'Doctor / Clinician' : 'डॉक्टर / चिकित्सक'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Full Name' : 'पूरा नाम'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma or Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </>
            )}

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Email Address' : 'ईमेल पता'}</label>
              <input
                type="email"
                required
                placeholder="e.g. doctor@medikiosk.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Password' : 'पासवर्ड'}</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {!isLogin && role === 'doctor' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Specialization' : 'विशेषज्ञता'}</label>
                  <input
                    type="text"
                    placeholder="e.g. General Medicine or Cardiology"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'Medical Council Registration No.' : 'मेडिकल काउंसिल पंजीकरण संख्या'}</label>
                  <input
                    type="text"
                    placeholder="e.g. MED-IN-2026-8842"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-800"
                  />
                </div>
              </>
            )}

            {!isLogin && role === 'patient' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isEnglish ? 'ABHA ID (Optional)' : 'आभा आईडी (वैकल्पिक)'}</label>
                <input
                  type="text"
                  placeholder="e.g. 91-8842-1029-4451"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-800"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-xl text-sm hover:bg-teal-700 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (isEnglish ? 'Authenticating...' : 'प्रमाणीकरण हो रहा है...') : isLogin ? (isEnglish ? 'Sign In to Account' : 'खाते में प्रवेश करें') : (isEnglish ? 'Create Account & Continue' : 'खाता बनाएं और जारी रखें')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-teal-700 hover:underline font-bold"
            >
              {isLogin ? (isEnglish ? "Don't have an account? Register here" : 'खाता नहीं है? यहां पंजीकरण करें') : (isEnglish ? 'Already have an account? Sign In' : 'पहले से खाता है? प्रवेश करें')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
