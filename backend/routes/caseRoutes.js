import express from 'express';
import { structureCase, getAllCases, getCaseById, verifyCase, exportCasePDF } from '../controllers/caseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { piiSanitizerMiddleware } from '../middleware/piiSanitizer.js';

const router = express.Router();

// Public / Protected Intake Structuring
router.post('/structure', protect, piiSanitizerMiddleware, structureCase);

// Doctor & Admin Access Endpoints
router.get('/all', protect, getAllCases);
router.get('/:id', protect, getCaseById);
router.put('/:id/verify', protect, authorize('doctor', 'admin'), verifyCase);
router.get('/:id/pdf', protect, exportCasePDF);

export default router;
