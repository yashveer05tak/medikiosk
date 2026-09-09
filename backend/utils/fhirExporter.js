/**
 * Generates an ABDM-compliant FHIR Bundle payload representing the clinical intake.
 * This bundle contains Patient, Encounter, Condition, and Observation resources.
 * 
 * @param {Object} session - The patient intake session object
 * @returns {Object} FHIR Bundle JSON
 */
export const exportToFHIR = (session) => {
  const { sessionId, abhaId, language, opdType, isRedFlag, clinicalData, createdAt } = session;
  const timestamp = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();

  // 1. FHIR Patient Resource
  const patientResource = {
    resourceType: 'Patient',
    id: `patient-${abhaId || 'anonymous'}`,
    identifier: abhaId ? [
      {
        system: 'https://healthid.ndhm.gov.in',
        value: abhaId
      }
    ] : [],
    name: [
      {
        text: abhaId ? `Patient ABHA ${abhaId}` : 'Walk-in Kiosk Patient'
      }
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: 'urn:ietf:bcp:47',
              code: language || 'en',
              display: getLanguageName(language)
            }
          ]
        }
      }
    ]
  };

  // 2. FHIR Encounter Resource (OPD intake)
  const encounterResource = {
    resourceType: 'Encounter',
    id: `encounter-${sessionId}`,
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory'
    },
    subject: {
      reference: `Patient/${patientResource.id}`
    },
    serviceType: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: opdType === 'ayush' ? '394812003' : '408443003',
          display: opdType === 'ayush' ? 'AYUSH Medicine' : 'General Medical Practice'
        }
      ]
    },
    period: {
      start: timestamp,
      end: timestamp
    }
  };

  // 3. FHIR Condition Resource (Chief Complaint)
  const conditionResource = {
    resourceType: 'Condition',
    id: `condition-${sessionId}`,
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active'
        }
      ]
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'encounter-diagnosis',
            display: 'Encounter Diagnosis'
          }
        ]
      }
    ],
    code: {
      text: clinicalData?.chiefComplaint || 'No Chief Complaint Stated'
    },
    subject: {
      reference: `Patient/${patientResource.id}`
    },
    encounter: {
      reference: `Encounter/${encounterResource.id}`
    }
  };

  // 4. FHIR Observations (SOCRATES parameters & AYUSH parameters)
  const observations = [];

  // Severity Observation
  if (clinicalData?.hpi?.severity) {
    observations.push({
      resourceType: 'Observation',
      id: `obs-severity-${sessionId}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'exam',
              display: 'Exam'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '273902009',
            display: 'Pain severity'
          }
        ]
      },
      subject: {
        reference: `Patient/${patientResource.id}`
      },
      valueQuantity: {
        value: clinicalData.hpi.severity,
        system: 'http://unitsofmeasure.org',
        code: '1'
      }
    });
  }

  // Triage Red Flag Observation
  observations.push({
    resourceType: 'Observation',
    id: `obs-triage-${sessionId}`,
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '75323002',
          display: 'Triage assessment status'
        }
      ]
    },
    subject: {
      reference: `Patient/${patientResource.id}`
    },
    valueCodeableConcept: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: isRedFlag ? '399122003' : '399120006',
          display: isRedFlag ? 'Emergency department triage status - Red' : 'Emergency department triage status - Green'
        }
      ],
      text: isRedFlag ? 'RED FLAG EMERGENCY' : 'ROUTINE INTAKE'
    }
  });

  // AYUSH Observations
  if (opdType === 'ayush' && clinicalData?.ayushParameters) {
    const { agni, koshtha } = clinicalData.ayushParameters;
    if (agni) {
      observations.push({
        resourceType: 'Observation',
        id: `obs-ayush-agni-${sessionId}`,
        status: 'final',
        code: {
          text: 'Ayurveda Agni (Digestive Capacity)'
        },
        subject: {
          reference: `Patient/${patientResource.id}`
        },
        valueString: agni
      });
    }
    if (koshtha) {
      observations.push({
        resourceType: 'Observation',
        id: `obs-ayush-koshtha-${sessionId}`,
        status: 'final',
        code: {
          text: 'Ayurveda Koshtha (Bowel Pattern)'
        },
        subject: {
          reference: `Patient/${patientResource.id}`
        },
        valueString: koshtha
      });
    }
  }

  // Scanned Lab Reports Observations
  if (clinicalData?.extractedDocuments) {
    clinicalData.extractedDocuments.forEach((doc, idx) => {
      observations.push({
        resourceType: 'Observation',
        id: `obs-doc-${idx}-${sessionId}`,
        status: 'final',
        code: {
          text: `Scanned Document Findings: ${doc.docType}`
        },
        subject: {
          reference: `Patient/${patientResource.id}`
        },
        effectiveDateTime: doc.date || timestamp,
        valueString: `Findings: ${doc.abnormalFindings.join(', ')}. Medications: ${doc.medications.join(', ')}`
      });
    });
  }

  // Compile entries into a Bundle
  const entries = [
    { resource: patientResource },
    { resource: encounterResource },
    { resource: conditionResource },
    ...observations.map(obs => ({ resource: obs }))
  ];

  return {
    resourceType: 'Bundle',
    id: `bundle-${sessionId}`,
    type: 'collection',
    timestamp: timestamp,
    entry: entries
  };
};

function getLanguageName(code) {
  const languages = {
    en: 'English',
    hi: 'Hindi (हिन्दी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    bn: 'Bengali (বাংলা)'
  };
  return languages[code] || code;
}
