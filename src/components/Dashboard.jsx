import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, AlertTriangle, HardDrive, 
  ArrowUpRight, Clock, PlusCircle, CheckCircle2, FileCheck2, Eye 
} from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function Dashboard({ setActiveTab, setSelectedComplaintId }) {
  const [complaints, setComplaints] = useState([]);
  const [firs, setFirs] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [cData, fData, eData, nData] = await Promise.all([
          investigationService.getComplaints(),
          investigationService.getFirs(),
          investigationService.getEvidence(),
          investigationService.getNotices()
        ]);
        if (active) {
          setComplaints(cData || []);
          setFirs(fData || []);
          setEvidence(eData || []);
          setNotices(nData || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  const totalFinancialLoss = complaints.reduce((sum, c) => sum + (c.financialLoss || 0), 0);

  return (
    <div className="dashboard-view">
      {/* Responsive Metrics Row */}
      <div className="grid-4 mb-4">
        <div className="csoc-card" style={{ borderLeft: '4px solid var(--primary)', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Total Complaints</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '4px' }}>{complaints.length}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(6,182,212,0.15)', borderRadius: '8px', color: 'var(--primary)' }}>
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="csoc-card" style={{ borderLeft: '4px solid var(--secondary)', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Registered FIRs</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '4px' }}>{firs.length}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(59,130,246,0.15)', borderRadius: '8px', color: 'var(--secondary)' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>

        <div className="csoc-card" style={{ borderLeft: '4px solid var(--accent)', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Seized Digital Evidence</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '4px' }}>{evidence.length}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(139,92,246,0.15)', borderRadius: '8px', color: 'var(--accent)' }}>
              <HardDrive size={20} />
            </div>
          </div>
        </div>

        <div className="csoc-card" style={{ borderLeft: '4px solid var(--warning)', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Reported Loss</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: '#fbbf24' }}>
                ₹{totalFinancialLoss.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(245,158,11,0.15)', borderRadius: '8px', color: 'var(--warning)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2">
        {/* Active Cyber Crime Cases */}
        <div className="csoc-card" style={{ margin: 0 }}>
          <div className="csoc-card-header">
            <div className="csoc-card-title">
              <Clock className="text-cyan" size={18} style={{ color: 'var(--primary)' }} />
              Active Cybercrime Complaints
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveTab('complaints')} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complaints.map(item => (
              <div 
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  setSelectedComplaintId(item.id);
                  setActiveTab('timeline');
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>
                      {item.id}
                    </span>
                    <span className="status-badge info">{item.incidentType}</span>
                  </div>
                  <div style={{ fontWeight: 600, marginTop: '4px', fontSize: '0.92rem' }}>{item.victimName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loss: ₹{(item.financialLoss || 0).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className={`status-badge ${item.status === 'FIR Registered' ? 'approved' : 'pending'}`}>
                    {item.status}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Inspect Flow <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Statutory Preservation Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="csoc-card" style={{ margin: 0 }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">
                <PlusCircle size={18} style={{ color: 'var(--primary)' }} />
                Quick Investigation Requisitions
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('complaints')} style={{ justifyContent: 'center', padding: '10px 8px', fontSize: '0.78rem' }}>
                <FileText size={16} /> Register Case
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('assessment')} style={{ justifyContent: 'center', padding: '10px 8px', fontSize: '0.78rem' }}>
                <CheckCircle2 size={16} /> Legal Framing
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('evidence')} style={{ justifyContent: 'center', padding: '10px 8px', fontSize: '0.78rem' }}>
                <HardDrive size={16} /> Seize Evidence
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('notices')} style={{ justifyContent: 'center', padding: '10px 8px', fontSize: '0.78rem' }}>
                <FileCheck2 size={16} /> Sec 91 Notice
              </button>
            </div>
          </div>

          <div className="csoc-card" style={{ flex: 1, margin: 0 }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">
                <FileCheck2 size={18} style={{ color: 'var(--info)' }} />
                Sec 91 CrPC Preservation Notices Tracking
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notices.map(notice => (
                <div key={notice.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{notice.targetAgency}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{notice.noticeType} ({notice.complaintId})</div>
                  </div>
                  <span className={`status-badge ${notice.responseStatus.includes('Received') ? 'approved' : 'pending'}`}>
                    {notice.responseStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
