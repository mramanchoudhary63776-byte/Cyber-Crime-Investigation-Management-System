import React, { useState } from 'react';
import { FileSpreadsheet, Plus, ShieldCheck, UserCheck, Eye, Layers, FileText } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function FirManagement({ selectedComplaintId, setSelectedComplaintId, setActiveTab }) {
  const [firs, setFirs] = useState(investigationService.getFirs());
  const complaints = investigationService.getComplaints();
  const [showModal, setShowModal] = useState(false);
  const [viewFir, setViewFir] = useState(null);

  const activeComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];
  const activeComplaintDetails = activeComplaint ? investigationService.getComplaintDetails(activeComplaint.id) : null;

  const [formData, setFormData] = useState({
    complaintId: selectedComplaintId || complaints[0]?.id || '',
    policeStation: 'Cyber Crime PS, Special Cell, Central',
    investigatingOfficer: 'Insp. Vikram Rathore',
    itActSections: activeComplaintDetails ? activeComplaintDetails.sections.join(', ') : 'Sec 66C, Sec 66D, Sec 43'
  });

  const handleRegister = (e) => {
    e.preventDefault();
    const sectionsArray = formData.itActSections.split(',').map(s => s.trim());
    const createdFir = investigationService.registerFir(formData.complaintId, {
      policeStation: formData.policeStation,
      investigatingOfficer: formData.investigatingOfficer,
      itActSections: sectionsArray
    });
    setFirs([...investigationService.getFirs()]);
    setShowModal(false);
    setSelectedComplaintId(formData.complaintId);
    setViewFir(createdFir);
  };

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <FileSpreadsheet style={{ color: 'var(--secondary)' }} />
            Module 5: First Information Report (FIR) Management & SOP Mapping
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Register Formal FIR
          </button>
        </div>

        <div className="table-responsive">
          <table className="csoc-table">
            <thead>
              <tr>
                <th>FIR Number</th>
                <th>Linked Complaint</th>
                <th>Police Station</th>
                <th>Investigating Officer</th>
                <th>Applied IT Act & IPC Sections</th>
                <th>Date Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {firs.map(fir => (
                <tr key={fir.firNo}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--secondary)' }}>
                    {fir.firNo}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {fir.complaintId}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{fir.policeStation}</td>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={16} style={{ color: 'var(--primary)' }} />
                      {fir.investigatingOfficer}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {fir.itActSections.map((sec, idx) => (
                        <span key={idx} className="status-badge info" style={{ fontSize: '0.7rem' }}>{sec}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fir.registrationDate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setViewFir(fir)}
                      >
                        <Eye size={14} /> FIR Format
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedComplaintId(fir.complaintId);
                          setActiveTab('evidence');
                        }}
                      >
                        Evidence
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIR FORMAT / VIEW MODAL */}
      {viewFir && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px'
        }}>
          <div className="csoc-card" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#0f172a' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title" style={{ color: 'var(--secondary)' }}>
                <FileSpreadsheet /> Official FIR Record View ({viewFir.firNo})
              </div>
              <button onClick={() => setViewFir(null)} style={{ background: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ border: '2px solid var(--border-color)', borderRadius: '8px', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px', color: 'var(--secondary)' }}>FIRST INFORMATION REPORT (Under Sec 154 Cr.P.C.)</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jurisdiction: {viewFir.policeStation}</div>
              </div>

              <div className="grid-2 mb-4" style={{ fontSize: '0.88rem' }}>
                <div><strong>FIR Number:</strong> <span style={{ color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>{viewFir.firNo}</span></div>
                <div><strong>Registration Date:</strong> {viewFir.registrationDate}</div>
                <div><strong>Linked Complaint ID:</strong> <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{viewFir.complaintId}</span></div>
                <div><strong>Investigating Officer:</strong> {viewFir.investigatingOfficer}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Cognizable Acts & Penal Sections Applied:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {viewFir.itActSections.map((sec, idx) => (
                    <span key={idx} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontWeight: 700, fontSize: '0.8rem' }}>
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={() => setViewFir(null)}>Close Record View</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER FIR MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div className="csoc-card" style={{ width: '550px' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">Register Formal FIR</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Select Complaint ID</label>
                <select className="form-select" value={formData.complaintId} onChange={e => {
                  const cId = e.target.value;
                  const details = investigationService.getComplaintDetails(cId);
                  setFormData({
                    ...formData,
                    complaintId: cId,
                    itActSections: details ? details.sections.join(', ') : formData.itActSections
                  });
                }}>
                  {complaints.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.victimName} ({c.incidentType})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Police Station / Jurisdiction Unit</label>
                <input className="form-input" value={formData.policeStation} onChange={e => setFormData({...formData, policeStation: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Investigating Officer (IO)</label>
                <input className="form-input" value={formData.investigatingOfficer} onChange={e => setFormData({...formData, investigatingOfficer: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Auto-Mapped IT Act & IPC Sections</label>
                <input className="form-input" value={formData.itActSections} onChange={e => setFormData({...formData, itActSections: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate FIR & View Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
