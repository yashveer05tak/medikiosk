import React, { useState } from 'react';
import { ShieldCheck, Heart, Stethoscope, ArrowLeft } from 'lucide-react';
import { getTranslation } from '../utils/translations.js';

export default function OPDSelector({ selectedOpd, abhaId, language, onSelect, onBack }) {
  const [opd, setOpd] = useState(selectedOpd || 'allopathic');
  const [abha, setAbha] = useState(abhaId || '');
  const [useAnonymous, setUseAnonymous] = useState(!abhaId);

  const t = getTranslation(language || 'en');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelect({
      opdType: opd,
      abhaId: useAnonymous ? '' : abha
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> {t.back}
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 font-sans">{t.opdTitle}</h2>
        <p className="text-slate-500 mt-2">{t.opdSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* OPD Selection cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => setOpd('allopathic')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ${
              opd === 'allopathic'
                ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className={`p-3 rounded-xl ${opd === 'allopathic' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{t.allopathicTitle}</h3>
              <p className="text-slate-500 mt-1 text-sm">{t.allopathicDesc}</p>
              <span className="inline-block mt-3 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{t.allopathicBadge}</span>
            </div>
          </div>

          <div
            onClick={() => setOpd('ayush')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ${
              opd === 'ayush'
                ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className={`p-3 rounded-xl ${opd === 'ayush' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{t.ayushTitle}</h3>
              <p className="text-slate-500 mt-1 text-sm">{t.ayushDesc}</p>
              <span className="inline-block mt-3 text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">{t.ayushBadge}</span>
            </div>
          </div>
        </div>

        {/* ABHA ID Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800">{t.abhaTitle}</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useAnonymous}
                onChange={(e) => {
                  setUseAnonymous(e.target.checked);
                  if (e.target.checked) setAbha('');
                }}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 font-medium">{t.continueWalkin}</span>
            </label>

            {!useAnonymous && (
              <div className="pt-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.enterAbha}</label>
                <input
                  type="text"
                  placeholder="e.g. 91-1234-5678-9012 or username@abdm"
                  value={abha}
                  onChange={(e) => setAbha(e.target.value)}
                  required={!useAnonymous}
                  className="w-full p-4 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder-slate-400 text-lg transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">{t.abhaHelp}</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 shadow-lg hover:shadow-teal-500/20 transition-all active:scale-[0.99]"
        >
          {t.startIntake}
        </button>
      </form>
    </div>
  );
}
