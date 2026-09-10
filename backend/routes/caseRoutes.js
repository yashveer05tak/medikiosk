import express from 'express';
import multer from 'multer';
import { structureCase, getAllCases, getCaseById, verifyCase, exportCasePDF, uploadCaseAttachment, downloadCaseAttachment } from '../controllers/caseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { piiSanitizerMiddleware } from '../middleware/piiSanitizer.js';

const router = express.Router();
const attachmentUpload = multer({ dest: 'uploads/case-documents/' });

// Public / Protected Intake Structuring
router.post('/structure', protect, piiSanitizerMiddleware, structureCase);

// Doctor & Admin Access Endpoints
router.get('/all', protect, getAllCases);
router.post('/:id/attachments', protect, attachmentUpload.single('document'), uploadCaseAttachment);
router.get('/:id/attachments/:attachmentId', protect, downloadCaseAttachment);
router.get('/:id', protect, getCaseById);
router.put('/:id/verify', protect, authorize('doctor', 'admin'), verifyCase);
router.get('/:id/pdf', protect, exportCasePDF);

export default router;
