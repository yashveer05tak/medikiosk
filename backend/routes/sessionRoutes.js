import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { Session } from '../models/Session.js';
import { checkTriage } from '../utils/triage.js';
import { exportToFHIR } from '../utils/fhirExporter.js';

const router = express.Router();

// Config for document upload simulation
const upload = multer({ dest: 'uploads/' });

/**
 * Helper to generate Markdown Physician Summary
 */
const generatePhysicianSummary = (session) => {
  const { sessionId, abhaId, language, opdType, isRedFlag, redFlagReason, clinicalData } = session;
  const hpi = clinicalData?.hpi || {};
  const ayush = clinicalData?.ayushParameters || {};
  const docs = clinicalData?.extractedDocuments || [];

  let summary = `# Viora AI Clinical Intake Summary\n\n`;
  summary += `**Session ID**: \`${sessionId}\`  \n`;
  summary += `**ABHA ID**: ${abhaId || 'Not Provided'}  \n`;
  summary += `**Language**: ${language.toUpperCase()}  \n`;
  summary += `**OPD Category**: ${opdType === 'ayush' ? 'AYUSH OPD' : 'Allopathic (Modern Medicine) OPD'}  \n`;
  summary += `**Triage Status**: ${isRedFlag ? '🔴 **URGENT EMERGENCY RED-FLAG**' : '🟢 **ROUTINE**'}  \n`;
  
  if (isRedFlag && redFlagReason) {
    summary += `> ⚠️ **Triage Alert**: ${redFlagReason}\n\n`;
  } else {
    summary += `\n`;
  }

  summary += `## 1. Chief Complaint (CC)\n`;
  summary += `${clinicalData?.chiefComplaint || 'None reported.'}\n\n`;

  summary += `## 2. History of Present Illness (HPI) - SOCRATES\n`;
  summary += `- **Onset (When):** ${hpi.onset || 'Not specified'}\n`;
  summary += `- **Location (Where):** ${hpi.location || 'Not specified'}\n`;
  summary += `- **Duration/Frequency:** ${hpi.duration || 'Not specified'}\n`;
  summary += `- **Character (Pain type):** ${hpi.character || 'Not specified'}\n`;
  summary += `- **Aggravating Factors:** ${hpi.aggravating || 'Not specified'}\n`;
  summary += `- **Relieving Factors:** ${hpi.relieving || 'Not specified'}\n`;
  summary += `- **Severity (1-10):** ${hpi.severity ? `⭐ ${hpi.severity}/10` : 'Not rated'}\n\n`;

  if (opdType === 'ayush') {
    summary += `## 3. AYUSH Assessment (Dashavidha Pariksha)\n`;
    summary += `- **Agni (Digestive Power):** ${ayush.agni || 'Not assessed'}\n`;
    summary += `- **Koshtha (Bowel Pattern):** ${ayush.koshtha || 'Not assessed'}\n`;
    summary += `- **Diet & Lifestyle (Ahara-Vihara):** ${ayush.prakritiNotes || 'None reported'}\n\n`;
  }

  summary += `## 4. Past Medical History & Active Medications (Integrated)\n`;
  
  if (docs.length === 0) {
    summary += `*No scanned historical records added.*\n`;
  } else {
    docs.forEach((doc, idx) => {
      summary += `### Report #${idx + 1}: ${doc.docType} (${doc.date || 'Undated'})\n`;
      if (doc.abnormalFindings && doc.abnormalFindings.length > 0) {
        summary += `- **Abnormal Lab Values / Indicators:**\n`;
        doc.abnormalFindings.forEach(f => {
          summary += `  - 🚨 *${f}*\n`;
        });
      }
      if (doc.timeline && doc.timeline.length > 0) {
        summary += `- **Timeline / Diagnoses:**\n`;
        doc.timeline.forEach(t => {
          summary += `  - ${t}\n`;
        });
      }
      if (doc.medications && doc.medications.length > 0) {
        summary += `- **Extracted Medications:**\n`;
        doc.medications.forEach(m => {
          summary += `  - 💊 ${m}\n`;
        });
      }
      summary += `\n`;
    });
  }

  return summary;
};

// 1. POST /api/sessions/start
router.post('/start', async (req, res) => {
  try {
    const { abhaId, language, opdType } = req.body;
    const sessionId = crypto.randomUUID();

    const sessionData = {
      sessionId,
      abhaId: abhaId || '',
      language: language || 'en',
      opdType: opdType || 'allopathic',
      isRedFlag: false,
      redFlagReason: null,
      clinicalData: {
        chiefComplaint: '',
        hpi: {
          onset: '',
          location: '',
          duration: '',
          character: '',
          aggravating: '',
          relieving: '',
          severity: 0
        },
        ayushParameters: {
          agni: '',
          koshtha: '',
          prakritiNotes: ''
        },
        extractedDocuments: []
      },
      physicianSummary: ''
    };

    const session = await Session.create(sessionData);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /api/sessions/:id/update
router.post('/:id/update', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { chiefComplaint, hpi, ayushParameters, language, opdType } = req.body;

    // Retrieve existing session
    const currentSession = await Session.findOne({ sessionId });
    if (!currentSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Run triage checker
    const allSymptomsToCheck = [];
    if (chiefComplaint) allSymptomsToCheck.push(chiefComplaint);
    if (hpi?.character) allSymptomsToCheck.push(hpi.character);
    if (hpi?.location) allSymptomsToCheck.push(hpi.location);

    const triageResult = checkTriage(chiefComplaint || '', allSymptomsToCheck);

    const updateFields = {
      $set: {
        'clinicalData.chiefComplaint': chiefComplaint !== undefined ? chiefComplaint : currentSession.clinicalData.chiefComplaint,
        'clinicalData.hpi.onset': hpi?.onset !== undefined ? hpi.onset : currentSession.clinicalData.hpi.onset,
        'clinicalData.hpi.location': hpi?.location !== undefined ? hpi.location : currentSession.clinicalData.hpi.location,
        'clinicalData.hpi.duration': hpi?.duration !== undefined ? hpi.duration : currentSession.clinicalData.hpi.duration,
        'clinicalData.hpi.character': hpi?.character !== undefined ? hpi.character : currentSession.clinicalData.hpi.character,
        'clinicalData.hpi.aggravating': hpi?.aggravating !== undefined ? hpi.aggravating : currentSession.clinicalData.hpi.aggravating,
        'clinicalData.hpi.relieving': hpi?.relieving !== undefined ? hpi.relieving : currentSession.clinicalData.hpi.relieving,
        'clinicalData.hpi.severity': hpi?.severity !== undefined ? Number(hpi.severity) : currentSession.clinicalData.hpi.severity,
        'clinicalData.ayushParameters.agni': ayushParameters?.agni !== undefined ? ayushParameters.agni : currentSession.clinicalData.ayushParameters.agni,
        'clinicalData.ayushParameters.koshtha': ayushParameters?.koshtha !== undefined ? ayushParameters.koshtha : currentSession.clinicalData.ayushParameters.koshtha,
        'clinicalData.ayushParameters.prakritiNotes': ayushParameters?.prakritiNotes !== undefined ? ayushParameters.prakritiNotes : currentSession.clinicalData.ayushParameters.prakritiNotes,
        isRedFlag: triageResult.isRedFlag,
        redFlagReason: triageResult.reason,
      }
    };

    if (language) updateFields.$set.language = language;
    if (opdType) updateFields.$set.opdType = opdType;

    // Perform database update
    const updatedSession = await Session.findOneAndUpdate({ sessionId }, updateFields, { new: true });
    
    // Regenerate Summary
    const updatedObj = updatedSession.toObject ? updatedSession.toObject() : updatedSession;
    const summary = generatePhysicianSummary(updatedObj);
    
    await Session.findOneAndUpdate({ sessionId }, { $set: { physicianSummary: summary } });
    updatedObj.physicianSummary = summary;

    res.json({
      session: updatedObj,
      isRedFlag: triageResult.isRedFlag,
      redFlagReason: triageResult.reason,
      normalizedTerms: triageResult.normalizedTerms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /api/sessions/:id/upload
// Handles simulated document ingestion, extracting abnormal lab values and past medication list
router.post('/:id/upload', upload.single('document'), async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { docText, docType } = req.body; // text payload fallback if no OCR engine is set up

    const currentSession = await Session.findOne({ sessionId });
    if (!currentSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Intelligence Parsing Engine (Simulated regex logic matching Hb and Fasting blood sugar)
    const textToScan = docText || req.file?.originalname || 'Mock Lab Report';
    const abnormalFindings = [];
    const timeline = [];
    const medications = [];

    const lowerText = textToScan.toLowerCase();

    // Check Hb (Hemoglobin)
    const hbRegex = /(?:hb|hemoglobin)\s*[:<=\s]*\s*([0-9.]+)/i;
    const hbMatch = lowerText.match(hbRegex);
    if (hbMatch) {
      const hbVal = parseFloat(hbMatch[1]);
      if (hbVal < 10) {
        abnormalFindings.push(`Hemoglobin is low: ${hbVal} g/dL (Normal: 12-16 g/dL)`);
      } else {
        abnormalFindings.push(`Hemoglobin level: ${hbVal} g/dL`);
      }
    } else if (lowerText.includes('low hemoglobin') || lowerText.includes('hb 9') || lowerText.includes('hb < 10')) {
      abnormalFindings.push('Hb < 10 g/dL (Anemia indicator detected)');
    }

    // Check FBS (Fasting Blood Sugar)
    const fbsRegex = /(?:fbs|fasting blood sugar|sugar|glucose)\s*[:>=\s]*\s*([0-9.]+)/i;
    const fbsMatch = lowerText.match(fbsRegex);
    if (fbsMatch) {
      const fbsVal = parseFloat(fbsMatch[1]);
      if (fbsVal > 140) {
        abnormalFindings.push(`Fasting Blood Sugar is high: ${fbsVal} mg/dL (Normal: < 100 mg/dL)`);
      } else {
        abnormalFindings.push(`Fasting Blood Sugar level: ${fbsVal} mg/dL`);
      }
    } else if (lowerText.includes('high sugar') || lowerText.includes('diabetes') || lowerText.includes('fbs 150')) {
      abnormalFindings.push('Fasting Blood Sugar > 140 mg/dL (Diabetes/Hyperglycemia indicator detected)');
    }

    // Timeline and Diagnoses extraction
    if (lowerText.includes('hypertension') || lowerText.includes('bp high') || lowerText.includes('high blood pressure')) {
      timeline.push('Hypertension diagnosed (reported in history)');
    }
    if (lowerText.includes('asthma') || lowerText.includes('wheezing')) {
      timeline.push('Bronchial Asthma history');
    }
    if (lowerText.includes('appendectomy') || lowerText.includes('appendix removed')) {
      timeline.push('History of Appendectomy (Surgical)');
    }

    // Medication extraction
    if (lowerText.includes('metformin')) {
      medications.push('Metformin 500mg (Anti-diabetic)');
    }
    if (lowerText.includes('amlodipine') || lowerText.includes('amlo')) {
      medications.push('Amlodipine 5mg (Anti-hypertensive)');
    }
    if (lowerText.includes('pantoprazole') || lowerText.includes('pan-d')) {
      medications.push('Pantoprazole 40mg (Antacid)');
    }
    if (lowerText.includes('paracetamol') || lowerText.includes('dolo')) {
      medications.push('Paracetamol 650mg (Analgesic)');
    }

    // Fallbacks if nothing matched
    if (abnormalFindings.length === 0) abnormalFindings.push('No obvious out-of-range parameters found.');
    if (timeline.length === 0) timeline.push('No prior surgical or medical diagnoses detected.');
    if (medications.length === 0) medications.push('No current active medications detected in document.');

    const newDocument = {
      docType: docType || 'Lab Report',
      date: new Date().toISOString().split('T')[0],
      abnormalFindings,
      timeline,
      medications
    };

    const updatedSession = await Session.findOneAndUpdate(
      { sessionId },
      { $push: { 'clinicalData.extractedDocuments': newDocument } },
      { new: true }
    );

    // Regenerate Summary with documents included
    const updatedObj = updatedSession.toObject ? updatedSession.toObject() : updatedSession;
    const summary = generatePhysicianSummary(updatedObj);
    
    await Session.findOneAndUpdate({ sessionId }, { $set: { physicianSummary: summary } });
    updatedObj.physicianSummary = summary;

    res.json(updatedObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/sessions/:id/summary
router.get('/:id/summary', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionObj = session.toObject ? session.toObject() : session;
    const fhirBundle = exportToFHIR(sessionObj);

    res.json({
      session: sessionObj,
      physicianSummary: sessionObj.physicianSummary,
      fhirBundle
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
