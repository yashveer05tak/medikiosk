import React, { useEffect } from 'react';
import { AlertOctagon, PhoneCall } from 'lucide-react';
import { getTranslation } from '../utils/translations.js';

export default function TriageAlert({ isOpen, reason, language = 'en', onClose }) {
  if (!isOpen) return null;

  const t = getTranslation(language);

  // Sound alarm using Web Audio API when alert opens
  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBeep = (delay, freq, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);
        
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      playBeep(0, 880, 0.3);
      playBeep(0.4, 880, 0.3);
      playBeep(0.8, 1200, 0.6);

    } catch (e) {
      console.warn("Could not play triage audio alert:", e);
    }
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-red-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-red-500 animate-flash-red p-8 text-center text-white relative">
        <div className="inline-flex p-5 bg-red-100 text-red-600 rounded-full mb-6">
          <AlertOctagon className="w-16 h-16 animate-bounce" />
        </div>

        <h1 className="text-4xl font-extrabold text-red-600 tracking-tight">🔴 {t.emergencyTitle}</h1>
        <h2 className="text-xl font-bold text-slate-800 mt-2">{t.emergencySub}</h2>
        
        <p className="text-slate-600 font-semibold text-lg mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          "{reason || t.emergencySub}"
        </p>

        <div className="mt-8 space-y-4">
          <p className="text-2xl font-black text-red-700 bg-red-50 py-4 px-6 rounded-2xl border border-red-200 inline-block">
            🚨 {t.emergencyAction}
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-10">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
          >
            {t.ackBtn}
          </button>
          
          <a
            href="tel:102"
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20"
          >
            <PhoneCall className="w-4 h-4" /> {t.callEr}
          </a>
        </div>

        <div className="mt-6 text-[10px] text-slate-400">
          A high-priority alert payload has been sent automatically to the OPD Nursing Station.
        </div>
      </div>
    </div>
  );
}
