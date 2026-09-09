import React, { useState, useEffect } from 'react';
import { Leaf, ArrowLeft } from 'lucide-react';
import { getTranslation } from '../utils/translations.js';

export default function AyushForm({ session, onUpdate, onNext, onBack }) {
  const lang = session?.language || 'en';
  const t = getTranslation(lang);

  const [agni, setAgni] = useState(session.clinicalData?.ayushParameters?.agni || '');
  const [koshtha, setKoshtha] = useState(session.clinicalData?.ayushParameters?.koshtha || '');
  const [prakritiNotes, setPrakritiNotes] = useState(session.clinicalData?.ayushParameters?.prakritiNotes || '');

  // Auto-save changes
  useEffect(() => {
    onUpdate({
      ayushParameters: {
        agni,
        koshtha,
        prakritiNotes
      }
    });
  }, [agni, koshtha, prakritiNotes]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-full mb-4">
          <Leaf className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">{t.ayushHeader}</h2>
        <p className="text-slate-500 mt-2">{t.ayushSub}</p>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Agni Parameter */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            {t.agniTitle}
          </h3>
          <p className="text-slate-500 text-sm mb-4">{t.agniSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.agniOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => setAgni(opt.value)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  agni === opt.value
                    ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-slate-800 text-base">{opt.label}</span>
                <span className="text-xs text-slate-500 mt-1">{opt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Koshtha Parameter */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            {t.koshthaTitle}
          </h3>
          <p className="text-slate-500 text-sm mb-4">{t.koshthaSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.koshthaOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => setKoshtha(opt.value)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  koshtha === opt.value
                    ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-slate-800 text-sm">{opt.label}</span>
                <span className="text-xs text-slate-500 mt-1">{opt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ahara-Vihara Parameter */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            {t.aharaTitle}
          </h3>
          <p className="text-slate-500 text-sm mb-3">{t.aharaSub}</p>
          <textarea
            value={prakritiNotes}
            onChange={(e) => setPrakritiNotes(e.target.value)}
            placeholder={t.aharaPlaceholder}
            rows={4}
            className="w-full p-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>

        {/* Action Controls */}
        <div className="flex justify-between border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            {t.back}
          </button>
          
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            {t.saveAndProceed}
          </button>
        </div>
      </div>
    </div>
  );
}
