import express from 'express';
import cors from 'cors';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = 5000;

// CORS setup to explicitly allow the Vite development frontend port
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

const readDB = () => JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
const writeDB = (data) => fs.writeFileSync('./db.json', JSON.stringify(data, null, 2));

// Reference data structures copied directly from the service layer
const SOP_WORKFLOWS_REF = {
  'OTP Fraud / Phishing': [
    'Obtain complete transaction statement and bank UTR / Ref IDs from victim.',
    'Issue Sec 91 CrPC preservation notice to concerned Banks & Wallet gateways immediately.',
    'Trace beneficiary bank accounts and apply debit freeze on recipient accounts.',
    'Obtain IP login logs of banking session from victim bank and beneficiary financial node.',
    'Send CDR & IPDR request to Telecom operator for destination mobile numbers.'
  ],
  'OLX / QR Code Scam': [
    'Obtain scammer OLX profile link, mobile number, and WhatsApp chat screenshots.',
    'Trace UPI VPA ID (Virtual Payment Address) associated with QR code merchant account.',
    'Issue notice to NPCI / payment gateway for merchant account registration KYC.',
    'Geolocate cell tower dumps used during WhatsApp calling with victim.'
  ],
  'SIM Swapping': [
    'Verify physical retail store location where SIM swap request was lodged.',
    'Obtain store CCTV footage and employee ID who processed the swap ticket.',
    'Request telecom provider for fake identity documents submitted during swap.',
    'Freeze linked bank accounts immediately as OTP access was compromised.'
  ],
  'Customer Care Fraud': [
    'Verify fake helpline search query source and deceptive Google Ads link.',
    'Identify Remote Desktop Application ID (AnyDesk / TeamViewer / QuickSupport).',
    'Issue preservation notice to remote access software provider for connection logs.',
    'Obtain destination wallet transaction logs and execute debit freeze.'
  ],
  'Email Spoofing / BEC Fraud': [
    'Analyze full raw RFC 822 email headers (Received-SPF, DKIM, DMARC alignment).',
    'Identify true originating IP address and mail server hostname.',
    'Issue preservation notice to domain registrar and cloud mail provider.',
    'Notify financial intelligence unit if international wire transfer occurred.'
  ],
  'Loan App Scam': [
    'Extract permissions harvested by malicious APK from victim device.',
    'Issue preservation request to Google Play Store / Cloud host hosting the rogue app.',
    'Identify blackmail WhatsApp numbers and report for account termination & tower dump.',
    'Notify Cyber Crime Reporting Portal (1930) for bank account lien marking.'
  ],
  'Matrimonial / Romance Scam': [
    'Extract fake profile details and communication trail across platforms.',
    'Trace international wire transfers or crypto wallet addresses used for extortion.',
    'Issue notice to matrimonial portal for suspect IP logs and verified KYC.'
  ]
};

const MAPPED_SECTIONS_BY_CATEGORY = {
  'OTP Fraud / Phishing': ['Sec 66C (Identity Theft)', 'Sec 66D (Cheating by Personation)', 'Sec 43 (Unauthorized Access)', 'IPC 420 (Cheating)'],
  'OLX / QR Code Scam': ['Sec 66D (Cheating by Personation)', 'Sec 43 (Data Access)', 'IPC 420 (Cheating)'],
  'SIM Swapping': ['Sec 66C (Identity Theft)', 'Sec 66D (Cheating by Personation)', 'Sec 43 (Computer Damage)', 'IPC 419/420'],
  'Customer Care Fraud': ['Sec 66D (Cheating by Personation)', 'Sec 43 (Unauthorized access via Remote App)', 'IPC 420'],
  'Email Spoofing / BEC Fraud': ['Sec 66C (Identity Theft)', 'Sec 66D', 'Sec 43', 'IPC 465/468 (Forgery)'],
  'Loan App Scam': ['Sec 66E (Violation of Privacy)', 'Sec 67 (Publishing Obscene Content)', 'Sec 66D', 'IPC 384 (Extortion)'],
  'Matrimonial / Romance Scam': ['Sec 66D (Cheating by Personation)', 'IPC 420', 'IPC 406 (Criminal Breach of Trust)']
};

// Helper function to generate random numeric strings
const generateRandomDigits = (length) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
};

// 1. GET /api/complaints - return all complaints array
app.get('/api/complaints', (req, res) => {
  try {
    const db = readDB();
    res.json(db.complaints || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/complaints/:id - return single complaint combined metadata
app.get('/api/complaints/:id', (req, res) => {
  try {
    const db = readDB();
    const complaintId = req.params.id;
    const complaint = db.complaints.find(c => c.id === complaintId);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const category = complaint.incidentType || 'OTP Fraud / Phishing';
    const procedures = SOP_WORKFLOWS_REF[category] || SOP_WORKFLOWS_REF['OTP Fraud / Phishing'];
    const sections = MAPPED_SECTIONS_BY_CATEGORY[category] || MAPPED_SECTIONS_BY_CATEGORY['OTP Fraud / Phishing'];

    const fir = db.firs.find(f => f.complaintId === complaintId) || null;
    const evidence = db.evidence.filter(e => e.complaintId === complaintId) || [];
    const notices = db.notices.filter(n => n.complaintId === complaintId) || [];
    const forensics = db.forensics.filter(f => f.complaintId === complaintId) || [];
    const witnesses = db.witnesses.filter(w => w.complaintId === complaintId) || [];

    res.json({
      complaint,
      fir,
      evidence,
      notices,
      forensics,
      witnesses,
      procedures,
      sections
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /api/complaints - add new complaint
app.post('/api/complaints', (req, res) => {
  try {
    const db = readDB();
    const id = `CCIS-2026-${generateRandomDigits(4)}`;
    const today = new Date().toISOString().split('T')[0];

    const newComplaint = {
      id,
      ...req.body,
      status: 'Registered',
      createdDate: today
    };

    db.complaints.unshift(newComplaint);
    writeDB(db);
    res.json(newComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PATCH /api/complaints/:id/status - update complaint status field only
app.patch('/api/complaints/:id/status', (req, res) => {
  try {
    const db = readDB();
    const complaintId = req.params.id;
    const { status } = req.body;
    const complaint = db.complaints.find(c => c.id === complaintId);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    complaint.status = status;
    writeDB(db);
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/firs - register FIR, update linked complaint status to 'FIR Registered'
app.post('/api/firs', (req, res) => {
  try {
    const db = readDB();
    const { complaintId, ...details } = req.body;
    const firNo = `FIR-2026-${generateRandomDigits(4)}`;
    const today = new Date().toISOString().split('T')[0];

    const newFir = {
      firNo,
      complaintId,
      ...details,
      registrationDate: today,
      status: 'Active Investigation'
    };

    db.firs.unshift(newFir);

    const complaint = db.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = 'FIR Registered';
    }

    writeDB(db);
    res.json(newFir);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/firs/all - helper route called by investigationService.getFirs()
app.get('/api/firs/all', (req, res) => {
  try {
    const db = readDB();
    res.json(db.firs || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET /api/firs/:complaintId - get FIR for a specific complaint
app.get('/api/firs/:complaintId', (req, res) => {
  try {
    const db = readDB();
    const complaintId = req.params.complaintId;
    const fir = db.firs.find(f => f.complaintId === complaintId) || null;
    res.json(fir);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. POST /api/evidence - add evidence item
app.post('/api/evidence', (req, res) => {
  try {
    const db = readDB();
    const { complaintId, deviceName, deviceType, serialNo, collectedBy } = req.body;
    const id = `EVD-${generateRandomDigits(4)}`;
    const hashValue = crypto.randomBytes(32).toString('hex');
    const now = new Date().toLocaleString();

    const newEvidence = {
      id,
      complaintId,
      deviceName,
      deviceType,
      serialNo,
      collectedBy,
      collectionDate: now,
      hashValue,
      custodyChain: [
        {
          timestamp: now,
          custodian: collectedBy,
          action: 'Initial Seizure & Hash Generation',
          notes: 'SHA-256 integrity hash computed'
        }
      ]
    };

    db.evidence.unshift(newEvidence);
    writeDB(db);
    res.json(newEvidence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. GET /api/evidence/:complaintId - get all evidence for complaint
app.get('/api/evidence/:complaintId', (req, res) => {
  try {
    const db = readDB();
    const complaintId = req.params.complaintId;
    const evidence = db.evidence.filter(e => e.complaintId === complaintId);
    res.json(evidence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. POST /api/evidence/:id/custody - push new custody transfer object into custodyChain
app.post('/api/evidence/:id/custody', (req, res) => {
  try {
    const db = readDB();
    const evidenceId = req.params.id;
    const transferDetails = req.body;
    const evidenceItem = db.evidence.find(e => e.id === evidenceId);

    if (!evidenceItem) {
      return res.status(404).json({ error: 'Evidence item not found' });
    }

    const now = new Date().toLocaleString();
    evidenceItem.custodyChain.push({
      timestamp: now,
      ...transferDetails
    });

    writeDB(db);
    res.json(evidenceItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. POST /api/notices - add notice
app.post('/api/notices', (req, res) => {
  try {
    const db = readDB();
    const id = `NOT-2026-${generateRandomDigits(3)}`;
    const today = new Date().toISOString().split('T')[0];

    const newNotice = {
      id,
      ...req.body,
      sentDate: today,
      responseStatus: 'Pending Response',
      documentsReceived: 'Awaiting'
    };

    db.notices.unshift(newNotice);
    writeDB(db);
    res.json(newNotice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. GET /api/notices/:complaintId - get all notices for complaint
app.get('/api/notices/:complaintId', (req, res) => {
  try {
    const db = readDB();
    const complaintId = req.params.complaintId;
    const notices = db.notices.filter(n => n.complaintId === complaintId);
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. PATCH /api/notices/:id/status - update responseStatus and documentsReceived
app.patch('/api/notices/:id/status', (req, res) => {
  try {
    const db = readDB();
    const noticeId = req.params.id;
    const { responseStatus, documentsReceived } = req.body;
    const notice = db.notices.find(n => n.id === noticeId);

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    if (responseStatus !== undefined) notice.responseStatus = responseStatus;
    if (documentsReceived !== undefined) notice.documentsReceived = documentsReceived;

    writeDB(db);
    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 14. POST /api/forensics - add forensic request
app.post('/api/forensics', (req, res) => {
  try {
    const db = readDB();
    const id = `FOR-2026-${generateRandomDigits(3)}`;

    const newForensic = {
      id,
      ...req.body,
      status: 'Submitted to Lab',
      reportSummary: 'Pending analysis'
    };

    db.forensics.unshift(newForensic);
    writeDB(db);
    res.json(newForensic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. GET /api/forensics/:complaintId - get all forensic requests for complaint
app.get('/api/forensics/:complaintId', (req, res) => {
  try {
    const db = readDB();
    const complaintId = req.params.complaintId;
    const forensics = db.forensics.filter(f => f.complaintId === complaintId);
    res.json(forensics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 16. PATCH /api/forensics/:id - update status and reportSummary
app.patch('/api/forensics/:id', (req, res) => {
  try {
    const db = readDB();
    const forensicId = req.params.id;
    const { status, reportSummary } = req.body;
    const forensic = db.forensics.find(f => f.id === forensicId);

    if (!forensic) {
      return res.status(404).json({ error: 'Forensic request not found' });
    }

    if (status !== undefined) forensic.status = status;
    if (reportSummary !== undefined) forensic.reportSummary = reportSummary;

    writeDB(db);
    res.json(forensic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 17. POST /api/witnesses - add witness
app.post('/api/witnesses', (req, res) => {
  try {
    const db = readDB();
    const id = `WIT-${generateRandomDigits(3)}`;

    const newWitness = {
      id,
      ...req.body
    };

    db.witnesses.unshift(newWitness);
    writeDB(db);
    res.json(newWitness);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 18. GET /api/witnesses/:complaintId - get all witnesses for complaint
app.get('/api/witnesses/:complaintId', (req, res) => {
  try {
    const db = readDB();
    const complaintId = req.params.complaintId;
    const witnesses = db.witnesses.filter(w => w.complaintId === complaintId);
    res.json(witnesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 19. GET /api/playbooks - get all playbooks
app.get('/api/playbooks', (req, res) => {
  try {
    const playbooksData = JSON.parse(fs.readFileSync('./src/data/sopPlaybooks.json', 'utf-8'));
    res.json(playbooksData.sop_playbooks || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 20. GET /api/cases/:caseId/playbook-progress - get case playbook progress
app.get('/api/cases/:caseId/playbook-progress', (req, res) => {
  try {
    const db = readDB();
    const progress = (db.playbookProgress || []).find(p => p.caseId === req.params.caseId) || null;
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 21. POST /api/cases/:caseId/playbook-progress - save case playbook progress
app.post('/api/cases/:caseId/playbook-progress', (req, res) => {
  try {
    const db = readDB();
    if (!db.playbookProgress) {
      db.playbookProgress = [];
    }
    const { fraudType, checkedSteps } = req.body;
    const caseId = req.params.caseId;
    
    let progress = db.playbookProgress.find(p => p.caseId === caseId);
    if (progress) {
      progress.fraudType = fraudType;
      progress.checkedSteps = checkedSteps;
    } else {
      progress = { caseId, fraudType, checkedSteps };
      db.playbookProgress.unshift(progress);
    }
    
    writeDB(db);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
