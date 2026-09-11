import PDFDocument from 'pdfkit';

/**
 * PDF Generator for Viora Clinical Case Sheets (SIH 2026)
 * Builds a medical-grade PDF document containing modern SOAP notes,
 * and Doctor Sign-off details.
 */
export const buildCaseSheetPDF = (caseData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Stream PDF to HTTP response stream or file
  if (res) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Viora_${caseData.caseId}.pdf"`);
    doc.pipe(res);
  }

  const { caseId, patientName, abhaId, age, gender, language, opdType, soapNote, isVerified, doctorNotes, verifiedBy, createdAt } = caseData;
  const sub = soapNote?.subjective || {};
  const obj = soapNote?.objective || {};
  const ass = soapNote?.assessment || {};
  const pla = soapNote?.plan || {};

  // Header Branding
  doc
    .fillColor('#0d253f')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Viora — SIH 2026 Clinical Case Sheet', { align: 'center' });

  doc
    .fillColor('#0d9488')
    .fontSize(10)
    .font('Helvetica')
    .text('Viora | Problem Statement ID: 26047 | ABDM Compliant EMR Record', { align: 'center' });

  doc.moveDown(1);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // Patient Meta Table Box
  doc
    .fillColor('#1e293b')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(`Case ID: ${caseId}    |    Date: ${new Date(createdAt).toLocaleDateString()}`);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Patient Name: ${patientName}    |    Age/Gender: ${age} / ${gender}`);
  doc.text(`ABHA ID: ${abhaId || 'Walk-in (No ABHA Provided)'}    |    OPD Type: ${opdType.toUpperCase()} (${language.toUpperCase()})`);

  doc.moveDown(1);

  // Status Banner
  if (isVerified) {
    doc
      .fillColor('#065f46')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`STATUS: ✅ DOCTOR VERIFIED & SIGNED OFF (${verifiedBy?.doctorName || 'Doctor'})`, { underline: true });
  } else {
    doc
      .fillColor('#991b1b')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`STATUS: ⏳ UNVERIFIED - PENDING DOCTOR SIGN-OFF (isVerified: false)`, { underline: true });
  }

  doc.moveDown(1);

  // 1. SUBJECTIVE (S)
  doc.fillColor('#0f766e').fontSize(14).font('Helvetica-Bold').text('1. SUBJECTIVE (S)');
  doc.fillColor('#334155').fontSize(10).font('Helvetica');
  doc.text(`• Chief Complaints: ${sub.primaryComplaints || 'None'}`);
  doc.text(`• Duration: ${sub.duration || 'Not specified'}`);
  doc.text(`• Severity Rating: ${sub.symptomSeverity || 0} / 10`);
  doc.text(`• Medical History: ${(sub.medicalHistory || []).join(', ')}`);
  doc.text(`• Allergies: ${(sub.allergies || []).join(', ')}`);

  doc.moveDown(1);

  // 2. OBJECTIVE (O)
  doc.fillColor('#0f766e').fontSize(14).font('Helvetica-Bold').text('2. OBJECTIVE (O) & CLINICAL FINDINGS');
  doc.fillColor('#334155').fontSize(10).font('Helvetica');
  doc.text(`• Physical Symptoms: ${(obj.physicalSymptoms || []).join(', ')}`);
  doc.text(`• Vitals: ${obj.vitals || 'Normal'}`);
  
  doc.text(`• Clinical Findings: ${(obj.clinicalFindings || []).join(', ') || 'No examination findings entered'}`);

  doc.moveDown(1);

  // 3. ASSESSMENT (A)
  doc.fillColor('#0f766e').fontSize(14).font('Helvetica-Bold').text('3. ASSESSMENT (A)');
  doc.fillColor('#334155').fontSize(10).font('Helvetica');
  doc.text(`• Preliminary Diagnosis: ${ass.preliminaryDiagnosis || 'Pending'}`);
  doc.text(`• Differential Diagnosis: ${(ass.differentialDiagnosis || []).join(', ')}`);
  doc.text(`• Risk Level: ${ass.riskLevel || 'Routine'}`);
  doc.text(`• Clinical Reasoning: ${ass.reasoning || 'Pending clinician review'}`);

  doc.moveDown(1);

  // 4. PLAN (P)
  doc.fillColor('#0f766e').fontSize(14).font('Helvetica-Bold').text('4. PLAN (P) & TREATMENT NOTES');
  doc.fillColor('#334155').fontSize(10).font('Helvetica');
  doc.text(`• Recommended Lab Tests: ${(pla.recommendedTests || []).join(', ')}`);
  doc.text(`• Diet & Lifestyle Advice (Pathya-Ahara): ${(pla.dietLifestyleAdvice || []).join(', ')}`);
  doc.text(`• Prescribed Medications: ${(pla.medications || []).join(', ')}`);

  if (doctorNotes) {
    doc.moveDown(0.5);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(`• Doctor Notes: ${doctorNotes}`);
  }

  doc.moveDown(2);

  // Footer Sign-Off
  if (isVerified) {
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
    doc.text(`Digitally Signed By: ${verifiedBy?.doctorName || 'Senior Medical Officer'}`);
    doc.text(`Registration No: ${verifiedBy?.registrationNumber || 'Not provided'}`);
    doc.text(`Timestamp: ${new Date(verifiedBy?.verifiedAt || Date.now()).toLocaleString()}`);
  }

  doc.end();
  return doc;
};
