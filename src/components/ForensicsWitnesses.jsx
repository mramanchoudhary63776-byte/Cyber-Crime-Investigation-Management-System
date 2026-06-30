import React, { useState } from 'react';
import { Search, UserCheck, Camera, FileText, Plus, CheckCircle, Upload, Microscope } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function ForensicsWitnesses({ selectedComplaintId, setSelectedComplaintId }) {
  const complaints = investigationService.getComplaints();
  const activeComplaintId = selectedComplaintId || complaints[0]?.id;

  const [activeTab, setActiveSubTab] = useState('forensics'); // forensics, witnesses, scene
  const [forensicsList, setForensicsList] = useState(investigationService.getForensics(activeComplaintId));
  const [witnessList, setWitnessList] = useState(investigationService.getWitnesses(activeComplaintId));

  // Crime Scene Checklist State
  const [sceneChecklist, setSceneChecklist] = useState({
    visited: true,
    photography: true,
    videography: false,
    notes: 'Visited primary location. Suspect access logs verified. ESD bags utilized for seizure.',
    mediaFiles: ['scene_photo_01.jpg', 'dvr_dump_chunk.raw']
  });

  // Modals
  const [showForensicModal, setShowForensicModal] = useState(false);
  const [showWitnessModal, setShowWitnessModal] = useState(false);

  const [forensicForm, setForensicForm] = useState({
    evidenceId: 'EVD-9901',
    assignedExpert: 'Dr. S. K. Gupta (Senior Digital Forensic Analyst)',
    requestType: 'Cellebrite UFED Physical Extraction & Malware Inspection'
  });

  const [witnessForm, setWitnessForm] = useState({
    name: 'Inspector Rajesh Kumar',
    relation: 'Nodal Officer / Branch Manager',
    contact: '+91 98111 22334',
    statementSummary: 'Verified fraudulent IP access log timestamps matching victim ledger statement.'
  });

  const handleCreateForensic = (e) => {
    e.preventDefault();
    investigationService.addForensicRequest({
      complaintId: activeComplaintId,
      evidenceId: forensicForm.evidenceId,
      assignedExpert: forensicForm.assignedExpert,
      requestType: forensicForm.requestType
    });
    setForensicsList(investigationService.getForensics(activeComplaintId));
    setShowForensicModal(false);
  };

  const handleCreateWitness = (e) => {
    e.preventDefault();
    investigationService.addWitness({
      complaintId: activeComplaintId,
      name: witnessForm.name,
      relation: witnessForm.relation,
      contact: witnessForm.contact,
      statementSummary: witnessForm.statementSummary
    });
    setWitnessList(investigationService.getWitnesses(activeComplaintId));
    setShowWitnessModal(false);
  };

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <Microscope style={{ color: 'var(--primary)' }} />
            Module 6, 9 & 10: Forensics, Witness & Crime Scene Documentation
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              className="form-select" 
              value={activeComplaintId} 
              onChange={e => {
                setSelectedComplaintId(e.target.value);
                setForensicsList(investigationService.getForensics(e.target.value));
                setWitnessList(investigationService.getWitnesses(e.target.value));
              }}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {complaints.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.victimName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button 
            className={`btn ${activeTab === 'forensics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('forensics')}
          >
            <Microscope size={16} /> Forensic Analysis ({forensicsList.length})
          </button>
          <button 
            className={`btn ${activeTab === 'witnesses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('witnesses')}
          >
            <UserCheck size={16} /> Witness Management ({witnessList.length})
          </button>
          <button 
            className={`btn ${activeTab === 'scene' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('scene')}
          >
            <Camera size={16} /> Crime Scene Checklist
          </button>
        </div>

        {/* TAB 1: Forensics */}
        {activeTab === 'forensics' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Lab Requisitions & Forensic Examinations</div>
              <button className="btn btn-primary" onClick={() => setShowForensicModal(true)} style={{ fontSize: '0.82rem' }}>
                <Plus size={16} /> Requisition Lab Examination
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {forensicsList.map(item => (
                <div key={item.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>{item.id}</span>
                    <span className={`status-badge ${item.status === 'Completed' ? 'approved' : 'pending'}`}>{item.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', marginTop: '6px' }}>{item.requestType}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Assigned Expert: {item.assignedExpert} | Linked Media: {item.evidenceId}</div>
                  
                  <div style={{ marginTop: '12px', padding: '10px', background: '#0a0f1d', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Lab Summary: </span>
                    {item.reportSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Witnesses */}
        {activeTab === 'witnesses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Recorded Witness Statements & Deposition Notes</div>
              <button className="btn btn-primary" onClick={() => setShowWitnessModal(true)} style={{ fontSize: '0.82rem' }}>
                <Plus size={16} /> Record Witness Statement
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {witnessList.map(item => (
                <div key={item.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent)' }}>{item.id}</span>
                    <span className="status-badge info">{item.relation}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{item.name} ({item.contact})</div>
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
                    "{item.statementSummary}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Crime Scene Checklist */}
        {activeTab === 'scene' && (
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>SOP Crime Scene Visit & Documentation Protocol</div>
            <div className="grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sceneChecklist.visited} onChange={e => setSceneChecklist({...sceneChecklist, visited: e.target.checked})} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Physical / Virtual Scene Visited</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inspection of server room or victim device acquisition site</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sceneChecklist.photography} onChange={e => setSceneChecklist({...sceneChecklist, photography: e.target.checked})} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Forensic Photography Conducted</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hi-res capture of cabling, screen states, and environment</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sceneChecklist.videography} onChange={e => setSceneChecklist({...sceneChecklist, videography: e.target.checked})} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Continuous Videography Recording</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Video recording of seizure process for court admissibility</div>
                  </div>
                </label>
              </div>

              <div className="csoc-card" style={{ background: '#0a0f1d' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px' }}>Attached Scene Artifacts & Documents</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {sceneChecklist.mediaFiles.map((file, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📷 {file}</span>
                      <span style={{ color: 'var(--primary)' }}>Uploaded</span>
                    </div>
                  ))}
                </div>

                <div style={{ border: '2px dashed var(--border-glow)', padding: '20px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer' }}>
                  <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to Upload Additional Scene Media</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Supports JPG, MP4, RAW, LOG</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forensic Modal */}
      {showForensicModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="csoc-card" style={{ width: '550px' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">Requisition Forensic Examination</div>
              <button onClick={() => setShowForensicModal(false)} style={{ background: 'none', color: 'white', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleCreateForensic}>
              <div className="form-group">
                <label className="form-label">Linked Evidence ID</label>
                <input className="form-input" value={forensicForm.evidenceId} onChange={e => setForensicForm({...forensicForm, evidenceId: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Forensic Specialist</label>
                <input className="form-input" value={forensicForm.assignedExpert} onChange={e => setForensicForm({...forensicForm, assignedExpert: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Examination Scope & Requisition Directives</label>
                <textarea rows="3" className="form-textarea" value={forensicForm.requestType} onChange={e => setForensicForm({...forensicForm, requestType: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForensicModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Requisition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Witness Modal */}
      {showWitnessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="csoc-card" style={{ width: '550px' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">Record Witness Statement</div>
              <button onClick={() => setShowWitnessModal(false)} style={{ background: 'none', color: 'white', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleCreateWitness}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Witness Name</label>
                  <input required className="form-input" value={witnessForm.name} onChange={e => setWitnessForm({...witnessForm, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Relation / Designation</label>
                  <input required className="form-input" value={witnessForm.relation} onChange={e => setWitnessForm({...witnessForm, relation: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input className="form-input" value={witnessForm.contact} onChange={e => setWitnessForm({...witnessForm, contact: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Official Recorded Deposition Summary</label>
                <textarea rows="3" className="form-textarea" value={witnessForm.statementSummary} onChange={e => setWitnessForm({...witnessForm, statementSummary: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWitnessModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Statement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
