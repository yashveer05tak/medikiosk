import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Modern clinical AI service for MediKiosk.
 * The model receives the initial complaint and adaptive interview answers.
 */
export const structureClinicalCase = async (rawInput, language = 'en', clinicalAnswers = {}, patientMeta = {}) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
SYSTEM ROLE: You are a cautious modern clinical documentation assistant for MediKiosk.
TASK: Convert the patient's complaint and adaptive interview answers into strict JSON SOAP format. Identify urgent red flags, use modern clinical terminology, and never claim a confirmed diagnosis. Recommend clinician review and appropriate diagnostic tests. Do not use Ayurvedic, AYUSH, dosha, prakriti, agni, koshtha, or traditional medicine terminology.

PATIENT COMPLAINT (${language.toUpperCase()}): ${rawInput}
ADAPTIVE INTERVIEW ANSWERS: ${JSON.stringify(clinicalAnswers)}
PATIENT CONTEXT: ${JSON.stringify(patientMeta)}

RETURN JSON ONLY:
{
  "subjective": {
    "primaryComplaints": "Clear summary in English",
    "duration": "Duration or Not specified",
    "symptomSeverity": 0,
    "medicalHistory": [],
    "allergies": [],
    "associatedSymptoms": []
  },
  "objective": {
    "physicalSymptoms": [],
    "vitals": "Not recorded",
    "clinicalFindings": [],
    "interviewAnswers": {}
  },
  "assessment": {
    "preliminaryDiagnosis": "Most likely clinical impression, not confirmed",
    "differentialDiagnosis": [],
    "riskLevel": "routine|soon|urgent|emergency",
    "reasoning": "Brief evidence-based reasoning",
    "redFlags": []
  },
  "plan": {
    "recommendedTests": [],
    "dietLifestyleAdvice": [],
    "medications": ["Medication decisions require clinician review"],
    "followUp": "Recommended follow-up timing"
  }
}`;
      const result = await model.generateContent(prompt);
      const cleanJsonStr = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJsonStr);
    } catch (err) {
      console.warn('LLM call failed; using modern clinical fallback:', err.message);
    }
  }

  return generateModernClinicalFallback(rawInput, language, clinicalAnswers);
};

function generateModernClinicalFallback(rawInput = '', language = 'en', clinicalAnswers = {}) {
  const text = rawInput.toLowerCase();
  const isCardiac = /chest|heart|pressure|palpitation|सीने|நெஞ்சு/.test(text);
  const isRespiratory = /cough|breath|breathing|wheeze|asthma|lung|फेफ|சுவாச/.test(text);
  const isJoint = /knee|joint|back|neck|shoulder|muscle|bone|pain|घुटने|முழங்கால்/.test(text);
  const isGastric = /burn|stomach|abdominal|abdomen|acid|vomit|nausea|diarrhea|constipation|पेट|வயிறு/.test(text);

  let primaryComplaints = rawInput || 'Patient reported feeling unwell.';
  let physicalSymptoms = [];
  let preliminaryDiagnosis = 'Undifferentiated symptom requiring clinical evaluation';
  let differentialDiagnosis = ['Infection or inflammatory condition', 'Medication or lifestyle-related cause'];
  let recommendedTests = ['Complete Blood Count (CBC)', 'Basic vital signs assessment'];
  let riskLevel = 'routine';
  let reasoning = 'The available history is limited; clinician assessment is required.';
  let redFlags = [];
  let followUp = 'Arrange routine clinician review and return sooner if symptoms worsen.';

  if (isCardiac) {
    primaryComplaints = 'Chest discomfort with possible cardiopulmonary symptoms';
    physicalSymptoms = ['Chest discomfort', 'Possible shortness of breath'];
    preliminaryDiagnosis = 'Possible acute coronary syndrome or other cardiopulmonary chest pain';
    differentialDiagnosis = ['Myocardial infarction', 'Pulmonary embolism', 'Gastroesophageal reflux', 'Musculoskeletal chest pain'];
    recommendedTests = ['Immediate 12-lead ECG', 'High-sensitivity troponin', 'Blood pressure and oxygen saturation', 'Chest X-ray if clinically indicated'];
    riskLevel = 'urgent';
    reasoning = 'Chest symptoms require prompt assessment to exclude life-threatening cardiac and pulmonary causes.';
    redFlags = ['Radiation to arm, jaw, or back', 'Breathlessness, sweating, fainting, or severe worsening'];
    followUp = 'Seek emergency care immediately if symptoms are severe, persistent, or associated with the listed red flags.';
  } else if (isRespiratory) {
    primaryComplaints = 'Respiratory symptoms with cough or breathing difficulty';
    physicalSymptoms = ['Cough or breathing difficulty', 'Possible wheeze'];
    preliminaryDiagnosis = 'Respiratory infection or airway inflammation';
    differentialDiagnosis = ['Asthma exacerbation', 'Pneumonia', 'Viral upper respiratory infection', 'Pulmonary embolism if sudden or severe'];
    recommendedTests = ['Oxygen saturation', 'Respiratory rate and chest examination', 'Chest X-ray if fever, low oxygen, or focal findings'];
    riskLevel = 'soon';
    reasoning = 'The symptom pattern may reflect airway or lung disease; severity and oxygenation determine urgency.';
  } else if (isJoint) {
    primaryComplaints = 'Localized musculoskeletal pain with possible movement-related limitation';
    physicalSymptoms = ['Localized pain', 'Possible stiffness or reduced range of motion'];
    preliminaryDiagnosis = 'Mechanical musculoskeletal pain, possible osteoarthritis';
    differentialDiagnosis = ['Soft tissue injury', 'Inflammatory arthritis', 'Fracture if trauma occurred', 'Nerve-related pain'];
    recommendedTests = ['Focused joint and neurological examination', 'X-ray if persistent, traumatic, or associated with swelling'];
    reasoning = 'Movement pattern, trauma, swelling, and neurological symptoms help distinguish mechanical, inflammatory, and nerve-related causes.';
  } else if (isGastric) {
    primaryComplaints = 'Upper or lower gastrointestinal symptoms with abdominal discomfort';
    physicalSymptoms = ['Abdominal discomfort', 'Possible nausea, reflux, or bowel change'];
    preliminaryDiagnosis = 'Dyspepsia, reflux, or acute gastrointestinal illness';
    differentialDiagnosis = ['Gastritis or peptic ulcer disease', 'Gastroenteritis', 'Gallbladder disease', 'Appendicitis if localized worsening pain'];
    recommendedTests = ['Abdominal examination', 'CBC and metabolic panel if persistent or severe', 'Pregnancy test when clinically appropriate', 'Ultrasound if focal or ongoing pain'];
    reasoning = 'Food relation, hydration, bleeding, vomiting, and pain location guide gastrointestinal risk assessment.';
    riskLevel = 'soon';
  }

  const severity = clinicalAnswers.impact === 'Severe' || riskLevel === 'urgent' ? 8 : clinicalAnswers.impact === 'Moderate' ? 5 : 3;
  if (clinicalAnswers.redFlags === 'Yes' || clinicalAnswers.deficit === 'Yes' || clinicalAnswers.swelling === 'Yes') {
    riskLevel = 'urgent';
    redFlags.push('Positive red-flag response in adaptive interview');
  }

  return {
    subjective: {
      primaryComplaints,
      duration: 'Not specified',
      symptomSeverity: severity,
      medicalHistory: ['Not documented'],
      allergies: ['Not documented'],
      associatedSymptoms: Object.entries(clinicalAnswers).map(([question, answer]) => `${question}: ${answer}`)
    },
    objective: {
      physicalSymptoms,
      vitals: 'Not recorded',
      clinicalFindings: ['No physical examination findings entered'],
      interviewAnswers: clinicalAnswers
    },
    assessment: {
      preliminaryDiagnosis,
      differentialDiagnosis,
      riskLevel,
      reasoning,
      redFlags
    },
    plan: {
      recommendedTests,
      dietLifestyleAdvice: ['Hydrate as tolerated', 'Record symptom progression and triggers', 'Do not delay urgent care for severe or worsening symptoms'],
      medications: ['Medication decisions require clinician review'],
      followUp
    }
  };
}
