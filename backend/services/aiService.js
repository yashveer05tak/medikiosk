import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Modern clinical AI service for Viora.
 * The model receives the initial complaint and adaptive interview answers.
 */
export const structureClinicalCase = async (rawInput, language = 'en', clinicalAnswers = {}, patientMeta = {}) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });
      const prompt = `
SYSTEM ROLE: You are a cautious modern clinical documentation assistant for Viora.
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
      return enforcePatientSafety(JSON.parse(cleanJsonStr));
    } catch (err) {
      console.warn('LLM call failed; using modern clinical fallback:', err.message);
    }
  }

  return generateModernClinicalFallback(rawInput, language, clinicalAnswers);
};

function enforcePatientSafety(structuredCase) {
  const safeCase = structuredCase && typeof structuredCase === 'object' ? structuredCase : {};
  safeCase.plan = safeCase.plan && typeof safeCase.plan === 'object' ? safeCase.plan : {};
  safeCase.plan.precautionaryMeasures = Array.isArray(safeCase.plan.precautionaryMeasures) && safeCase.plan.precautionaryMeasures.length
    ? safeCase.plan.precautionaryMeasures.slice(0, 6)
    : ['Monitor symptoms and record changes', 'Hydrate as tolerated if you can keep fluids down', 'Seek urgent care for severe or rapidly worsening symptoms'];
  safeCase.plan.medications = ['Do not self-start tablets. Medication choice and dose require clinician review, especially with allergies, pregnancy, age, or other medicines.'];
  return safeCase;
}

export const generateClinicalQuestions = async (rawInput, language = 'en', patientMeta = {}) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });
      const prompt = `
SYSTEM ROLE: You are a cautious clinical intake assistant. Generate questions for a patient before a clinician visit.
RULES: Ask only history and safety questions. Do not diagnose, prescribe, recommend a drug, or request unnecessary personal identifiers. Include red-flag questions when relevant. Return exactly 3 to 5 useful questions. Keep language simple and use the requested language where possible.
PATIENT COMPLAINT (${language.toUpperCase()}): ${rawInput}
PATIENT CONTEXT: ${JSON.stringify(patientMeta)}

RETURN JSON ONLY:
{"questions":[{"id":"shortStableId","label":"Patient-friendly question","options":["No","Yes","Not sure"]}]}`;
      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
      const questions = normalizeClinicalQuestions(parsed.questions);
      if (questions.length >= 3) return questions;
    } catch (err) {
      console.warn('AI question generation failed; using local clinical fallback:', err.message);
    }
  }

  return generateQuestionFallback(rawInput);
};

function normalizeClinicalQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter((question) => question && typeof question.label === 'string' && Array.isArray(question.options))
    .slice(0, 5)
    .map((question, index) => ({
      id: String(question.id || `clinicalQuestion${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || `clinicalQuestion${index + 1}`,
      label: question.label.trim().slice(0, 240),
      options: question.options.filter(option => typeof option === 'string').slice(0, 5).map(option => option.trim()).filter(Boolean)
    }))
    .filter(question => question.options.length >= 2);
}

function generateQuestionFallback(rawInput = '') {
  const text = rawInput.toLowerCase();
  if (/chest|heart|pressure|palpitation|सीने|நெஞ்சு/.test(text)) {
    return [
      { id: 'radiation', label: 'Does the discomfort spread to your arm, jaw, back, or shoulder?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'breathlessness', label: 'Are you short of breath, sweaty, dizzy, or faint?', options: ['No', 'Yes', 'Some of these symptoms'] },
      { id: 'exertion', label: 'Did it begin or worsen with activity?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'onset', label: 'Did it start suddenly?', options: ['No', 'Yes', 'Not sure'] }
    ];
  }
  if (/breath|cough|wheeze|asthma|lung|फेफ|சுவாச/.test(text)) {
    return [
      { id: 'onset', label: 'Did the breathing problem start suddenly?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'fever', label: 'Do you have fever, chills, or cough with phlegm?', options: ['No', 'Yes', 'Some of these symptoms'] },
      { id: 'activity', label: 'Is it worse at rest or during activity?', options: ['At rest', 'During activity', 'Not sure'] },
      { id: 'cyanosis', label: 'Do your lips or face look blue, or are you unable to speak full sentences?', options: ['No', 'Yes', 'Not sure'] }
    ];
  }
  return [
    { id: 'onset', label: 'When did this problem begin?', options: ['Today', 'This week', 'More than a week ago', 'Not sure'] },
    { id: 'impact', label: 'How much is this affecting your normal activities?', options: ['Minimal', 'Moderate', 'Severe'] },
    { id: 'redFlags', label: 'Do you have fainting, severe weakness, confusion, or rapidly worsening symptoms?', options: ['No', 'Yes', 'Not sure'] },
    { id: 'medicines', label: 'Have you taken any medicine for this problem already?', options: ['No', 'Yes', 'Not sure'] }
  ];
}

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
      precautionaryMeasures: ['Rest and monitor symptoms', 'Hydrate as tolerated if you can keep fluids down', 'Seek urgent care for severe or rapidly worsening symptoms'],
      medications: ['Do not self-start tablets. Medication choice and dose require clinician review, especially with allergies, pregnancy, age, or other medicines.'],
      followUp
    }
  };
}
