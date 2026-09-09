/**
 * Middleware & helper to sanitize Personally Identifiable Information (PII)
 * before processing text through external LLMs or saving raw transcripts.
 * Redacts:
 * - 12-digit Indian Aadhaar Numbers (\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b)
 * - 10-digit Indian Mobile Numbers (\b[6-9]\d{9}\b)
 * - Email addresses
 */

export const sanitizeText = (rawText = '') => {
  if (typeof rawText !== 'string') return rawText;

  let cleaned = rawText;

  // 1. Redact Aadhaar Numbers (e.g. 9123 4567 8901 or 9123-4567-8901)
  cleaned = cleaned.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[REDACTED AADHAAR]');

  // 2. Redact 10-digit Phone Numbers
  cleaned = cleaned.replace(/\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g, '[REDACTED PHONE]');

  // 3. Redact Email Addresses
  cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED EMAIL]');

  return cleaned;
};

export const piiSanitizerMiddleware = (req, res, next) => {
  if (req.body) {
    if (req.body.chiefComplaint) {
      req.body.chiefComplaint = sanitizeText(req.body.chiefComplaint);
    }
    if (req.body.rawText) {
      req.body.rawText = sanitizeText(req.body.rawText);
    }
    if (req.body.transcription) {
      req.body.transcription = sanitizeText(req.body.transcription);
    }
  }
  next();
};
