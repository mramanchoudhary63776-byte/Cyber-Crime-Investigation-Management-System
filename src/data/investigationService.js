// Central State & Service Layer for Cyber Crime Investigation Management System

const INITIAL_COMPLAINTS = [
  {
    id: 'CCIS-2026-1001',
    victimName: 'Rohan Sharma',
    contact: '+91 98765 43210',
    email: 'rohan.sharma@example.com',
    incidentType: 'OTP Fraud / Phishing',
    incidentDate: '2026-06-25T14:30',
    location: 'New Delhi, DL',
    financialLoss: 145000,
    status: 'FIR Registered',
    description: 'Received fake APK link mimicking SBI customer update. OTP intercepted and money transferred to unknown Paytm wallet.',
    specificDetails: {
      transactionId: 'UTR984201948102',
      beneficiaryAccount: 'paytm.wallet@9876543210',
      victimBank: 'State Bank of India, CP Branch',
      phishingLink: 'http://sbi-reward-update.apk'
    },
    supportingDocs: ['bank_statement.pdf', 'sms_screenshots.png'],
    riskLevel: 'High',
    createdDate: '2026-06-26'
  },
  {
    id: 'CCIS-2026-1002',
    victimName: 'Priya Verma',
    contact: '+91 91234 56789',
    email: 'priya.v@example.com',
    incidentType: 'OLX / QR Code Scam',
    incidentDate: '2026-06-27T10:15',
    location: 'Cyber City, Gurugram',
    financialLoss: 42000,
    status: 'Pre-Assessment',
    description: 'Scammer sent QR code claiming to send advance deposit for furniture listed on OLX. Scanning QR debited funds.',
    specificDetails: {
      olxProfileId: 'OLX-USER-9482',
      scammerVpa: 'qr.deposit.merchant@upi',
      scammerPhone: '+91 98765 11223',
      listedItem: 'Wooden Dining Table Set'
    },
    supportingDocs: ['olx_chat_export.pdf'],
    riskLevel: 'Medium',
    createdDate: '2026-06-27'
  },
  {
    id: 'CCIS-2026-1003',
    victimName: 'Amitabh Sen',
    contact: '+91 99887 76655',
    email: 'asen.corporate@example.com',
    incidentType: 'SIM Swapping',
    incidentDate: '2026-06-28T02:00',
    location: 'South Mumbai, MH',
    financialLoss: 890000,
    status: 'Under Investigation',
    description: 'Mobile connection suddenly went offline midnight. Fraudsters executed SIM swap at retail store and drained corporate account.',
    specificDetails: {
      compromisedNumber: '+91 99887 76655',
      telecomOperator: 'Bharti Airtel Ltd',
      retailOutletLocation: 'Store #12, Bandra West, Mumbai',
      swapTime: '28-June-2026 01:45 AM'
    },
    supportingDocs: ['telecom_complaint_ack.pdf'],
    riskLevel: 'Critical',
    createdDate: '2026-06-28'
  }
];

const INITIAL_FIRS = [
  {
    firNo: 'FIR-2026-0421',
    complaintId: 'CCIS-2026-1001',
    policeStation: 'Cyber Crime PS, Special Cell, Central',
    investigatingOfficer: 'Insp. Vikram Rathore',
    itActSections: ['Sec 66C (Identity Theft)', 'Sec 66D (Cheating by Personation)', 'Sec 43 (Data Theft)'],
    registrationDate: '2026-06-26',
    status: 'Active Investigation'
  }
];

const INITIAL_EVIDENCE = [
  {
    id: 'EVD-9901',
    complaintId: 'CCIS-2026-1001',
    deviceName: 'OnePlus 11 5G (Victim Device)',
    deviceType: 'Mobile Phone',
    serialNo: 'IMEI-864201948201',
    collectionDate: '2026-06-26 16:00',
    collectedBy: 'Sub-Insp. Ananya Roy',
    hashValue: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    custodyChain: [
      { timestamp: '2026-06-26 16:00', custodian: 'Sub-Insp. Ananya Roy', action: 'Seized at Scene', notes: 'Seized in anti-static ESD bag' },
      { timestamp: '2026-06-26 18:30', custodian: 'Evidence Locker Sgt. Mohan', action: 'Stored in Vault A-4', notes: 'Physical lock verified' },
      { timestamp: '2026-06-27 10:00', custodian: 'Dr. S. K. Gupta (Forensic Lab)', action: 'Transferred for Extraction', notes: 'Cellebrite UFED extraction' }
    ]
  }
];

const INITIAL_NOTICES = [
  {
    id: 'NOT-2026-088',
    complaintId: 'CCIS-2026-1001',
    targetAgency: 'Paytm Payments Bank Ltd',
    agencyType: 'Payment Gateway',
    noticeType: 'Sec 91 CrPC Preservation & Freeze',
    sentDate: '2026-06-26',
    responseStatus: 'Received & Account Frozen',
    documentsReceived: 'Beneficiary Wallet Ledger & IP logs'
  },
  {
    id: 'NOT-2026-089',
    complaintId: 'CCIS-2026-1001',
    targetAgency: 'Bharti Airtel Ltd',
    agencyType: 'Telecom Operator',
    noticeType: 'CDR & Cell Tower Dump Request',
    sentDate: '2026-06-26',
    responseStatus: 'Pending Response',
    documentsReceived: 'Awaiting CDR report'
  }
];

const INITIAL_FORENSICS = [
  {
    id: 'FOR-2026-012',
    complaintId: 'CCIS-2026-1001',
    evidenceId: 'EVD-9901',
    assignedExpert: 'Dr. S. K. Gupta',
    requestType: 'Cellebrite UFED Extraction & Malicious APK Analysis',
    status: 'In Progress',
    reportSummary: 'Preliminary scan detected malicious SMS Trojan "SBI_Reward_Update.apk". Extraction of SMS inbox completed.',
    completionDate: '2026-06-29 (Expected)'
  }
];

const INITIAL_WITNESSES = [
  {
    id: 'WIT-101',
    complaintId: 'CCIS-2026-1001',
    name: 'Manish Malhotra',
    relation: 'Bank Nodal Officer',
    contact: '+91 98220 11223',
    statementSummary: 'Confirmed fraudulent transaction origin from IP address 49.207.210.45 at 14:32:10 hrs.'
  }
];

export const IT_ACT_SECTIONS_REF = [
  { section: 'Sec 43', title: 'Penalty and compensation for damage to computer system', summary: 'Unauthorized access, downloading data, introducing viruses.' },
  { section: 'Sec 66', title: 'Computer Related Offences', summary: 'Dishonest or fraudulent act under Section 43.' },
  { section: 'Sec 66B', title: 'Receiving Stolen Computer Resource', summary: 'Dishonestly receiving stolen computer or communication device.' },
  { section: 'Sec 66C', title: 'Identity Theft', summary: 'Fraudulent use of electronic signature, password, or unique identification.' },
  { section: 'Sec 66D', title: 'Cheating by Personation', summary: 'Cheating using computer resource or communication device.' },
  { section: 'Sec 66E', title: 'Violation of Privacy', summary: 'Capturing, publishing private body images without consent.' },
  { section: 'Sec 67', title: 'Publishing Obscene Content', summary: 'Transmitting obscene material in electronic form.' },
  { section: 'Sec 79A', title: 'Central Govt Notification on Examiner of Electronic Evidence', summary: 'Preservation of digital evidence.' }
];

export const SOP_WORKFLOWS_REF = {
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

export const MAPPED_SECTIONS_BY_CATEGORY = {
  'OTP Fraud / Phishing': ['Sec 66C (Identity Theft)', 'Sec 66D (Cheating by Personation)', 'Sec 43 (Unauthorized Access)', 'IPC 420 (Cheating)'],
  'OLX / QR Code Scam': ['Sec 66D (Cheating by Personation)', 'Sec 43 (Data Access)', 'IPC 420 (Cheating)'],
  'SIM Swapping': ['Sec 66C (Identity Theft)', 'Sec 66D (Cheating by Personation)', 'Sec 43 (Computer Damage)', 'IPC 419/420'],
  'Customer Care Fraud': ['Sec 66D (Cheating by Personation)', 'Sec 43 (Unauthorized access via Remote App)', 'IPC 420'],
  'Email Spoofing / BEC Fraud': ['Sec 66C (Identity Theft)', 'Sec 66D', 'Sec 43', 'IPC 465/468 (Forgery)'],
  'Loan App Scam': ['Sec 66E (Violation of Privacy)', 'Sec 67 (Publishing Obscene Content)', 'Sec 66D', 'IPC 384 (Extortion)'],
  'Matrimonial / Romance Scam': ['Sec 66D (Cheating by Personation)', 'IPC 420', 'IPC 406 (Criminal Breach of Trust)']
};

export const CATEGORY_REQUIRED_FIELDS = {
  'OTP Fraud / Phishing': [
    { key: 'transactionId', label: 'Bank Transaction ID / UTR No.', placeholder: 'e.g. UTR194820593021', required: true },
    { key: 'beneficiaryAccount', label: 'Target Beneficiary Account / Wallet ID', placeholder: 'e.g. 9876543210@paytm or AC-948201', required: true },
    { key: 'victimBank', label: 'Victim Bank Name & Branch', placeholder: 'e.g. SBI Connaught Place', required: true },
    { key: 'phishingLink', label: 'Phishing SMS / APK Link Received', placeholder: 'e.g. http://sbi-reward-update.apk', required: false }
  ],
  'OLX / QR Code Scam': [
    { key: 'olxProfileId', label: 'Scammer OLX Profile / Listing ID', placeholder: 'e.g. OLX-USER-84920', required: true },
    { key: 'scammerVpa', label: 'Fake QR Merchant VPA / UPI ID', placeholder: 'e.g. merchant.pay@upi', required: true },
    { key: 'scammerPhone', label: 'Scammer WhatsApp / Contact No.', placeholder: '+91 98765 12345', required: true },
    { key: 'listedItem', label: 'Item Name Listed on OLX', placeholder: 'e.g. Wooden Dining Table Set', required: false }
  ],
  'SIM Swapping': [
    { key: 'compromisedNumber', label: 'Compromised Mobile Number', placeholder: '+91 99887 76655', required: true },
    { key: 'telecomOperator', label: 'Telecom Service Provider', placeholder: 'e.g. Airtel / Jio / Vi', required: true },
    { key: 'retailOutletLocation', label: 'Fraudulent Swap Store Location / City', placeholder: 'e.g. Store #4, MG Road, Mumbai', required: true },
    { key: 'swapTime', label: 'Approx Date & Time Network Went Offline', placeholder: 'e.g. 28-June-2026 02:00 AM', required: false }
  ],
  'Customer Care Fraud': [
    { key: 'helplineSearched', label: 'Fake Helpline Number Called', placeholder: 'e.g. 1800-FAKE-HELP', required: true },
    { key: 'remoteAppId', label: 'Remote Desktop App ID (AnyDesk / TeamViewer)', placeholder: 'e.g. AnyDesk ID 948 201 349', required: true },
    { key: 'searchPlatform', label: 'Search Engine / Platform Used', placeholder: 'e.g. Google Search / Sponsored Ad', required: false }
  ],
  'Email Spoofing / BEC Fraud': [
    { key: 'spoofedSender', label: 'Spoofed Sender Email Address', placeholder: 'e.g. ceo@corp-update-fake.com', required: true },
    { key: 'targetMailServer', label: 'Victim Mail Server / Domain', placeholder: 'e.g. company.com (IP: 192.168.1.1)', required: true },
    { key: 'wireTransferSwift', label: 'Fraudulent Wire Transfer SWIFT / Account', placeholder: 'e.g. CHASEUS33XXX / AC-849201', required: true }
  ],
  'Loan App Scam': [
    { key: 'loanAppName', label: 'Malicious Loan App Name', placeholder: 'e.g. Instant Cash Pro / EasyLoan', required: true },
    { key: 'apkDownloadLink', label: 'APK Download Link / PlayStore URL', placeholder: 'e.g. https://cash-loan.apk', required: false },
    { key: 'extortionPhone', label: 'Extortion Call / WhatsApp Number', placeholder: '+91 91234 99999', required: true }
  ],
  'Matrimonial / Romance Scam': [
    { key: 'suspectProfile', label: 'Suspect Matrimonial Profile ID / Link', placeholder: 'e.g. Shaadi.com Profile ID #84920', required: true },
    { key: 'extortionAccount', label: 'Money Transfer Account / Crypto Wallet', placeholder: 'e.g. Bank AC or USDT Wallet Address', required: true }
  ]
};

class InvestigationService {
  constructor() {
    this.base = '/api';
  }

  async getComplaints() {
    const res = await fetch(`${this.base}/complaints`);
    return res.json();
  }

  async getComplaintDetails(id) {
    const res = await fetch(`${this.base}/complaints/${id}`);
    return res.json();
  }

  async addComplaint(data) {
    const res = await fetch(`${this.base}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  async getFirs() {
    const res = await fetch(`${this.base}/firs/all`);
    return res.json();
  }

  async registerFir(complaintId, details) {
    const res = await fetch(`${this.base}/firs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintId, ...details })
    });
    return res.json();
  }

  async getEvidence(complaintId) {
    const res = await fetch(`${this.base}/evidence/${complaintId}`);
    return res.json();
  }

  async addEvidence(data) {
    const res = await fetch(`${this.base}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  async addCustodyTransfer(evidenceId, transferDetails) {
    const res = await fetch(`${this.base}/evidence/${evidenceId}/custody`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transferDetails)
    });
    return res.json();
  }

  async getNotices(complaintId) {
    const res = await fetch(`${this.base}/notices/${complaintId}`);
    return res.json();
  }

  async addNotice(data) {
    const res = await fetch(`${this.base}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  async getForensics(complaintId) {
    const res = await fetch(`${this.base}/forensics/${complaintId}`);
    return res.json();
  }

  async addForensicRequest(data) {
    const res = await fetch(`${this.base}/forensics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  async getWitnesses(complaintId) {
    const res = await fetch(`${this.base}/witnesses/${complaintId}`);
    return res.json();
  }

  async addWitness(data) {
    const res = await fetch(`${this.base}/witnesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
}

export const investigationService = new InvestigationService();
