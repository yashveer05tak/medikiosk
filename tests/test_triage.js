import assert from 'assert';
import { checkTriage } from '../backend/utils/triage.js';
import { exportToFHIR } from '../backend/utils/fhirExporter.js';

console.log('🧪 Starting MediKiosk AI Clinical Triage & FHIR Tests...');

try {
  // Test Case 1: Routine Pain (Knee osteoarthritis simulation)
  const routineResult = checkTriage("I have pain in my right knee. It hurts when I climb stairs.", ["Joint Pain"]);
  assert.strictEqual(routineResult.isRedFlag, false, "Routine knee pain should NOT trigger red flag");
  assert.strictEqual(routineResult.reason, null, "Routine knee pain reason should be null");
  console.log('✅ Passed: Routine Knee Pain triage test');

  // Test Case 2: Cardiac Emergency
  const cardiacResult = checkTriage("I have severe heavy chest pain radiating to left arm. Feeling short of breath.", ["Chest Pain", "Shortness of breath"]);
  assert.strictEqual(cardiacResult.isRedFlag, true, "Cardiac chest pain radiation should trigger red flag");
  assert.match(cardiacResult.reason, /cardiac/i, "Reason should mention cardiac conditions");
  assert.deepStrictEqual(cardiacResult.normalizedTerms, ["presumed angina / substernal chest pressure", "dyspnea"], "Should normalize chest heavy and breathing");
  console.log('✅ Passed: Cardiac Emergency triage test');

  // Test Case 3: Stroke Emergency (Neurological)
  const strokeResult = checkTriage("sudden face droop and slurred speech", ["difficulty speaking"]);
  assert.strictEqual(strokeResult.isRedFlag, true, "Stroke signs (face droop, slurred speech) should trigger red flag");
  assert.match(strokeResult.reason, /stroke/i, "Reason should mention stroke / FAST criteria");
  console.log('✅ Passed: Stroke neurological triage test');

  // Test Case 4: Hemorrhage Emergency
  const bleedingResult = checkTriage("uncontrolled bleeding after injury", ["bleeding"]);
  assert.strictEqual(bleedingResult.isRedFlag, true, "Severe bleeding should trigger red flag");
  assert.match(bleedingResult.reason, /hemorrhage/i, "Reason should mention hemorrhage");
  console.log('✅ Passed: Hemorrhage triage test');

  // Test Case 5: FHIR Export Structure
  const mockSession = {
    sessionId: "test-uuid-12345",
    abhaId: "91-1234-5678-9012",
    language: "hi",
    opdType: "ayush",
    isRedFlag: false,
    clinicalData: {
      chiefComplaint: "Stomach burn",
      hpi: { severity: 4 },
      ayushParameters: {
        agni: "Mandagni",
        koshtha: "Krura"
      }
    }
  };

  const fhirBundle = exportToFHIR(mockSession);
  assert.strictEqual(fhirBundle.resourceType, "Bundle", "Export should return a FHIR Bundle");
  assert.strictEqual(fhirBundle.type, "collection", "Bundle type should be collection");
  assert.ok(fhirBundle.entry.length >= 3, "Bundle should contain multiple entries (Patient, Encounter, Condition)");

  // Check language coding
  const patientResource = fhirBundle.entry[0].resource;
  assert.strictEqual(patientResource.resourceType, "Patient", "First resource should be Patient");
  assert.strictEqual(patientResource.communication[0].language.coding[0].code, "hi", "Language should be Hindi (hi)");

  console.log('✅ Passed: FHIR bundle validation test');
  console.log('🎉 All unit tests passed successfully!');

} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
