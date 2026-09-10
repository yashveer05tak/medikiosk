import React, { useState } from 'react';
import { FileText, Code, CheckCircle, Download, RotateCcw, Copy } from 'lucide-react';

export default function SummaryView({ summaryText, fhirBundle, onRestart, language = 'hi' }) {
  const [activeTab, setActiveTab] = useState('physician'); // 'physician' or 'fhir'
  const [copied, setCopied] = useState(false);
  const isEnglish = language === 'en';

  // A light-weight parser to render markdown into basic styled HTML elements
  const renderMarkdown = (mdString = '') => {
    return mdString.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 mt-6">{trimmed.slice(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 mt-5">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-teal-700 mb-2 mt-4">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith('- ')) {
        // Parse bold text like - **Onset:** 2 hours ago
        const cleanContent = parseBoldText(trimmed.slice(2));
        return <li key={idx} className="ml-5 list-disc text-slate-700 text-sm mb-1">{cleanContent}</li>;
      }
      if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
        return <p key={idx} className="text-sm italic text-slate-500 my-2">{trimmed.slice(1, -1)}</p>;
      }
      if (trimmed.startsWith('> ')) {
        const cleanContent = parseBoldText(trimmed.slice(2));
        return (
          <blockquote key={idx} className="border-l-4 border-amber-500 bg-amber-50 text-amber-900 p-4 rounded-r-xl my-4 text-sm font-medium">
            {cleanContent}
          </blockquote>
        );
      }
      
      if (trimmed === '') return <div key={idx} className="h-2"></div>;

      return <p key={idx} className="text-slate-700 text-sm leading-relaxed mb-2">{parseBoldText(line)}</p>;
    });
  };

  const parseBoldText = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      // odd indices are bold matches
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'physician' ? summaryText : JSON.stringify(fhirBundle, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medikiosk-fhir-${fhirBundle?.id || 'bundle'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Complete Banner */}
      <div className="bg-emerald-600 text-white rounded-3xl p-8 mb-8 text-center relative overflow-hidden shadow-lg shadow-emerald-600/10">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 bg-emerald-500/20 rounded-full"></div>
        <div className="inline-flex p-3 bg-white/10 rounded-full mb-4">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold">{isEnglish ? 'Clinical Intake Completed Successfully' : 'क्लिनिकल पंजीकरण सफलतापूर्वक पूरा हुआ'}</h2>
        <p className="opacity-90 mt-2 text-base">{isEnglish ? 'Your patient summary and ABDM-FHIR bundles are compiled for the clinician.' : 'आपका रोगी सारांश और ABDM-FHIR बंडल चिकित्सक के लिए तैयार हैं।'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Summary Panel */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tabs & Utilities bar */}
            <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 px-6 py-4 flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('physician')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'physician'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" /> {isEnglish ? 'Physician Summary' : 'चिकित्सक सारांश'}
                </button>
                <button
                  onClick={() => setActiveTab('fhir')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'fhir'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Code className="w-4 h-4" /> {isEnglish ? 'FHIR JSON Payload' : 'FHIR JSON डेटा'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? (isEnglish ? 'Copied!' : 'कॉपी हो गया!') : (isEnglish ? 'Copy' : 'कॉपी करें')}
                </button>
                {activeTab === 'fhir' && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-100 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> {isEnglish ? 'Download FHIR' : 'FHIR डाउनलोड करें'}
                  </button>
                )}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-8">
              {activeTab === 'physician' ? (
                <div className="prose max-w-none">
                  {renderMarkdown(summaryText)}
                </div>
              ) : (
                <div className="relative">
                  <pre className="bg-slate-900 text-teal-400 p-6 rounded-2xl overflow-x-auto text-xs font-mono max-h-[500px]">
                    {JSON.stringify(fhirBundle, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Options */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-teal-950 text-white p-6 rounded-3xl shadow-md">
            <h3 className="font-bold text-lg mb-3">{isEnglish ? 'Clinician Integration' : 'चिकित्सक एकीकरण'}</h3>
            <p className="text-xs text-teal-300 leading-relaxed">
              {isEnglish ? "This summary is ready to be fetched by the doctor's EMR workspace automatically via the session UUID." : 'यह सारांश सत्र UUID के माध्यम से डॉक्टर के ईएमआर कार्यक्षेत्र में स्वतः प्राप्त किया जा सकता है।'}
            </p>
            <div className="border-t border-teal-800 my-4 pt-4">
              <span className="block text-[10px] text-teal-400 uppercase tracking-wider font-bold">{isEnglish ? 'FHIR Standards Used:' : 'उपयोग किए गए FHIR मानक:'}</span>
              <ul className="text-xs text-teal-100 mt-2 space-y-1.5">
                <li>• Bundle (Collection)</li>
                <li>• Patient Demographics</li>
                <li>• Clinical Condition (CC)</li>
                <li>• Observation (SOCRATES)</li>
                <li>• AYUSH Digestion Parameters</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-teal-500/10 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-5 h-5" /> {isEnglish ? 'Start Next Intake' : 'अगला पंजीकरण शुरू करें'}
          </button>
        </div>
      </div>
    </div>
  );
}
