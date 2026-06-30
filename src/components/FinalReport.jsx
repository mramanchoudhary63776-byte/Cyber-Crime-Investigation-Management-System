import React from 'react';
import { Award, Printer, Download, ShieldCheck, FileText, HardDrive, Microscope, Building2, UserCheck } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function FinalReport({ selectedComplaintId, setSelectedComplaintId }) {
  const complaints = investigationService.getComplaints();
  const activeComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  const firs = investigationService.getFirs().filter(f => f.complaintId === activeComplaint?.id);
  const evidence = investigationService.getEvidence(activeComplaint?.id);
  const notices = investigationService.getNotices(activeComplaint?.id);
  const forensics = investigationService.getForensics(activeComplaint?.id);
  const witnesses = investigationService.getWitnesses(activeComplaint?.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="csoc-card no-print mb-4">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <Award style={{ color: 'var(--warning)' }} />
            Module 12: Official Cybercrime Final Investigation Report
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              className="form-select" 
              value={activeComplaint?.id} 
              onChange={e => setSelectedComplaintId(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {complaints.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.victimName}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={16} /> Print / Export Formal PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div style={{ background: '#ffffff', color: '#111827', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontFamily: 'serif', lineHeight: 1.6 }}>
        {/* Header Block */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '20px', marginBottom: '30px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '2px', color: '#374151' }}>FORMAL INVESTIGATION CHARGE-SHEET / CLOSURE REPORT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px' }}>SPECIAL CELL - CYBER CRIME INVESTIGATION UNIT</div>
          <div style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: '2px' }}>Standard Operating Procedure Compliance Verification Ledger</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
            <span>REPORT REF: CIR-2026/{activeComplaint?.id}</span>
            <span>DATE: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Section 1: Complaint & FIR Metadata */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '12px', fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
            1. Complaint & Statutory FIR Reference
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: 'sans-serif' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px', fontWeight: 'bold', width: '25%', background: '#f3f4f6' }}>Complaint ID:</td>
                <td style={{ padding: '6px' }}>{activeComplaint?.id}</td>
                <td style={{ padding: '6px', fontWeight: 'bold', width: '25%', background: '#f3f4f6' }}>Registration Date:</td>
                <td style={{ padding: '6px' }}>{activeComplaint?.createdDate}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', fontWeight: 'bold', background: '#f3f4f6' }}>Victim Full Name:</td>
                <td style={{ padding: '6px' }}>{activeComplaint?.victimName} ({activeComplaint?.contact})</td>
                <td style={{ padding: '6px', fontWeight: 'bold', background: '#f3f4f6' }}>Incident Type:</td>
                <td style={{ padding: '6px' }}>{activeComplaint?.incidentType}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', fontWeight: 'bold', background: '#f3f4f6' }}>FIR Number:</td>
                <td style={{ padding: '6px', fontWeight: 'bold', color: '#1d4ed8' }}>{firs[0]?.firNo || 'N/A'}</td>
                <td style={{ padding: '6px', fontWeight: 'bold', background: '#f3f4f6' }}>Assigned IO:</td>
                <td style={{ padding: '6px' }}>{firs[0]?.investigatingOfficer || 'Insp. Vikram Rathore'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', fontWeight: 'bold', background: '#f3f4f6' }}>Reported Financial Loss:</td>
                <td style={{ padding: '6px', fontWeight: 'bold', color: '#b91c1c' }}>₹{(activeComplaint?.financialLoss || 0).toLocaleString('en-IN')}</td>
                <td style={{ padding: '6px', fontWeight: 'bold', background: '#f3f4f6' }}>Applied IT Act Sections:</td>
                <td style={{ padding: '6px' }}>{firs[0]?.itActSections?.join(', ') || 'Sec 66C, Sec 66D'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Summary of Allegations */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '10px', fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
            2. Incident Summary & Allegations
          </div>
          <p style={{ fontSize: '0.95rem', fontStyle: 'italic', background: '#f9fafb', padding: '12px', borderRadius: '4px', borderLeft: '3px solid #3b82f6' }}>
            "{activeComplaint?.description}"
          </p>
        </div>

        {/* Section 3: Digital Evidence & Hash Ledger */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '10px', fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
            3. Seized Digital Evidence & SHA-256 Chain of Custody
          </div>
          {evidence.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
              <thead>
                <tr style={{ background: '#e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Evidence ID</th>
                  <th style={{ padding: '6px' }}>Device / Storage Media</th>
                  <th style={{ padding: '6px' }}>Serial / IMEI</th>
                  <th style={{ padding: '6px' }}>Cryptographic SHA-256 Checksum</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px', fontWeight: 'bold' }}>{e.id}</td>
                    <td style={{ padding: '6px' }}>{e.deviceName} ({e.deviceType})</td>
                    <td style={{ padding: '6px' }}>{e.serialNo}</td>
                    <td style={{ padding: '6px', fontFamily: 'monospace', fontSize: '0.75rem' }}>{e.hashValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>No hardware evidence items recorded.</p>}
        </div>

        {/* Section 4: Forensic Findings & Intermediary Notices */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '10px', fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
            4. Digital Forensic Findings & Statutory Requisitions
          </div>
          <div style={{ fontSize: '0.9rem', fontFamily: 'sans-serif' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Forensic Laboratory Analysis:</div>
            {forensics.map(f => (
              <div key={f.id} style={{ marginBottom: '8px', padding: '8px', background: '#f3f4f6' }}>
                <div><strong>Requisition ID:</strong> {f.id} | <strong>Expert:</strong> {f.assignedExpert}</div>
                <div><strong>Finding Summary:</strong> {f.reportSummary}</div>
              </div>
            ))}
            
            <div style={{ fontWeight: 'bold', marginTop: '12px', marginBottom: '4px' }}>Statutory Intermediary Notices Dispatched (Sec 91 CrPC):</div>
            {notices.map(n => (
              <div key={n.id} style={{ fontSize: '0.85rem' }}>• <strong>{n.targetAgency}:</strong> {n.noticeType} — <em>Status: {n.responseStatus} ({n.documentsReceived})</em></div>
            ))}
          </div>
        </div>

        {/* Section 5: Conclusion & IO Signoff */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #111827' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
            5. Final Investigation Conclusion & Recommendation
          </div>
          <p style={{ fontSize: '0.95rem', marginBottom: '40px' }}>
            Based on the digital evidence extracted, cryptographic hash integrity verifications, witness depositions, and banking transaction IP logs received under Sec 91 CrPC statutory notices, the investigation conclusively establishes prime facie evidence regarding the committed cyber offence. Charge-sheet submitted for judicial consideration.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', borderTop: '1px solid #111827', paddingTop: '4px', width: '200px' }}>Dr. S. K. Gupta</div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>Senior Forensic Examiner</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', borderTop: '1px solid #111827', paddingTop: '4px', width: '220px' }}>Insp. Vikram Rathore</div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>Investigating Officer (IO), Cyber Cell</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
