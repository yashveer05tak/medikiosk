import React from 'react';
import { HeartPulse, ShieldCheck, UserCheck, LogOut, Languages, Sparkles, Moon, SunMedium } from 'lucide-react';
import { getTranslation } from '../utils/translations.js';

export default function HeaderBar({
  user,
  role,
  language,
  darkTheme,
  onLanguageChange,
  onOpenAuth,
  onLogout,
  onToggleTheme
}) {
  const t = getTranslation(language);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Branding & SIH Tag */}
        <div className="flex items-center gap-3">
          <div className="brand-mark bg-teal-500 p-2.5 rounded-xl text-white shadow-md shadow-teal-500/20 font-black">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white">Viora</h1>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> SIH 2026 (PS 26047)
              </span>
            </div>
              <p className="text-[11px] text-slate-400 font-medium">{language === 'en' ? 'AI-assisted clinical intake • Developed by Yashveer Tak' : 'एआई-सहायित क्लिनिकल पंजीकरण • Yashveer Tak द्वारा विकसित'}</p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300">
            <Languages className="w-4 h-4 text-teal-400" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-slate-200 hover:text-white transition-all"
            title={darkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkTheme ? <SunMedium className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-teal-300" />}
            <span className="text-[11px] font-bold uppercase tracking-wide">{darkTheme ? (language === 'en' ? 'Light' : 'हल्का') : (language === 'en' ? 'Dark' : 'गहरा')}</span>
          </button>

          {/* User Account / Login */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800 py-1 px-3 rounded-xl border border-slate-700">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                <div className="text-[10px] text-teal-400 uppercase font-semibold mt-0.5">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="ml-2 p-1 text-slate-400 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" /> {language === 'en' ? 'Login / Register' : 'प्रवेश / पंजीकरण'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
