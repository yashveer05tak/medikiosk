import assert from 'assert';
import { sanitizeText } from '../backend/middleware/piiSanitizer.js';
import { structureClinicalCase } from '../backend/services/aiService.js';
import { CaseSheetModel } from '../backend/models/CaseSheet.js';
import { checkTriage } from '../backend/utils/triage.js';

console.log('Starting Viora SIH 2026 Verification Test Suite...');

try {
  const rawPiiText = 'My phone is 9876543210 and Aadhaar is 1234 5678 9012. I have chest pain.';
  const sanitized = sanitizeText(rawPiiText);
  assert.ok(!sanitized.includes('9876543210'), 'Phone number should be redacted');
  assert.ok(!sanitized.includes('1234 5678 9012'), 'Aadhaar number should be redacted');
  assert.ok(sanitized.includes('[REDACTED PHONE]'), 'Should place redacted phone marker');
  assert.ok(sanitized.includes('[REDACTED AADHAAR]'), 'Should place redacted Aadhaar marker');
  console.log('Passed: PII Sanitization & Redaction Engine Test');

  const rawComplaint = 'Severe chest pain and difficulty breathing for two hours.';
  const clinicalAnswers = { radiation: 'Yes', breathlessness: 'Some of these symptoms', impact: 'Severe' };
  const soapResult = await structureClinicalCase(rawComplaint, 'en', clinicalAnswers);
  assert.ok(soapResult.subjective, 'SOAP note should contain Subjective section');
  assert.ok(soapResult.objective, 'SOAP note should contain Objective section');
  assert.ok(soapResult.assessment, 'SOAP note should contain Assessment section');
  assert.ok(soapResult.plan, 'SOAP note should contain Plan section');
  assert.strictEqual(soapResult.assessment.riskLevel, 'urgent', 'Chest symptoms should receive urgent risk level');
  assert.ok(soapResult.objective.interviewAnswers.radiation, 'Adaptive interview answers should be stored');
  console.log('Passed: AI LLM SOAP Structuring Engine Test');

  const triageResult = checkTriage('severe chest pain radiating to left arm', []);
  assert.strictEqual(triageResult.isRedFlag, true, 'Cardiac chest pain should trigger emergency red flag');
  console.log('Passed: Emergency Red-Flag Triage Test');

  const testCase = await CaseSheetModel.create({
    caseId: 'TEST-CASE-8842',
    patientName: 'Ramesh Patel',
    rawInput: 'Severe stomach burn for 3 weeks',
    soapNote: soapResult,
    isVerified: false
  });
  assert.strictEqual(testCase.isVerified, false, 'Initial status MUST be isVerified: false');
  console.log('Passed: Case Sheet Initial Status Test');

  const updatedCase = await CaseSheetModel.updateByCaseId('TEST-CASE-8842', {
    isVerified: true,
    doctorNotes: 'Approved by Dr. Sharma',
    verifiedBy: { doctorName: 'Dr. Rajesh Sharma', registrationNumber: 'MED-2026' }
  });
  assert.strictEqual(updatedCase.isVerified, true, 'Doctor sign-off MUST update status to isVerified: true');
  console.log('Passed: Doctor Verification Sign-off Test');
  console.log('ALL Viora TESTS PASSED SUCCESSFULLY!');
} catch (err) {
  console.error('Test failed:', err);
  process.exit(1);
}