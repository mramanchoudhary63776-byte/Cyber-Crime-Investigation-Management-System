import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, Building2, Send, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function NoticesManagement({ selectedComplaintId, setSelectedComplaintId }) {
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const activeComplaintId = selectedComplaintId || complaints[0]?.id;
  const activeComplaint = complaints.find(c => c.id === activeComplaintId);
  const isClosed = activeComplaint?.caseStatus && activeComplaint?.caseStatus !== 'active';

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const cList = await investigationService.getComplaints();
        if (active) {
          setComplaints(cList || []);
          const activeCId = selectedComplaintId || cList[0]?.id;
          if (activeCId) {
            const nList = await investigationService.getNotices(activeCId);
            if (active) setNotices(nList || []);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    return () => { active = false; };
  }, [selectedComplaintId]);

  const agencyTemplates = {
    'Bank / Wallet Provider': ['Paytm Payments Bank Ltd', 'HDFC Bank Nodal Office', 'State Bank of India Cyber Cell'],
    'Telecom Operator': ['Bharti Airtel Ltd Legal Cell', 'Reliance Jio Infocomm', 'Vodafone Idea Nodal'],
    'ISP / Cloud Provider': ['Amazon Web Services (AWS)', 'Google Cloud Compliance', 'ACT Fibernet IPDR Desk'],
    'Social Media Platform': ['Meta Platforms (WhatsApp/IG)', 'Telegram Legal Interception', 'X Corp Legal Ops']
  };

  const [formData, setFormData] = useState({
    complaintId: activeComplaintId,
    agencyType: 'Bank / Wallet Provider',
    targetAgency: 'Paytm Payments Bank Ltd',
    noticeType: 'Sec 91 CrPC Account Freeze & Preservation Notice',
    customNotes: 'Requesting immediate debit freeze on beneficiary account and detailed IP login logs.'
  });

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (isClosed) return;
    try {
      await investigationService.addNotice({
        complaintId: activeComplaintId,
        agencyType: formData.agencyType,
        targetAgency: formData.targetAgency,
        noticeType: formData.noticeType,
        customNotes: formData.customNotes
      });
      const nList = await investigationService.getNotices(activeComplaintId);
      setNotices(nList || []);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <FileCheck style={{ color: 'var(--info)' }} />
            Module 4 & 8: Preservation Notices & Third-Party Requests (Sec 91 CrPC)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              className="form-select" 
              value={activeComplaintId} 
              onChange={async (e) => {
                const nextId = e.target.value;
                setSelectedComplaintId(nextId);
                try {
                  const nList = await investigationService.getNotices(nextId);
                  setNotices(nList || []);
                } catch (err) {
                  console.error(err);
                }
              }}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {complaints.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.victimName}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={isClosed}>
              <Plus size={18} /> Issue Sec 91 Notice
            </button>
          </div>
        </div>

        {isClosed && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--danger)',
            borderRadius: '8px',
            padding: '12px 16px',
            margin: '0 20px 20px 20px',
            color: '#f87171',
            fontSize: '0.88rem',
            fontWeight: 700
          }}>
            ⚠️ Case File Locked: This case has been archived/closed. Dispatching new preservation notices is disabled.
          </div>
        )}

        <div className="grid-3 mb-4">
          <div className="csoc-card" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispatched Notices</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)' }}>{notices.length}</div>
          </div>
          <div className="csoc-card" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responses Received</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
              {notices.filter(n => n.responseStatus.includes('Received') || n.responseStatus.includes('Completed')).length}
            </div>
          </div>
          <div className="csoc-card" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Agency Action</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
              {notices.filter(n => n.responseStatus.includes('Pending')).length}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="csoc-table">
            <thead>
              <tr>
                <th>Notice ID</th>
                <th>Target Intermediary Agency</th>
                <th>Notice / Statutory Type</th>
                <th>Dispatched Date</th>
                <th>Status</th>
                <th>Received Record / Deliverable</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(item => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--info)' }}>
                    {item.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={16} style={{ color: 'var(--primary)' }} />
                      {item.targetAgency}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {item.agencyType}</div>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.noticeType}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.sentDate}</td>
                  <td>
                    <span className={`status-badge ${item.responseStatus.includes('Received') ? 'approved' : 'pending'}`}>
                      {item.responseStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    {item.documentsReceived}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="csoc-card" style={{ width: '600px' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">Dispatch Sec 91 CrPC Statutory Notice</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label className="form-label">Agency Category</label>
                <select 
                  className="form-select" 
                  value={formData.agencyType} 
                  onChange={e => {
                    const newType = e.target.value;
                    setFormData({
                      ...formData, 
                      agencyType: newType,
                      targetAgency: agencyTemplates[newType][0]
                    });
                  }}
                >
                  <option>Bank / Wallet Provider</option>
                  <option>Telecom Operator</option>
                  <option>ISP / Cloud Provider</option>
                  <option>Social Media Platform</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Nodal Agency Name</label>
                <select 
                  className="form-select" 
                  value={formData.targetAgency} 
                  onChange={e => setFormData({...formData, targetAgency: e.target.value})}
                >
                  {agencyTemplates[formData.agencyType].map((ag, idx) => (
                    <option key={idx} value={ag}>{ag}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Statutory Request Scope</label>
                <input required className="form-input" value={formData.noticeType} onChange={e => setFormData({...formData, noticeType: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Requisition Details & Specific Directives</label>
                <textarea rows="3" className="form-textarea" value={formData.customNotes} onChange={e => setFormData({...formData, customNotes: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Generate & Issue Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
