import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Sparkles, AlertCircle, CheckCircle, Eye, 
  ShieldCheck, Layers, HardDrive, FileCheck, X, ArrowRight, ArrowLeft, 
  Upload, Shield, FileSpreadsheet, Clock, User, Phone, Mail, DollarSign, Check 
} from 'lucide-react';
import { investigationService, CATEGORY_REQUIRED_FIELDS, SOP_WORKFLOWS_REF, MAPPED_SECTIONS_BY_CATEGORY } from '../data/investigationService';

export default function Complaints({ setSelectedComplaintId, setActiveTab }) {
  const [complaints, setComplaints] = useState([]);
  const [activeViewDetails, setActiveViewDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [registeredComplaint, setRegisteredComplaint] = useState(null);

  const [viewComplaintId, setViewComplaintId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // overview, sections, sop, evidence

  const [searchTerm, setSearchTerm] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    victimName: '',
    contact: '',
    email: '',
    incidentType: 'OTP Fraud / Phishing',
    incidentDate: new Date().toISOString().slice(0, 16),
    location: '',
    financialLoss: '',
    description: '',
    riskLevel: 'Medium',
    specificDetails: {},
    supportingDocs: []
  });

  // Supporting file input state
  const [newDocName, setNewDocName] = useState('');

  // Evidence Modal inside View Complaint State
  const [showInlineEvidenceForm, setShowInlineEvidenceForm] = useState(false);
  const [inlineEvData, setInlineEvData] = useState({
    deviceName: 'Victim Mobile Device / Screenshot',
    deviceType: 'Mobile Phone',
    serialNo: 'IMEI-8492019482',
    collectedBy: 'Insp. Vikram Rathore'
  });

  // FIR Modal inside View Complaint State
  const [showInlineFirForm, setShowInlineFirForm] = useState(false);
  const [inlineFirData, setInlineFirData] = useState({
    policeStation: 'Cyber Crime PS, Special Cell, Central',
    investigatingOfficer: 'Insp. Vikram Rathore'
  });

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const list = await investigationService.getComplaints();
        if (active) setComplaints(list || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadDetails() {
      if (!viewComplaintId) {
        setActiveViewDetails(null);
        return;
      }
      try {
        const details = await investigationService.getComplaintDetails(viewComplaintId);
        if (active) setActiveViewDetails(details);
      } catch (err) {
        console.error(err);
      }
    }
    loadDetails();
    return () => { active = false; };
  }, [viewComplaintId]);

  // Calculate SHA-256 Hash client side
  async function computeSHA256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Smart AI Case Processing
  const handleAiAnalyze = () => {
    if (!aiText.trim()) return;
    setAiAnalyzing(true);

    setTimeout(() => {
      const lower = aiText.toLowerCase();
      let detectedType = 'OTP Fraud / Phishing';
      let detectedLoss = 0;

      if (lower.includes('olx') || lower.includes('qr') || lower.includes('scan') || lower.includes('sofa') || lower.includes('advance')) {
        detectedType = 'OLX / QR Code Scam';
      } else if (lower.includes('sim') || lower.includes('swap') || lower.includes('network') || lower.includes('tower')) {
        detectedType = 'SIM Swapping';
      } else if (lower.includes('customer care') || lower.includes('anydesk') || lower.includes('quicksupport') || lower.includes('google search')) {
        detectedType = 'Customer Care Fraud';
      } else if (lower.includes('email') || lower.includes('bec') || lower.includes('domain') || lower.includes('spoof')) {
        detectedType = 'Email Spoofing / BEC Fraud';
      } else if (lower.includes('loan') || lower.includes('app') || lower.includes('threat')) {
        detectedType = 'Loan App Scam';
      } else if (lower.includes('shaadi') || lower.includes('matrimonial') || lower.includes('romance') || lower.includes('extortion')) {
        detectedType = 'Matrimonial / Romance Scam';
      }

      const matches = aiText.match(/(?:rs\.?|inr|₹|rs|rupees|rupaye)?\s*([\d,]+)\s*(?:rs|rupees|rupaye|k|thousand|lakh)?/gi);
      if (matches) {
        for (let match of matches) {
          const digits = match.replace(/[^\d]/g, '');
          if (digits && Number(digits) > 500) {
            let val = Number(digits);
            if (match.toLowerCase().includes('k') || match.toLowerCase().includes('thousand')) val *= 1000;
            if (match.toLowerCase().includes('lakh')) val *= 100000;
            detectedLoss = val;
            break;
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        incidentType: detectedType,
        financialLoss: detectedLoss ? String(detectedLoss) : prev.financialLoss,
        description: aiText
      }));

      setAiAnalyzing(false);
    }, 300);
  };

  const handleSpecificDetailChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      specificDetails: {
        ...prev.specificDetails,
        [key]: val
      }
    }));
  };

  const handleAddDoc = () => {
    if (!newDocName.trim()) return;
    setFormData(prev => ({
      ...prev,
      supportingDocs: [...prev.supportingDocs, newDocName.trim()]
    }));
    setNewDocName('');
  };

  const handleCreateComplaint = async (e) => {
    if (e) e.preventDefault();
    try {
      const created = await investigationService.addComplaint({
        ...formData,
        financialLoss: Number(formData.financialLoss) || 0,
        supportingDocs: formData.supportingDocs.length > 0 ? formData.supportingDocs : ['victim_statement.pdf', 'evidence_logs.png']
      });
      const list = await investigationService.getComplaints();
      setComplaints(list || []);
      setRegisteredComplaint(created);
      setSelectedComplaintId(created.id);
      setWizardStep(4); // Move to final FIR generation step
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineAddEvidence = async (e) => {
    e.preventDefault();
    if (!viewComplaintId) return;
    try {
      const calculatedHash = await computeSHA256(inlineEvData.deviceName + inlineEvData.serialNo + Date.now());
      await investigationService.addEvidence({
        complaintId: viewComplaintId,
        deviceName: inlineEvData.deviceName,
        deviceType: inlineEvData.deviceType,
        serialNo: inlineEvData.serialNo,
        collectedBy: inlineEvData.collectedBy,
        hashValue: calculatedHash
      });
      setShowInlineEvidenceForm(false);
      const list = await investigationService.getComplaints();
      setComplaints(list || []);
      const details = await investigationService.getComplaintDetails(viewComplaintId);
      setActiveViewDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineRegisterFir = async (e) => {
    e.preventDefault();
    if (!viewComplaintId) return;
    try {
      const details = await investigationService.getComplaintDetails(viewComplaintId);
      await investigationService.registerFir(viewComplaintId, {
        policeStation: inlineFirData.policeStation,
        investigatingOfficer: inlineFirData.investigatingOfficer,
        itActSections: details.sections
      });
      setShowInlineFirForm(false);
      const list = await investigationService.getComplaints();
      setComplaints(list || []);
      const updatedDetails = await investigationService.getComplaintDetails(viewComplaintId);
      setActiveViewDetails(updatedDetails);
    } catch (err) {
      console.error(err);
    }
  };

  const openRegisterModal = () => {
    setFormData({
      victimName: '',
      contact: '',
      email: '',
      incidentType: 'OTP Fraud / Phishing',
      incidentDate: new Date().toISOString().slice(0, 16),
      location: '',
      financialLoss: '',
      description: '',
      riskLevel: 'Medium',
      specificDetails: {},
      supportingDocs: []
    });
    setWizardStep(1);
    setRegisteredComplaint(null);
    setAiText('');
    setShowModal(true);
  };

  const filteredComplaints = complaints.filter(c => 
    c.victimName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.incidentType.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const currentCategoryFields = CATEGORY_REQUIRED_FIELDS[formData.incidentType] || CATEGORY_REQUIRED_FIELDS['OTP Fraud / Phishing'];
  const previewSections = MAPPED_SECTIONS_BY_CATEGORY[formData.incidentType] || [];
  const previewProcedures = SOP_WORKFLOWS_REF[formData.incidentType] || [];

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <FileText style={{ color: 'var(--primary)' }} />
            Cybercrime Complaint Management & Digitized SOP System
          </div>
          <button className="btn btn-primary" onClick={openRegisterModal}>
            <Plus size={18} /> Register New Complaint
          </button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Complaint ID, Victim Name, or Incident Category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="csoc-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Victim Details</th>
                <th>Incident Type</th>
                <th>Reported Loss (₹)</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(item => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {item.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.victimName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.contact}</div>
                  </td>
                  <td>
                    <span className="status-badge info">{item.incidentType}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: item.financialLoss > 100000 ? '#f87171' : 'var(--text-main)' }}>
                    ₹{(item.financialLoss || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.incidentDate.replace('T', ' ')}
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === 'FIR Registered' ? 'approved' : 'pending'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setViewComplaintId(item.id);
                          setActiveDetailTab('overview');
                        }}
                      >
                        <Eye size={14} /> View Case Info
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedComplaintId(item.id);
                          setActiveTab('assessment');
                        }}
                      >
                        Investigate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLAINT FULL INFO / VIEW MODAL */}
      {viewComplaintId && activeViewDetails && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px'
        }}>
          <div className="csoc-card" style={{ width: '850px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="csoc-card-header">
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digitized Cyber Investigation Dossier</div>
                <div className="csoc-card-title" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                  {activeViewDetails.complaint.id}: {activeViewDetails.complaint.victimName}
                </div>
              </div>
              <button onClick={() => { setViewComplaintId(null); setShowInlineEvidenceForm(false); setShowInlineFirForm(false); }} style={{ background: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
              <button 
                className={`btn ${activeDetailTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setActiveDetailTab('overview')}
              >
                <FileText size={14} /> Case Details
              </button>
              <button 
                className={`btn ${activeDetailTab === 'sections' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setActiveDetailTab('sections')}
              >
                <ShieldCheck size={14} /> Legal Sections ({activeViewDetails.sections.length})
              </button>
              <button 
                className={`btn ${activeDetailTab === 'sop' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setActiveDetailTab('sop')}
              >
                <Layers size={14} /> Investigation SOPs ({activeViewDetails.procedures.length})
              </button>
              <button 
                className={`btn ${activeDetailTab === 'fir' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setActiveDetailTab('fir')}
              >
                <FileSpreadsheet size={14} /> FIR Status {activeViewDetails.fir ? '✓' : ''}
              </button>
              <button 
                className={`btn ${activeDetailTab === 'evidence' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setActiveDetailTab('evidence')}
              >
                <HardDrive size={14} /> Evidences ({activeViewDetails.evidence.length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & SPECIFIC REQUIRED DETAILS */}
            {activeDetailTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid-2">
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Victim Contact & Location</div>
                    <div style={{ fontWeight: 700, marginTop: '2px', fontSize: '1rem' }}>{activeViewDetails.complaint.victimName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>{activeViewDetails.complaint.contact} | {activeViewDetails.complaint.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>Location: {activeViewDetails.complaint.location || 'Not Specified'}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classification & Financial Impact</div>
                    <div style={{ fontWeight: 700, marginTop: '2px', fontSize: '1rem' }}>{activeViewDetails.complaint.incidentType}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: 800, marginTop: '4px' }}>Financial Loss: ₹{(activeViewDetails.complaint.financialLoss || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>Registered Date: {activeViewDetails.complaint.createdDate}</div>
                  </div>
                </div>

                {/* Specific Analyzed Required Fields Box */}
                {activeViewDetails.complaint.specificDetails && Object.keys(activeViewDetails.complaint.specificDetails).length > 0 && (
                  <div style={{ padding: '14px', background: 'rgba(6,182,212,0.06)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Key Technical Evidence & Identifiers Analyzed:
                    </div>
                    <div className="grid-2" style={{ gap: '10px' }}>
                      {Object.entries(activeViewDetails.complaint.specificDetails).map(([key, val]) => (
                        val ? (
                          <div key={key} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', fontFamily: 'var(--font-mono)' }}>{val}</div>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Detailed Incident Statement:</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{activeViewDetails.complaint.description}</div>
                </div>

                {activeViewDetails.complaint.supportingDocs && activeViewDetails.complaint.supportingDocs.length > 0 && (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Attached Supporting Files:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {activeViewDetails.complaint.supportingDocs.map((doc, idx) => (
                        <span key={idx} style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileCheck size={14} style={{ color: 'var(--primary)' }} /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LEGAL SECTIONS */}
            {activeDetailTab === 'sections' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Applicable IT Act & IPC Sections for {activeViewDetails.complaint.incidentType}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeViewDetails.sections.map((sec, idx) => (
                    <div key={idx} style={{ padding: '14px', background: 'rgba(6,182,212,0.08)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <ShieldCheck size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: '1rem' }}>{sec}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Mandatory legal charge mapped to cybercrime incident category during pre-assessment.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SOP PROCEDURES */}
            {activeDetailTab === 'sop' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Standard Operating Procedures (SOP Steps) to Execute for {activeViewDetails.complaint.incidentType}:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeViewDetails.procedures.map((step, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0, marginTop: '2px' }}>
                        {idx + 1}
                      </span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FIR STATUS */}
            {activeDetailTab === 'fir' && (
              <div>
                {activeViewDetails.fir ? (
                  <div style={{ padding: '20px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered FIR Record</div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>{activeViewDetails.fir.firNo}</div>
                      </div>
                      <span className="status-badge approved">FIR Active</span>
                    </div>

                    <div className="grid-2" style={{ fontSize: '0.88rem', gap: '10px', marginBottom: '14px' }}>
                      <div><strong>Police Station:</strong> {activeViewDetails.fir.policeStation}</div>
                      <div><strong>Investigating Officer:</strong> {activeViewDetails.fir.investigatingOfficer}</div>
                      <div><strong>Registration Date:</strong> {activeViewDetails.fir.registrationDate}</div>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Applied Penal Sections:</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {activeViewDetails.fir.itActSections.map((sec, idx) => (
                        <span key={idx} className="status-badge info">{sec}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <AlertCircle size={36} style={{ color: 'var(--warning)', margin: '0 auto 12px auto' }} />
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>No Formal FIR Registered Yet</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 16px 0' }}>
                      This complaint is currently undergoing pre-investigation assessment. You can generate an FIR directly below.
                    </p>
                    {!showInlineFirForm ? (
                      <button className="btn btn-primary" onClick={() => setShowInlineFirForm(true)}>
                        <FileSpreadsheet size={16} /> Register FIR Now
                      </button>
                    ) : (
                      <form onSubmit={handleInlineRegisterFir} style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto 0 auto', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--secondary)' }}>Generate FIR for {activeViewDetails.complaint.id}</div>
                        <div className="form-group">
                          <label className="form-label">Police Station</label>
                          <input className="form-input" value={inlineFirData.policeStation} onChange={e => setInlineFirData({...inlineFirData, policeStation: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Investigating Officer (IO)</label>
                          <input className="form-input" value={inlineFirData.investigatingOfficer} onChange={e => setInlineFirData({...inlineFirData, investigatingOfficer: e.target.value.replace(/[^a-zA-Z\s]/g, '')})} placeholder="Name (letters only)" />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => setShowInlineFirForm(false)}>Cancel</button>
                          <button type="submit" className="btn btn-primary">Confirm & Issue FIR</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: EVIDENCE & STORE NEW EVIDENCE FEATURE */}
            {activeDetailTab === 'evidence' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Digital Evidences linked to this Case ({activeViewDetails.evidence.length})
                  </div>
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowInlineEvidenceForm(!showInlineEvidenceForm)}>
                    <Plus size={14} /> {showInlineEvidenceForm ? 'Close Add Form' : 'Add New Evidence / Upload Proof'}
                  </button>
                </div>

                {/* INLINE ADD NEW EVIDENCE FORM */}
                {showInlineEvidenceForm && (
                  <form onSubmit={handleInlineAddEvidence} style={{ padding: '16px', background: 'rgba(6,182,212,0.08)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HardDrive size={16} /> Attach / Store New Evidence for {activeViewDetails.complaint.id}
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Evidence / Device Description</label>
                        <input required className="form-input" value={inlineEvData.deviceName} onChange={e => setInlineEvData({...inlineEvData, deviceName: e.target.value})} placeholder="e.g. Victim Phone / Bank Statement Screenshot" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Evidence Type</label>
                        <select className="form-select" value={inlineEvData.deviceType} onChange={e => setInlineEvData({...inlineEvData, deviceType: e.target.value})}>
                          <option>Mobile Phone</option>
                          <option>Laptop / PC</option>
                          <option>Hard Disk / SSD</option>
                          <option>Pen Drive / Flash Storage</option>
                          <option>CCTV Footage</option>
                          <option>Email Header Logs</option>
                          <option>Screenshot / Image</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Serial No / IMEI / File Tag</label>
                        <input required className="form-input" value={inlineEvData.serialNo} onChange={e => setInlineEvData({...inlineEvData, serialNo: e.target.value})} placeholder="e.g. IMEI-948201 or IMG_002.png" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Seizing / Uploading Officer</label>
                        <input required className="form-input" value={inlineEvData.collectedBy} onChange={e => setInlineEvData({...inlineEvData, collectedBy: e.target.value.replace(/[^a-zA-Z\s]/g, '')})} placeholder="Name (letters only)" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowInlineEvidenceForm(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Store Evidence & Generate Hash</button>
                    </div>
                  </form>
                )}

                {/* EVIDENCE LIST */}
                {activeViewDetails.evidence.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeViewDetails.evidence.map(ev => (
                      <div key={ev.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)' }}>{ev.id}: {ev.deviceName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Serial/Tag: {ev.serialNo} | Seized by: {ev.collectedBy}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>SHA256: {ev.hashValue}</div>
                        </div>
                        <span className="status-badge info">{ev.deviceType}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                    No digital evidence items linked yet. Click "Add New Evidence" above to attach proof files.
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-primary" onClick={() => {
                setSelectedComplaintId(viewComplaintId);
                setViewComplaintId(null);
                setActiveTab('assessment');
              }}>
                Proceed to Full Investigation Assessment Workflow →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER COMPLAINT MULTI-STEP WIZARD MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div className="csoc-card" style={{ width: '800px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">
                <FileText style={{ color: 'var(--primary)' }} />
                Cybercrime Complaint Registration Wizard
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', padding: '0 10px', position: 'relative' }}>
              {[
                { step: 1, label: '1. Initial Details & AI' },
                { step: 2, label: '2. Crime Required Fields' },
                { step: 3, label: '3. Evidences & Proofs' },
                { step: 4, label: '4. FIR & Finish' }
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: wizardStep === s.step ? 1 : 0.5 }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: wizardStep === s.step ? 'var(--primary)' : wizardStep > s.step ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                    color: wizardStep === s.step || wizardStep > s.step ? 'black' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem'
                  }}>
                    {wizardStep > s.step ? '✓' : s.step}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* WIZARD STEP 1: INITIAL DETAILS & AI PARSER */}
            {wizardStep === 1 && (
              <div>
                {/* Smart AI Box */}
                <div style={{
                  background: 'rgba(6,182,212,0.06)',
                  border: '1px solid rgba(6,182,212,0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <Sparkles size={18} />
                    <span>Smart AI Auto-Extractor & SOP Classifier</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Paste the victim's narrative in natural language (English/Hindi). The AI auto-classifies the crime type, estimates loss, and prepares the legal investigation roadmap.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <textarea 
                      className="form-textarea" 
                      rows="2" 
                      value={aiText} 
                      onChange={e => setAiText(e.target.value)}
                      placeholder="e.g. Victim reported SBI bank OTP scam via phone call. Amount debited ₹45,000..."
                      style={{ fontSize: '0.85rem' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleAiAnalyze}
                      disabled={aiAnalyzing}
                      style={{ whiteSpace: 'nowrap', padding: '0 16px' }}
                    >
                      {aiAnalyzing ? 'Analyzing...' : 'Smart Auto-Fill'}
                    </button>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Victim Full Name *</label>
                    <input required className="form-input" value={formData.victimName} onChange={e => setFormData({...formData, victimName: e.target.value.replace(/[^a-zA-Z\s]/g, '')})} placeholder="e.g. Rahul Verma (letters only)" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number *</label>
                    <input required className="form-input" maxLength={10} value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})} placeholder="10-digit number" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address (e.g., user@example.com)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="victim@domain.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cybercrime Category *</label>
                    <select className="form-select" value={formData.incidentType} onChange={e => setFormData({...formData, incidentType: e.target.value})}>
                      <option>OTP Fraud / Phishing</option>
                      <option>OLX / QR Code Scam</option>
                      <option>SIM Swapping</option>
                      <option>Email Spoofing / BEC Fraud</option>
                      <option>Customer Care Fraud</option>
                      <option>Loan App Scam</option>
                      <option>Matrimonial / Romance Scam</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Date & Time of Incident</label>
                    <input type="datetime-local" className="form-input" value={formData.incidentDate} onChange={e => setFormData({...formData, incidentDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Financial Loss (INR)</label>
                    <input type="text" className="form-input" value={formData.financialLoss} onChange={e => setFormData({...formData, financialLoss: e.target.value.replace(/[^0-9]/g, '')})} placeholder="e.g. 50000 (numbers only)" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Description & Statement</label>
                  <textarea rows="3" className="form-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Provide detailed timeline of events..." />
                </div>

                {/* Live Preview of Mapped Sections & SOP */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>Auto-Mapped Legal Sections for selected category:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {previewSections.map((sec, idx) => (
                      <span key={idx} className="status-badge info" style={{ fontSize: '0.72rem' }}>{sec}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (!formData.victimName || !formData.contact) {
                      alert('Please fill in required Victim Name and Contact Number');
                      return;
                    }
                    if (formData.contact.length !== 10) {
                      alert('Contact Number must be exactly 10 digits.');
                      return;
                    }
                    if (formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
                      alert('Please enter a valid email address.');
                      return;
                    }
                    setWizardStep(2);
                  }}>
                    Next: Required Case Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* WIZARD STEP 2: DYNAMIC CRIME-SPECIFIC REQUIRED DETAILS */}
            {wizardStep === 2 && (
              <div>
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(6,182,212,0.08)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    Required Technical Details for: {formData.incidentType}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Based on investigation manuals, these specific parameters are required for bank/ISP notices and evidence gathering.
                  </div>
                </div>

                <div className="grid-2">
                  {currentCategoryFields.map((field) => (
                    <div className="form-group" key={field.key}>
                      <label className="form-label">{field.label} {field.required ? '*' : ''}</label>
                      <input 
                        className="form-input" 
                        placeholder={field.placeholder}
                        value={formData.specificDetails[field.key] || ''}
                        onChange={e => handleSpecificDetailChange(field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setWizardStep(1)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setWizardStep(3)}>
                    Next: Attach Proofs & Evidences <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* WIZARD STEP 3: EVIDENCE & PROOF UPLOAD */}
            {wizardStep === 3 && (
              <div>
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Upload Initial Proofs & Supporting Documents</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Attach digital proof files such as bank account statement, WhatsApp chat export, phishing screenshots, or malware APK files.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input 
                    className="form-input" 
                    placeholder="Enter file name or upload tag (e.g. bank_passbook.pdf, chat_proof.png)"
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddDoc} style={{ whiteSpace: 'nowrap' }}>
                    <Upload size={16} /> Attach Document
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Attached Files List:</div>
                  {formData.supportingDocs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {formData.supportingDocs.map((doc, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileCheck size={16} style={{ color: 'var(--primary)' }} /> {doc}
                          </span>
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, supportingDocs: prev.supportingDocs.filter((_, i) => i !== idx) }))} style={{ background: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Default evidence attachments will be initialized automatically.</div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setWizardStep(2)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleCreateComplaint}>
                    Register Complaint & Proceed to FIR <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* WIZARD STEP 4: REGISTRATION FINISHED & FIR GENERATION */}
            {wizardStep === 4 && registeredComplaint && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid var(--success)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <CheckCircle size={32} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>Cybercrime Complaint Registered Successfully!</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', margin: '6px 0 16px 0' }}>
                  Assigned ID: {registeredComplaint.id}
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'left', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--secondary)', marginBottom: '10px' }}>
                    Next Action Step: Issue Formal First Information Report (FIR)
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Under investigation SOPs, you can generate an official FIR right now with pre-populated police station jurisdiction and auto-mapped sections.
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                      setShowModal(false);
                      setActiveTab('fir');
                    }}>
                      <FileSpreadsheet size={18} /> Generate FIR Now
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                      setShowModal(false);
                      setActiveTab('assessment');
                    }}>
                      Go to Investigation Assessment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
