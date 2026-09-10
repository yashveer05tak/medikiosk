import React, { useState } from 'react';
import { ClipboardList, FileClock, Languages, UploadCloud } from 'lucide-react';
import PatientIntakePortal from './PatientIntakePortal.jsx';
import PatientHistoryView from './PatientHistoryView.jsx';
import { uploadCaseAttachment } from '../services/api.js';

export default function PatientPortalPage({ language, onLanguageChange, onStructureComplete, onRedFlagDetected }) {
  const [page, setPage] = useState('intake');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadState, setUploadState] = useState('');
  const isEnglish = language === 'en';

  const handleStructureComplete = async (payload) => {
    const result = await onStructureComplete(payload);
    if (selectedFiles.length > 0 && result.caseId) {
      setUploadState(isEnglish ? 'Uploading your reports...' : 'आपकी रिपोर्ट अपलोड हो रही हैं...');
      try {
        await Promise.all(selectedFiles.map((file) => uploadCaseAttachment(result.caseId, file)));
        setUploadState(isEnglish ? 'Reports attached to your clinical case.' : 'रिपोर्ट आपके क्लिनिकल केस से जुड़ गई हैं।');
      } catch (error) {
        setUploadState(isEnglish ? 'Case submitted, but one or more reports could not be uploaded.' : 'केस जमा हो गया, लेकिन कुछ रिपोर्ट अपलोड नहीं हो सकीं।');
      }
    }
    return result;
  };

  return (
    <section className="portal-page max-w-6xl mx-auto px-4 py-6 sm:py-10">
      <div className="portal-page-header mb-7 flex flex-col gap-5 rounded-3xl bg-white/80 p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/80 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{isEnglish ? 'Patient Portal' : 'रोगी पोर्टल'}</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">{isEnglish ? 'Your care journey, in one place' : 'आपकी स्वास्थ्य यात्रा, एक ही स्थान पर'}</h2>
          <p className="mt-1 text-sm text-slate-500">{isEnglish ? 'Complete your intake and share reports securely with your doctor.' : 'अपना पंजीकरण पूरा करें और रिपोर्ट डॉक्टर के साथ सुरक्षित रूप से साझा करें।'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPage('intake')} className={`portal-tab ${page === 'intake' ? 'portal-tab-active' : ''}`}><ClipboardList className="w-4 h-4" /> {isEnglish ? 'New Intake' : 'नया पंजीकरण'}</button>
          <button type="button" onClick={() => setPage('history')} className={`portal-tab ${page === 'history' ? 'portal-tab-active' : ''}`}><FileClock className="w-4 h-4" /> {isEnglish ? 'My Records' : 'मेरे रिकॉर्ड'}</button>
          <button type="button" onClick={onLanguageChange} className="portal-tab"><Languages className="w-4 h-4" /> {isEnglish ? 'Language' : 'भाषा'}</button>
        </div>
      </div>

      {page === 'intake' ? (
        <>
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900"><UploadCloud className="w-5 h-5" /> {isEnglish ? 'Attach reports before submitting' : 'जमा करने से पहले रिपोर्ट जोड़ें'}</div>
            <p className="mt-1 text-xs leading-relaxed text-blue-800">{isEnglish ? 'PDF, JPG, PNG, and TXT files will be attached to the clinical case and shown in the doctor review portal after submission.' : 'PDF, JPG, PNG और TXT फाइलें क्लिनिकल केस से जुड़कर जमा करने के बाद डॉक्टर समीक्षा पोर्टल में दिखाई देंगी।'}</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
              className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:font-bold file:text-white hover:file:bg-blue-800"
            />
            {selectedFiles.length > 0 && <p className="mt-2 text-xs font-semibold text-blue-900">{selectedFiles.length} {isEnglish ? 'file(s) ready to attach' : 'फाइलें जोड़ने के लिए तैयार हैं'}</p>}
          </div>
          {uploadState && <div className="mb-5 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-800">{uploadState}</div>}
          <PatientIntakePortal language={language} onStructureComplete={handleStructureComplete} onRedFlagDetected={onRedFlagDetected} />
        </>
      ) : (
        <PatientHistoryView language={language} />
      )}
    </section>
  );
}
