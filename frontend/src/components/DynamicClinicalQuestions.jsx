import React, { useMemo } from 'react';
import { Activity, Brain, HeartPulse, Stethoscope, Wind } from 'lucide-react';

const QUESTION_GROUPS = [
  {
    id: 'cardiac',
    keywords: ['chest', 'heart', 'cardiac', 'pressure', 'palpitation', 'सीने', 'நெஞ்சு'],
    icon: HeartPulse,
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
    icon: Wind,
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
    icon: Activity,
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
    icon: Brain,
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
    icon: Stethoscope,
    title: 'Musculoskeletal follow-up',
    questions: [
      { id: 'injury', label: 'Was there an injury, fall, or unusual physical activity before this started?', options: ['No', 'Yes', 'Not sure'] },
      { id: 'movement', label: 'What affects it most?', options: ['Movement', 'Rest', 'Both movement and rest', 'No clear pattern'] },
      { id: 'swelling', label: 'Is there swelling, redness, warmth, numbness, or weakness in the area?', options: ['No', 'Yes', 'Some of these symptoms'] }
    ]
  }
];

const GENERAL_QUESTIONS = [
  { id: 'onset', label: 'When did this problem begin, and is it getting better, worse, or staying the same?', options: ['Started today', 'Started this week', 'More than a week ago', 'Not sure'] },
  { id: 'impact', label: 'How much is this affecting your normal activities?', options: ['Minimal', 'Moderate', 'Severe'] },
  { id: 'redFlags', label: 'Do you have fainting, severe weakness, confusion, or rapidly worsening symptoms?', options: ['No', 'Yes', 'Not sure'] }
];

export default function DynamicClinicalQuestions({ complaint, answers, onChange, questions: apiQuestions, isAiGenerated }) {
  const group = useMemo(() => {
    const normalized = complaint.toLowerCase();
    return QUESTION_GROUPS.find((candidate) => candidate.keywords.some((keyword) => normalized.includes(keyword))) || null;
  }, [complaint]);

  const questions = apiQuestions?.length ? apiQuestions : (group ? [...group.questions, GENERAL_QUESTIONS[1], GENERAL_QUESTIONS[2]] : GENERAL_QUESTIONS);
  const Icon = group?.icon || Stethoscope;

  const updateAnswer = (id, value) => {
    onChange({ ...answers, [id]: value });
  };

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="bg-teal-100 text-teal-700 p-2.5 rounded-xl"><Icon className="w-5 h-5" /></div>
        <div>
          <p className="text-sm font-bold text-slate-800">{group?.title || 'General clinical follow-up'}</p>
          <p className="text-xs text-slate-500">{isAiGenerated ? 'Questions were generated from your symptom description for clinician intake.' : 'Questions update as your symptom description changes.'}</p>
        </div>
      </div>

      {questions.map((question, index) => (
        <div key={`${group?.id || 'general'}-${question.id}-${index}`} className="border border-slate-200 rounded-2xl p-4">
          <label className="block text-sm font-bold text-slate-800 mb-3">{index + 1}. {question.label}</label>
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateAnswer(question.id, option)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  answers[question.id] === option
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/10'
                    : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-slate-500">This interview supports clinical documentation and triage. It does not replace evaluation by a qualified clinician.</p>
    </section>
  );
}
