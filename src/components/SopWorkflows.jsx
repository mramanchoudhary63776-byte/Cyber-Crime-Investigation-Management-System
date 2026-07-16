import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, ShieldAlert, FileText, ArrowRight, BookOpen, Printer, Save, Loader2 } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function SopWorkflows({ selectedComplaintId, activeRole }) {
  const [playbooks, setPlaybooks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(selectedComplaintId || '');
  const [selectedFraudType, setSelectedFraudType] = useState('');
  const [activeChannel, setActiveChannel] = useState('');
  const [checkedSteps, setCheckedSteps] = useState({}); // { channel: [steps] }
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // 1. Fetch initial data: playbooks and complaints
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [playbookData, complaintData] = await Promise.all([
          investigationService.getPlaybooks(),
          investigationService.getComplaints()
        ]);
        setPlaybooks(playbookData || []);
        setComplaints(complaintData || []);
        
        // If a complaint was passed as prop, set it
        if (selectedComplaintId) {
          setSelectedCaseId(selectedComplaintId);
        } else if (complaintData && complaintData.length > 0) {
          setSelectedCaseId(complaintData[0].id);
        }
      } catch (err) {
        console.error('Error loading SOP Playbooks data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [selectedComplaintId]);

  // 2. Fetch case progress whenever active case changes
  useEffect(() => {
    if (!selectedCaseId) return;
    
    async function loadCaseProgress() {
      setSaveStatus('');
      try {
        const progress = await investigationService.getPlaybookProgress(selectedCaseId);
        const activeCase = complaints.find(c => c.id === selectedCaseId);
        
        if (progress) {
          setSelectedFraudType(progress.fraudType);
          setCheckedSteps(progress.checkedSteps || {});
        } else if (activeCase) {
          // If no saved progress, try to map the case's incident type to a playbook
          const mappedPlaybook = playbooks.find(p => 
            p.fraud_type.toLowerCase().includes(activeCase.incidentType.toLowerCase()) ||
            activeCase.incidentType.toLowerCase().includes(p.fraud_type.toLowerCase())
          );
          if (mappedPlaybook) {
            setSelectedFraudType(mappedPlaybook.fraud_type);
          } else if (playbooks.length > 0) {
            setSelectedFraudType(playbooks[0].fraud_type);
          }
          setCheckedSteps({});
        }
      } catch (err) {
        console.error('Error loading case progress:', err);
      }
    }
    loadCaseProgress();
  }, [selectedCaseId, playbooks, complaints]);

  // Set default active channel when fraud type changes
  useEffect(() => {
    if (!selectedFraudType) return;
    const currentPlaybook = playbooks.find(p => p.fraud_type === selectedFraudType);
    if (currentPlaybook && currentPlaybook.branches.length > 0) {
      setActiveChannel(currentPlaybook.branches[0].channel);
    } else {
      setActiveChannel('');
    }
  }, [selectedFraudType, playbooks]);

  // Find currently active case details
  const activeCase = complaints.find(c => c.id === selectedCaseId);

  // Find currently active playbook details
  const activePlaybook = playbooks.find(p => p.fraud_type === selectedFraudType);

  // Handle toggling step checkboxes
  const handleToggleStep = async (channel, step) => {
    if (activeRole !== 'Officer') return; // Read-only for other roles
    
    const channelChecked = checkedSteps[channel] || [];
    let updated;
    if (channelChecked.includes(step)) {
      updated = channelChecked.filter(s => s !== step);
    } else {
      updated = [...channelChecked, step];
    }
    
    const newCheckedSteps = {
      ...checkedSteps,
      [channel]: updated
    };
    
    setCheckedSteps(newCheckedSteps);
    
    // Auto-save to the backend
    setSaveStatus('Saving...');
    try {
      await investigationService.savePlaybookProgress(selectedCaseId, selectedFraudType, newCheckedSteps);
      setSaveStatus('Saved successfully');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Error saving progress:', err);
      setSaveStatus('Error saving progress');
    }
  };

  // Helper to check if a step is checked
  const isStepChecked = (channel, step) => {
    return (checkedSteps[channel] || []).includes(step);
  };

  // Handle printing checklist
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin text-cyan" size={32} style={{ color: 'var(--primary)' }} />
        <span style={{ color: 'var(--text-muted)' }}>Loading SOP Investigation Playbooks...</span>
      </div>
    );
  }

  return (
    <div className="sop-playbook-view">
      {/* 1. Header Configurations Card */}
      <div className="csoc-card no-print">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <Layers style={{ color: 'var(--primary)' }} size={20} />
            SOP Interactive Trace Playbooks
          </div>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Checklist
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Select an active cybercrime complaint case and execute the standardized technical trace path (e.g. IPDR, CDR analysis, or bank freezes) established by the cyber cell protocols.
        </p>

        <div className="grid-2" style={{ gap: '20px' }}>
          {/* Active Case Selector */}
          <div className="form-group">
            <label className="form-label">Linked Complaint Case</label>
            <select 
              className="form-select"
              value={selectedCaseId} 
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="">-- Select Case to Link --</option>
              {complaints.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.victimName} ({c.incidentType})
                </option>
              ))}
            </select>
          </div>

          {/* SOP Category Selector */}
          <div className="form-group">
            <label className="form-label">Investigation SOP Template</label>
            <select
              className="form-select"
              value={selectedFraudType}
              onChange={async (e) => {
                const newFraud = e.target.value;
                setSelectedFraudType(newFraud);
                setCheckedSteps({});
                // If case is active, persist the template change
                if (selectedCaseId && activeRole === 'Officer') {
                  setSaveStatus('Saving...');
                  await investigationService.savePlaybookProgress(selectedCaseId, newFraud, {});
                  setSaveStatus('Template Updated');
                  setTimeout(() => setSaveStatus(''), 2000);
                }
              }}
            >
              {playbooks.map(p => (
                <option key={p.fraud_type} value={p.fraud_type}>
                  {p.fraud_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Case Info Banner */}
        {activeCase && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Victim Name:</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{activeCase.victimName}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incident Type:</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{activeCase.incidentType}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Financial Loss:</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>₹{activeCase.financialLoss ? activeCase.financialLoss.toLocaleString() : '0'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Level:</span>
              <div><span className={`status-badge ${activeCase.riskLevel === 'Critical' || activeCase.riskLevel === 'High' ? 'rejected' : 'pending'}`}>{activeCase.riskLevel}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Save Status Toast */}
      {saveStatus && (
        <div className="flex-center no-print" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: saveStatus.includes('Error') ? 'var(--danger)' : 'var(--success)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-main)',
          zIndex: 1000,
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <Save size={16} />
          {saveStatus}
        </div>
      )}

      {/* 2. Interactive Columns Row */}
      {activePlaybook ? (
        <div className="grid-3 no-print" style={{ gridTemplateColumns: '280px 1fr 1fr', gap: '20px', alignItems: 'stretch' }}>
          
          {/* Left Column: Trace Channels */}
          <div className="csoc-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Investigation Channels
            </div>
            {activePlaybook.branches.map(br => {
              const totalSteps = br.steps.length;
              const completed = (checkedSteps[br.channel] || []).length;
              const isFullyDone = completed === totalSteps && totalSteps > 0;
              
              return (
                <button
                  key={br.channel}
                  className={`btn ${activeChannel === br.channel ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-md)',
                    border: isFullyDone ? '1px solid var(--success)' : '1px solid var(--border-color)'
                  }}
                  onClick={() => setActiveChannel(br.channel)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{br.channel}</span>
                    <span style={{ fontSize: '0.68rem', color: activeChannel === br.channel ? '#ffffff' : 'var(--text-muted)', marginTop: '2px' }}>
                      {completed} / {totalSteps} steps completed
                    </span>
                  </div>
                  {isFullyDone ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Columns: Timeline Checklists */}
          <div className="grid-span-2" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activePlaybook.branches.map(br => {
              if (br.channel !== activeChannel) return null;
              
              return (
                <div key={br.channel} className="csoc-card" style={{ margin: 0, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                        {selectedFraudType} SOP
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Trace Protocol: <span style={{ color: 'white', fontWeight: 600 }}>{br.channel} Channel</span>
                      </div>
                    </div>
                    {activeRole !== 'Officer' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, border: '1px solid var(--danger)', padding: '4px 8px', borderRadius: '4px' }}>
                        Read-Only View
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {br.steps.map((step, idx) => {
                      const isDone = isStepChecked(br.channel, step);
                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-md)',
                            background: isDone ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.01)',
                            border: isDone ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            cursor: activeRole === 'Officer' ? 'pointer' : 'default',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleToggleStep(br.channel, step)}
                        >
                          <div style={{ marginTop: '3px' }}>
                            <input 
                              type="checkbox" 
                              checked={isDone} 
                              disabled={activeRole !== 'Officer'}
                              onChange={() => {}} // Handled by onClick of container
                              style={{ width: '16px', height: '16px', cursor: activeRole === 'Officer' ? 'pointer' : 'default' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isDone ? '#34d399' : 'var(--text-main)' }}>
                              Step {String(idx + 1).padStart(2, '0')}: {step}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {isDone ? '✓ Trace parameter verified and registered in case file.' : 'Pending protocol trace and verification.'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="csoc-card text-center no-print" style={{ padding: '40px' }}>
          <ShieldAlert size={48} style={{ color: 'var(--warning)', margin: '0 auto 16px auto' }} />
          <div style={{ fontWeight: 700 }}>No Playbook Template Loaded</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            Please select an investigation SOP template above.
          </div>
        </div>
      )}

      {/* 3. Printable Print-Only Version (Triggered on Print) */}
      <div className="print-only" style={{ color: 'black', background: 'white', padding: '20px' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase' }}>Cyber Crime Investigation Division</h2>
          <h3 style={{ fontSize: '1.1rem', marginTop: '4px' }}>SOP Trace Checklist & Case Compliance Report</h3>
        </div>

        {activeCase ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px', fontWeight: 700, width: '25%', border: '1px solid #ccc' }}>Case / Complaint ID:</td>
                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{activeCase.id}</td>
                <td style={{ padding: '6px', fontWeight: 700, width: '25%', border: '1px solid #ccc' }}>Incident Type:</td>
                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{activeCase.incidentType}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', fontWeight: 700, border: '1px solid #ccc' }}>Victim Name:</td>
                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{activeCase.victimName}</td>
                <td style={{ padding: '6px', fontWeight: 700, border: '1px solid #ccc' }}>Financial Loss:</td>
                <td style={{ padding: '6px', border: '1px solid #ccc' }}>₹{activeCase.financialLoss ? activeCase.financialLoss.toLocaleString() : '0'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', fontWeight: 700, border: '1px solid #ccc' }}>Investigation Template:</td>
                <td style={{ padding: '6px', border: '1px solid #ccc' }} colSpan={3}>{selectedFraudType}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ marginBottom: '20px', fontStyle: 'italic' }}>No active case linked. General SOP checklist.</div>
        )}

        <h4 style={{ fontSize: '1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
          SOP Channels & Trace Path Checklist
        </h4>

        {activePlaybook && activePlaybook.branches.map(br => {
          const brChecked = checkedSteps[br.channel] || [];
          return (
            <div key={br.channel} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#333', background: '#f5f5f5', padding: '6px', marginBottom: '8px' }}>
                Channel: {br.channel}
              </h5>
              <div style={{ paddingLeft: '10px' }}>
                {br.steps.map((step, idx) => {
                  const isDone = brChecked.includes(step);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0', fontSize: '0.85rem' }}>
                      <span style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
                        {isDone ? '[X]' : '[ ]'}
                      </span>
                      <span>
                        Step {idx + 1}: {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <div>
            <div>Report Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
            <div>Officer Role: {activeRole}</div>
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid black', width: '200px', paddingTop: '4px' }}>
            Investigating Officer Signature
          </div>
        </div>
      </div>
    </div>
  );
}
