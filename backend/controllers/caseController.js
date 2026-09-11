import crypto from 'crypto';
import { CaseSheetModel } from '../models/CaseSheet.js';
import { generateClinicalQuestions, structureClinicalCase } from '../services/aiService.js';
import { checkTriage } from '../utils/triage.js';
import { buildCaseSheetPDF } from '../utils/pdfGenerator.js';
import { sanitizeText } from '../middleware/piiSanitizer.js';

// POST /api/case/structure
export const structureCase = async (req, res) => {
  try {
    const { chiefComplaint, rawText, language, opdType, clinicalAnswers, patientName, abhaId, age, gender } = req.body;
    const inputText = rawText || chiefComplaint || '';

    if (!inputText.trim()) {
      return res.status(400).json({ error: 'Patient clinical narration or text input is required.' });
    }

    // 1. Privacy & Compliance: Strip PII from raw narration
    const sanitizedInput = sanitizeText(inputText);

    // 2. Check Emergency Red Flags
    const triageCheck = checkTriage(sanitizedInput, Object.values(clinicalAnswers || {}));

    // 3. Invoke AI Structuring Engine (Gemini / OpenAI / Clinical NLP Parser)
    const structuredSoap = await structureClinicalCase(sanitizedInput, language || 'en', clinicalAnswers || {}, {
      patientName,
      abhaId
    });

    const caseId = `MEDI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const newCaseData = {
      caseId,
      patientId: req.user?.id || 'anonymous',
      patientName: patientName || req.user?.name || 'Walk-in Patient',
      abhaId: abhaId || req.user?.abhaId || '',
      age: age || '35',
      gender: gender || 'Unspecified',
      language: language || 'en',
      opdType: opdType || 'allopathic',
      rawInput: sanitizedInput,
      isRedFlag: triageCheck.isRedFlag,
      redFlagReason: triageCheck.reason,
      soapNote: structuredSoap,
      isVerified: false, // Must remain false until Doctor approves
      doctorNotes: '',
      verifiedBy: {
        doctorName: '',
        registrationNumber: '',
        verifiedAt: null
      }
    };

    const savedCase = await CaseSheetModel.create(newCaseData);

    res.status(201).json({
      message: 'Case successfully structured into SOAP format.',
      isVerified: false,
      caseId: savedCase.caseId,
      caseData: savedCase
    });
  } catch (error) {
    console.error('Error structuring case:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/case/questions
export const getClinicalQuestions = async (req, res) => {
  try {
    const { complaint, rawText, language, age, gender } = req.body;
    const inputText = rawText || complaint || '';

    if (!inputText.trim()) {
      return res.status(400).json({ error: 'A symptom description is required to generate questions.' });
    }

    const questions = await generateClinicalQuestions(sanitizeText(inputText), language || 'en', { age, gender });
    res.json({ questions, source: process.env.GEMINI_API_KEY ? 'ai' : 'fallback' });
  } catch (error) {
    console.error('Error generating clinical questions:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/case/all
export const getAllCases = async (req, res) => {
  try {
    const cases = await CaseSheetModel.findAll();
    res.json({ cases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/case/:id
export const getCaseById = async (req, res) => {
  try {
    const caseItem = await CaseSheetModel.findByCaseId(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case sheet not found' });
    }
    res.json({ caseSheet: caseItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/case/:id/attachments
export const uploadCaseAttachment = async (req, res) => {
  try {
    const caseItem = await CaseSheetModel.findByCaseId(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case sheet not found' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'A document file is required' });
    }

    const attachment = {
      attachmentId: crypto.randomUUID(),
      originalName: req.file.originalname,
      storedName: req.file.filename,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };

    const updatedCase = await CaseSheetModel.appendAttachment(req.params.id, attachment);
    res.status(201).json({ attachment, caseSheet: updatedCase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/case/:id/attachments/:attachmentId
export const downloadCaseAttachment = async (req, res) => {
  try {
    const caseItem = await CaseSheetModel.findByCaseId(req.params.id);
    const attachment = caseItem?.attachments?.find(item => item.attachmentId === req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    res.download(attachment.path, attachment.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/case/:id/verify
// Doctor Review & Human-in-the-Loop Sign-off Endpoint
export const verifyCase = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { soapNote, doctorNotes, doctorName, registrationNumber } = req.body;

    const existing = await CaseSheetModel.findByCaseId(caseId);
    if (!existing) {
      return res.status(404).json({ error: 'Case sheet not found' });
    }

    const updateFields = {
      isVerified: true,
      doctorNotes: doctorNotes !== undefined ? doctorNotes : existing.doctorNotes,
      verifiedBy: {
        doctorName: req.user?.name || doctorName || 'Doctor',
        registrationNumber: req.user?.registrationNumber || registrationNumber || 'Not provided',
        verifiedAt: new Date()
      }
    };

    if (soapNote) {
      updateFields.soapNote = soapNote;
    }

    const updatedCase = await CaseSheetModel.updateByCaseId(caseId, updateFields);

    res.json({
      message: 'Case verified and signed off successfully.',
      isVerified: true,
      caseSheet: updatedCase
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/case/:id/pdf
export const exportCasePDF = async (req, res) => {
  try {
    const caseId = req.params.id;
    const caseItem = await CaseSheetModel.findByCaseId(caseId);

    if (!caseItem) {
      return res.status(404).json({ error: 'Case sheet not found' });
    }

    buildCaseSheetPDF(caseItem, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
