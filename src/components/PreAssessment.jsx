import React, { useState, useEffect } from 'react';
import { CheckSquare, AlertTriangle, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { investigationService, IT_ACT_SECTIONS_REF } from '../data/investigationService';

export default function PreAssessment({ selectedComplaintId, setSelectedComplaintId, setActiveTab }) {
  const [complaints, setComplaints] = useState([]);
  const activeComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

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

  const [selectedSections, setSelectedSections] = useState(['Sec 66C', 'Sec 66D']);
  const [isCognizable, setIsCognizable] = useState(true);
  const [assessmentNotes, setAssessmentNotes] = useState('Cognizable offence established based on financial fraud and impersonation techniques.');

  const isClosed = activeComplaint?.caseStatus && activeComplaint?.caseStatus !== 'active';

  const toggleSection = (sec) => {
    if (isClosed) return;
    if (selectedSections.includes(sec)) {
      setSelectedSections(selectedSections.filter(s => s !== sec));
    } else {
      setSelectedSections([...selectedSections, sec]);
    }
  };

  const handleProceedToFir = () => {
    if (isClosed) return;
    // Navigate to FIR module with active complaint
    setSelectedComplaintId(activeComplaint.id);
    setActiveTab('fir');
  };

  return (
    <div className="pre-assessment-view">
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <CheckSquare style={{ color: 'var(--primary)' }} />
            Module 3: Pre-Investigation Assessment & Legal Framing
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target Complaint:</span>
            <select 
              className="form-select" 
              value={activeComplaint?.id} 
              onChange={e => setSelectedComplaintId(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {complaints.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.victimName} ({c.incidentType})</option>
              ))}
            </select>
          </div>
        </div>

        {activeComplaint && (
          <div>
            {isClosed && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid var(--danger)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#f87171',
                fontSize: '0.88rem',
                fontWeight: 700
              }}>
                ⚠️ Case File Locked: This case has been archived/closed. Editing legal framing or approving FIRs is disabled.
              </div>
            )}

            {/* Complaint Overview Banner */}
            <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <div className="grid-3">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Victim & Contact</div>
                  <div style={{ fontWeight: 700 }}>{activeComplaint.victimName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{activeComplaint.contact}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crime Classification</div>
                  <div style={{ fontWeight: 700 }}>{activeComplaint.incidentType}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>Loss: ₹{activeComplaint.financialLoss.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Assessment State</div>
                  <span className="status-badge info">{activeComplaint.status}</span>
                </div>
              </div>
            </div>

            <div className="grid-2">
              {/* IT Act Sections Reference & Selector */}
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                  Select Applicable Information Technology (IT) Act Sections
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '6px' }}>
                  {IT_ACT_SECTIONS_REF.map(item => {
                    const isChecked = selectedSections.includes(item.section);
                    return (
                      <div 
                        key={item.section}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isChecked ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                          cursor: isClosed ? 'default' : 'pointer',
                          opacity: isClosed ? 0.7 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => toggleSection(item.section)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{item.section}</span>
                          <input type="checkbox" checked={isChecked} disabled={isClosed} onChange={() => {}} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.summary}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legal Framing & Decision Matrix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                  Cognizable Offence Determination & SOP Outcome
                </div>

                <div className="form-group">
                  <label className="form-label">Offence Classification</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isClosed ? 'default' : 'pointer' }}>
                      <input type="radio" name="cognizable" checked={isCognizable} disabled={isClosed} onChange={() => setIsCognizable(true)} />
                      <span style={{ fontWeight: 600, opacity: isClosed ? 0.7 : 1 }}>Cognizable Offence (Register FIR)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isClosed ? 'default' : 'pointer' }}>
                      <input type="radio" name="cognizable" checked={!isCognizable} disabled={isClosed} onChange={() => setIsCognizable(false)} />
                      <span style={{ fontWeight: 600, opacity: isClosed ? 0.7 : 1 }}>Non-Cognizable / Civil Adjudication</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Investigating Officer Assessment & Decision Notes</label>
                  <textarea 
                    className="form-textarea" 
                    rows="4" 
                    value={assessmentNotes} 
                    disabled={isClosed}
                    onChange={e => setAssessmentNotes(e.target.value)} 
                  />
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" disabled={isClosed}>Refer to Adjudicating Officer</button>
                  <button className="btn btn-primary" onClick={handleProceedToFir} disabled={isClosed}>
                    <FileSpreadsheet size={18} /> Approve & Register FIR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
