export const QUESTION_GROUPS = [
  {
    id: 'cardiac',
    keywords: ['chest', 'heart', 'cardiac', 'pressure', 'palpitation', 'pain in chest', ' सीने ', 'நெஞ்சு'],
    title: 'Cardiovascular follow-up',
    questions: [
      { id: 'radiation', label: 'Does the discomfort spread to your arm, jaw, back, or shoulder?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'breathlessness', label: 'Are you short of breath, sweaty, dizzy, or nauseated with it?', options: ['No', 'Yes', 'Some of these symptoms'] },
      { id: 'exertion', label: 'Did it begin or worsen with exertion, and improve with rest?', options: ['No', 'Yes', 'Not sure'] }
    ]
  },
  {
    id: 'respiratory',
    keywords: ['cough', 'breath', 'breathing', 'wheeze', 'asthma', 'lung', 'फेफ', 'சுவாச'],
    title: 'Respiratory follow-up',
    questions: [
      { id: 'onset', label: 'Did the breathing problem start suddenly or gradually?', options: ['Suddenly', 'Gradually', 'Not sure'] },
      { id: 'fever', label: 'Do you have fever, chills, or cough with phlegm?', options: ['No', 'Yes', 'Some of these symptoms'] },
      { id: 'activity', label: 'Is it worse at rest, during activity, or at night?', options: ['At rest', 'During activity', 'At night', 'No clear pattern'] }
    ]
  },
  {
    id: 'gastrointestinal',
    keywords: ['stomach', 'abdominal', 'abdomen', 'vomit', 'nausea', 'diarrhea', 'constipation', 'acid', 'burn', 'पेट', 'வயிறு'],
    title: 'Digestive follow-up',
    questions: [
      { id: 'foodRelation', label: 'Is the symptom related to eating or particular foods?', options: ['No', 'Worse after eating', 'Better after eating', 'Not sure'] },
      { id: 'bowel', label: 'Have you noticed blood in vomit or stool, black stool, or persistent vomiting?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'hydration', label: 'Are you able to keep fluids down and pass urine normally?', options: ['Yes', 'No', 'Not sure'] }
    ]
  },
  {
    id: 'neurological',
    keywords: ['headache', 'head pain', 'dizzy', 'weakness', 'numb', 'seizure', 'vision', 'migraine', 'सिर', 'தலை'],
    title: 'Neurological follow-up',
    questions: [
      { id: 'sudden', label: 'Did the symptom reach maximum intensity suddenly?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'deficit', label: 'Do you have new weakness, numbness, speech trouble, confusion, or vision loss?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'trigger', label: 'Is it triggered by movement, posture, light, or exertion?', options: ['No clear trigger', 'Movement or posture', 'Light or sound', 'Exertion'] }
    ]
  },
  {
    id: 'musculoskeletal',
    keywords: ['knee', 'joint', 'back', 'neck', 'shoulder', 'muscle', 'bone', 'pain', 'घुटने', 'முழங்கால்'],
    title: 'Musculoskeletal follow-up',
    questions: [
      { id: 'injury', label: 'Was there an injury, fall, or unusual physical activity before this started?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'movement', label: 'What affects it most?', options: ['Movement', 'Rest', 'Both movement and rest', 'No clear pattern'] },
      { id: 'swelling', label: 'Is there swelling, redness, warmth, numbness, or weakness in the area?', options: ['No', 'Yes', 'Some of these symptoms'] }
    ]
  }
];

export const GENERAL_QUESTIONS = [
  { id: 'onset', label: 'When did this problem begin, and is it getting better, worse, or staying the same?', options: ['Started today', 'Started this week', 'More than a week ago', 'Not sure'] },
  { id: 'impact', label: 'How much is this affecting your normal activities?', options: ['Minimal', 'Moderate', 'Severe'] },
  { id: 'redFlags', label: 'Do you have fainting, severe weakness, confusion, or rapidly worsening symptoms?', options: ['No', 'Yes', 'Not sure'] }
];

export const getQuestionGroupForComplaint = (complaint = '') => {
  const normalized = complaint.toLowerCase();
  return QUESTION_GROUPS.find((candidate) => candidate.keywords.some((keyword) => normalized.includes(keyword.trim().toLowerCase()))) || null;
};

export const buildClinicalQuestions = (complaint = '') => {
  const group = getQuestionGroupForComplaint(complaint);
  if (group) {
    return [...group.questions, GENERAL_QUESTIONS[1], GENERAL_QUESTIONS[2]];
  }
  return GENERAL_QUESTIONS;
};
