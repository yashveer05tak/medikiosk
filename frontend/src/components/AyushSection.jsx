import React from 'react';
import { Leaf, Sparkles } from 'lucide-react';
import { getTranslation } from '../utils/translations.js';

const PRAKRITI_TYPES = [
  { id: 'Vata', label: 'Vata Dominant (वात)', desc: 'Light, quick, dry nature, prone to joint stiffness and gas.' },
  { id: 'Pitta', label: 'Pitta Dominant (पित्त)', desc: 'Sharp, fiery, intense digestion, prone to acidity and heat.' },
  { id: 'Kapha', label: 'Kapha Dominant (कफ)', desc: 'Steady, heavy, calm, prone to sluggishness and mucus.' },
  { id: 'Vata-Pitta', label: 'Vata-Pitta Dual (वात-पित्त)', desc: 'Combination of variable appetite, dryness, and thermal intensity.' },
  { id: 'Pitta-Kapha', label: 'Pitta-Kapha Dual (पित्त-कफ)', desc: 'Combination of strong metabolism and steady physical build.' },
  { id: 'Tridosha', label: 'Tridosha Balanced (त्रिदोष सम)', desc: 'Balanced harmony across Vata, Pitta, and Kapha doshas.' }
];

export default function AyushSection({ value = {}, onChange, language = 'en' }) {
  const t = getTranslation(language);

  const prakriti = value.prakriti || 'Vata-Pitta';
  const agni = value.agni || 'Mandagni';
  const koshtha = value.koshtha || 'Krura';
  const doshaImbalance = value.doshaImbalance || 'Vata Kopa';

  const updateField = (field, val) => {
    onChange({
      ...value,
      [field]: val
    });
  };

  return (
    <div className="space-y-6 bg-slate-50 border border-teal-200/80 p-6 rounded-3xl">
      <div className="flex items-center gap-2 text-emerald-800 font-bold border-b border-teal-200 pb-3">
        <Leaf className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg">AYUSH & Ayurvedic Assessment Module</h3>
        <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> SIH 2026 Native Feature
        </span>
      </div>

      {/* Prakriti Type Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          1. Prakriti Analysis (शरीर प्रकृति Classification):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRAKRITI_TYPES.map((p) => (
            <div
              key={p.id}
              onClick={() => updateField('prakriti', p.id)}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                prakriti === p.id
                  ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs text-slate-800">{p.label}</div>
              <div className="text-[11px] text-slate-500 mt-1">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agni & Koshtha selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Agni (Digestive Power):
          </label>
          <select
            value={agni}
            onChange={(e) => updateField('agni', e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium"
          >
            <option value="Mandagni">Mandagni (मंदाग्नि - Sluggish Digestion)</option>
            <option value="Tikshnagni">Tikshnagni (तीक्ष्णाग्नि - Sharp/Hyperactive)</option>
            <option value="Vishamagni">Vishamagni (विषमाग्नि - Irregular/Variable)</option>
            <option value="Samagni">Samagni (समाग्नि - Balanced/Normal)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            3. Koshtha (Bowel Pattern):
          </label>
          <select
            value={koshtha}
            onChange={(e) => updateField('koshtha', e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium"
          >
            <option value="Krura">Krura Koshtha (क्रूर - Hard / Constipated)</option>
            <option value="Mridu">Mridu Koshtha (मृदु - Soft / Loose)</option>
            <option value="Madhyama">Madhyama Koshtha (मध्यम - Balanced / Normal)</option>
          </select>
        </div>
      </div>

      {/* Dosha Imbalance */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          4. Observed Dosha Imbalance (दोष प्रकोप Status):
        </label>
        <input
          type="text"
          value={doshaImbalance}
          onChange={(e) => updateField('doshaImbalance', e.target.value)}
          placeholder="e.g. Vata Kopa with Pitta Anubandha (Joint stiffness & burning acid)"
          className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800"
        />
      </div>
    </div>
  );
}
