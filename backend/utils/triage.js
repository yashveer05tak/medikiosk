// Clinical rules for Emergency Red-Flag Triage

const RED_FLAG_RULES = [
  {
    category: 'Cardiac / Respiratory',
    keywords: [
      /chest pain/i, /angina/i, /chest tightness/i, /heavy chest/i, /heaviness in chest/i,
      /radiating to left arm/i, /radiating to jaw/i, /pain in arm and jaw/i,
      /severe breathlessness/i, /unable to breathe/i, /severe dyspnea/i,
      /sudden syncope/i, /passed out/i, /loss of consciousness/i, /fainted/i
    ],
    reason: 'Suspicion of acute cardiac event (angina/infarction) or critical respiratory distress.'
  },
  {
    category: 'Neurological (FAST Stroke Criteria)',
    keywords: [
      /facial drooping/i, /face droop/i, /slurred speech/i, /difficulty speaking/i,
      /unilateral weakness/i, /weakness on one side/i, /left side numb/i, /right side numb/i,
      /arm drift/i, /sudden paralysis/i
    ],
    reason: 'Suspected acute stroke/neurological event matching FAST criteria.'
  },
  {
    category: 'Acute Abdomen / Severe Hemorrhage',
    keywords: [
      /severe bleeding/i, /coughing blood/i, /vomiting blood/i, /uncontrolled hemorrhage/i,
      /uncontrolled bleeding/i, /hemorrhage/i,
      /rigid stomach/i, /abdomen rigid/i, /stomach guarding/i, /abdominal guarding/i,
      /severe sudden abdominal pain/i
    ],
    reason: 'Suspected internal hemorrhage, active major bleeding, or acute surgical abdomen.'
  }
];

/**
 * Checks a patient's natural language narration and checklist inputs for emergency symptoms.
 * Normalizes common terms into formal terminology.
 * @param {string} text - User's voice narration or typed complaint
 * @param {Array<string>} symptoms - User selected checklist symptoms
 * @returns {Object} { isRedFlag, reason, normalizedTerms }
 */
export const checkTriage = (text = '', symptoms = []) => {
  const combinedText = `${text} ${symptoms.join(' ')}`.toLowerCase();
  
  // Normalization logic
  const normalizedTerms = [];
  if (combinedText.includes('chest heavy') || combinedText.includes('heavy chest') || combinedText.includes('heaviness in chest')) {
    normalizedTerms.push('presumed angina / substernal chest pressure');
  }
  if (combinedText.includes('passed out') || combinedText.includes('fainted')) {
    normalizedTerms.push('sudden syncope');
  }
  if (combinedText.includes('face look funny') || combinedText.includes('mouth twist')) {
    normalizedTerms.push('facial asymmetry / facial drooping');
  }
  if (combinedText.includes('breath hard') || combinedText.includes('short of breath')) {
    normalizedTerms.push('dyspnea');
  }
  if (combinedText.includes('stomach hard') || combinedText.includes('belly tight')) {
    normalizedTerms.push('abdominal rigidity / guarding');
  }

  // Evaluate clinical rules
  for (const rule of RED_FLAG_RULES) {
    for (const regex of rule.keywords) {
      if (regex.test(combinedText)) {
        return {
          isRedFlag: true,
          reason: rule.reason,
          normalizedTerms
        };
      }
    }
  }

  return {
    isRedFlag: false,
    reason: null,
    normalizedTerms
  };
};
