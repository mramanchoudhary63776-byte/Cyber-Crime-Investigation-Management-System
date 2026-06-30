import React from 'react';
import { GitBranch, CheckCircle2, Circle, ArrowDown, ShieldCheck, HardDrive, FileCheck, Award, Microscope, FileText } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function CaseTimeline({ selectedComplaintId, setSelectedComplaintId, setActiveTab }) {
  const complaints = investigationService.getComplaints();
  const activeComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];
  
  const firs = investigationService.getFirs().filter(f => f.complaintId === activeComplaint?.id);
  const evidence = investigationService.getEvidence(activeComplaint?.id);
  const notices = investigationService.getNotices(activeComplaint?.id);
  const forensics = investigationService.getForensics(activeComplaint?.id);

  const timelineSteps = [
    {
      stage: 'Complaint Registration',
      status: 'Completed',
      icon: FileText,
      color: 'var(--primary)',
      desc: `Registered on ${activeComplaint?.createdDate}. Victim: ${activeComplaint?.victimName}. Financial Loss: ₹${(activeComplaint?.financialLoss || 0).toLocaleString()}`,
      tabTarget: 'complaints'
    },
    {
      stage: 'Pre-Investigation Assessment',
      status: 'Completed',
      icon: CheckCircle2,
      color: 'var(--primary)',
      desc: `Legal framing completed. IT Act offences identified for ${activeComplaint?.incidentType}. Cognizable determination verified.`,
      tabTarget: 'assessment'
    },
    {
      stage: 'FIR Registration',
      status: firs.length > 0 ? 'Completed' : 'Pending',
      icon: ShieldCheck,
      color: firs.length > 0 ? 'var(--secondary)' : 'var(--text-dim)',
      desc: firs.length > 0 ? `FIR ${firs[0].firNo} registered at ${firs[0].policeStation} under IO ${firs[0].investigatingOfficer}` : 'Awaiting formal FIR approval from Supervisor/SHO.',
      tabTarget: 'fir'
    },
    {
      stage: 'Digital Evidence Seizure & Hashing',
      status: evidence.length > 0 ? 'Completed' : 'In Progress',
      icon: HardDrive,
      color: evidence.length > 0 ? 'var(--accent)' : 'var(--text-dim)',
      desc: evidence.length > 0 ? `${evidence.length} item(s) seized with cryptographic SHA-256 custody ledger.` : 'No hardware digital evidence seized yet.',
      tabTarget: 'evidence'
    },
    {
      stage: 'Statutory Preservation Notices (Sec 91 CrPC)',
      status: notices.length > 0 ? 'Completed' : 'In Progress',
      icon: FileCheck,
      color: notices.length > 0 ? 'var(--info)' : 'var(--text-dim)',
      desc: notices.length > 0 ? `${notices.length} notice(s) dispatched to intermediaries (Banks/Telecom).` : 'Preservation notices pending dispatch.',
      tabTarget: 'notices'
    },
    {
      stage: 'Digital Forensic Laboratory Analysis',
      status: forensics.length > 0 ? 'Completed' : 'Pending',
      icon: Microscope,
      color: forensics.length > 0 ? 'var(--primary)' : 'var(--text-dim)',
      desc: forensics.length > 0 ? `Lab Requisition ${forensics[0].id} processed by ${forensics[0].assignedExpert}.` : 'Pending forensic lab requisition submission.',
      tabTarget: 'forensics'
    },
    {
      stage: 'Final Investigation Charge-Sheet / Report',
      status: firs.length > 0 ? 'Ready to Generate' : 'Pending Lifecycle Completion',
      icon: Award,
      color: firs.length > 0 ? 'var(--warning)' : 'var(--text-dim)',
      desc: 'Consolidate evidence chain, witness statements, and forensic findings into official court final report.',
      tabTarget: 'report'
    }
  ];

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <GitBranch style={{ color: 'var(--primary)' }} />
            Module 11: End-to-End Investigation Lifecycle Timeline
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Case Record</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{activeComplaint.id}: {activeComplaint.incidentType}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>Victim: {activeComplaint.victimName} ({activeComplaint.contact})</div>
            </div>

            <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Vertical line connector */}
              <div style={{ position: 'absolute', left: '39px', top: '24px', bottom: '24px', width: '2px', background: 'var(--border-glow)', zIndex: 1 }} />

              {timelineSteps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = step.status === 'Completed' || step.status === 'Ready to Generate';
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isCompleted ? step.color : '#1f2937',
                      color: isCompleted ? '#000' : '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, flexShrink: 0, boxShadow: isCompleted ? `0 0 12px ${step.color}` : 'none'
                    }}>
                      <Icon size={18} />
                    </div>

                    <div 
                      style={{
                        flex: 1, padding: '16px', borderRadius: '8px',
                        background: isCompleted ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                        border: isCompleted ? '1px solid var(--border-color)' : '1px dashed #374151',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveTab(step.tabTarget)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          Step {idx + 1}: {step.stage}
                        </div>
                        <span className={`status-badge ${isCompleted ? 'approved' : 'pending'}`}>{step.status}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
