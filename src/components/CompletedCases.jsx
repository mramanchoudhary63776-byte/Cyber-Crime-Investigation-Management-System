import React, { useState, useEffect } from 'react';
import { Archive, Search, Eye, RefreshCw, AlertCircle, Calendar, UserCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function CompletedCases({ selectedComplaintId, setSelectedComplaintId, setActiveTab, activeRole }) {
  const [completedCases, setCompletedCases] = useState([]);
  const [filterReason, setFilterReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Reopening Modal State
  const [reopenCaseId, setReopenCaseId] = useState(null);
  const [reopenRemarks, setReopenRemarks] = useState('');
  const [reopening, setReopening] = useState(false);

  // Load completed cases
  async function loadCompletedCases() {
    setLoading(true);
    try {
      const data = await investigationService.getCompletedCases(filterReason);
      setCompletedCases(data || []);
    } catch (err) {
      console.error('Error fetching completed cases:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompletedCases();
  }, [filterReason]);

  // Handle reopening a case
  const handleReopen = async (e) => {
    if (e) e.preventDefault();
    if (!reopenRemarks.trim()) {
      alert('Reopening remarks are required for the audit trail.');
      return;
    }
    setReopening(true);
    try {
      await investigationService.updateCaseStatus(reopenCaseId, {
        status: 'active',
        reason: 'Reopened',
        remarks: reopenRemarks,
        performedBy: 'Supervisor / SHO'
      });
      alert(`Case ${reopenCaseId} has been successfully reopened and returned to the active queue.`);
      setReopenCaseId(null);
      setReopenRemarks('');
      loadCompletedCases();
    } catch (err) {
      console.error('Error reopening case:', err);
      alert('Failed to reopen the case. Please try again.');
    } finally {
      setReopening(false);
    }
  };

  // Inspect the full dossier (redirect to complaints detail view)
  const handleInspect = (caseId) => {
    setSelectedComplaintId(caseId);
    setActiveTab('complaints');
  };

  // Filter completed cases based on search term
  const filteredCases = completedCases.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.victimName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.incidentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render Status Badge
  const renderStatusBadge = (status) => {
    if (status === 'resolved') {
      return <span className="status-badge approved">Resolved</span>;
    } else if (status === 'false_report') {
      return <span className="status-badge rejected">False Report</span>;
    } else {
      return <span className="status-badge pending">Closed Other</span>;
    }
  };

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <Archive style={{ color: 'var(--primary)' }} />
            Module 12: Completed & Archived Cases Inventory
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Inspect historical investigations, false complaints, and solved case files. Closed files are locked in read-only audit mode.
        </p>

        {/* Filters and Search Row */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search archived files by ID, Victim, or Category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <div style={{ width: '220px' }}>
            <select 
              className="form-select"
              value={filterReason} 
              onChange={(e) => setFilterReason(e.target.value)}
            >
              <option value="">-- All Closure Reasons --</option>
              <option value="Resolved">Resolved</option>
              <option value="False Report">False Report</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Insufficient Evidence">Insufficient Evidence</option>
              <option value="Other">Other Reasons</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: '200px', flexDirection: 'column', gap: '12px' }}>
            <Loader2 className="animate-spin text-cyan" size={32} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Loading Archived Cases...</span>
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="table-responsive">
            <table className="csoc-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Victim Details</th>
                  <th>Incident Type</th>
                  <th>Status</th>
                  <th>Closure Reason</th>
                  <th>Archived By</th>
                  <th>Closed Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                      {item.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.victimName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.contact}</div>
                    </td>
                    <td>
                      <span className="status-badge info" style={{ opacity: 0.8 }}>{item.incidentType}</span>
                    </td>
                    <td>
                      {renderStatusBadge(item.caseStatus)}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.85rem' }}>{item.closureReason}</strong>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck size={14} style={{ color: 'var(--primary)' }} />
                        {item.closedBy || 'System'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.closedAt ? new Date(item.closedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleInspect(item.id)}
                        >
                          <Eye size={14} /> Inspect Dossier
                        </button>
                        {activeRole === 'Supervisor' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)', color: '#34d399' }}
                            onClick={() => setReopenCaseId(item.id)}
                          >
                            <RefreshCw size={14} /> Reopen Case
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            <AlertCircle size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>No Closed Cases Found</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              All cases are currently in the active working queue.
            </p>
          </div>
        )}
      </div>

      {/* REOPEN CASE MODAL */}
      {reopenCaseId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div className="csoc-card" style={{ width: '480px', background: '#0f172a' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">
                🔓 Reopen Archived Case File
              </div>
              <button onClick={() => setReopenCaseId(null)} style={{ background: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleReopen}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                You are about to reopen case file <strong style={{ color: 'var(--primary)' }}>{reopenCaseId}</strong>. This action will restore it to the active working queue for the Investigating Officers.
              </p>

              <div className="form-group">
                <label className="form-label">Audit Reopening Remarks *</label>
                <textarea 
                  required
                  rows="3"
                  className="form-textarea"
                  value={reopenRemarks}
                  onChange={(e) => setReopenRemarks(e.target.value)}
                  placeholder="Provide audit justification for reopening this archived case..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReopenCaseId(null)} disabled={reopening}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#34d399', borderColor: '#34d399', color: 'black', fontWeight: 700 }} disabled={reopening}>
                  {reopening ? 'Reopening...' : 'Confirm & Reopen Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
