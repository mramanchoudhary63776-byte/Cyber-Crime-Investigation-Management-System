import React, { useState, useEffect } from 'react';
import { HardDrive, Plus, Key, Lock, History, ShieldAlert } from 'lucide-react';
import { investigationService } from '../data/investigationService';

export default function EvidenceManagement({ selectedComplaintId, setSelectedComplaintId }) {
  const [complaints, setComplaints] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const activeComplaintId = selectedComplaintId || complaints[0]?.id;

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const cList = await investigationService.getComplaints();
        if (active) {
          setComplaints(cList || []);
          const activeCId = selectedComplaintId || cList[0]?.id;
          if (activeCId) {
            const eList = await investigationService.getEvidence(activeCId);
            if (active) setEvidenceList(eList || []);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    return () => { active = false; };
  }, [selectedComplaintId]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemForChain, setSelectedItemForChain] = useState(null);

  const [formData, setFormData] = useState({
    deviceName: 'Samsung Galaxy S22 Ultra',
    deviceType: 'Mobile Phone',
    serialNo: 'IMEI-998877665544',
    collectedBy: 'Insp. Vikram Rathore',
    sampleTextForHash: 'Digital evidence string content verification checksum'
  });

  const [transferData, setTransferData] = useState({
    custodian: 'Dr. S. K. Gupta (Forensic Specialist)',
    action: 'Transferred for Memory Extraction',
    notes: 'Hand delivered under sealed forensic pouch'
  });

  // Calculate SHA-256 Hash client side
  async function computeSHA256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    try {
      const calculatedHash = await computeSHA256(formData.sampleTextForHash + Date.now());
      await investigationService.addEvidence({
        complaintId: activeComplaintId,
        deviceName: formData.deviceName,
        deviceType: formData.deviceType,
        serialNo: formData.serialNo,
        collectedBy: formData.collectedBy,
        hashValue: calculatedHash
      });
      const eList = await investigationService.getEvidence(activeComplaintId);
      setEvidenceList(eList || []);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustody = async (e) => {
    e.preventDefault();
    if (selectedItemForChain) {
      try {
        await investigationService.addCustodyTransfer(selectedItemForChain.id, transferData);
        const eList = await investigationService.getEvidence(activeComplaintId);
        setEvidenceList(eList || []);
        const updatedItem = eList.find(x => x.id === selectedItemForChain.id);
        setSelectedItemForChain(updatedItem || null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <HardDrive style={{ color: 'var(--accent)' }} />
            Module 7: Digital Evidence Inventory & SHA-256 Chain of Custody
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              className="form-select" 
              value={activeComplaintId} 
              onChange={async (e) => {
                const nextId = e.target.value;
                setSelectedComplaintId(nextId);
                try {
                  const eList = await investigationService.getEvidence(nextId);
                  setEvidenceList(eList || []);
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
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> Seize New Digital Evidence
            </button>
          </div>
        </div>

        <div className="grid-2">
          {/* Evidence Inventory */}
          <div>
            <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)' }}>
              Seized Hardware & Media Inventory ({evidenceList.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {evidenceList.map(item => (
                <div 
                  key={item.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent)' }}>{item.id}</span>
                    <span className="status-badge info">{item.deviceType}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{item.deviceName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Serial / IMEI: {item.serialNo}</div>

                  {/* SHA-256 Hash Box */}
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: '#070a12',
                    borderRadius: '6px',
                    border: '1px dashed var(--border-glow)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    wordBreak: 'break-all',
                    color: 'var(--primary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', color: 'var(--text-muted)' }}>
                      <Key size={12} /> Cryptographic SHA-256 Checksum:
                    </div>
                    {item.hashValue}
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Seized: {item.collectionDate}</span>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => setSelectedItemForChain(item)}
                    >
                      <History size={14} /> View / Add Custody ({item.custodyChain?.length || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chain of Custody Detail Log */}
          <div className="csoc-card" style={{ background: 'rgba(13,19,33,0.5)', margin: 0 }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title" style={{ fontSize: '1rem' }}>
                <Lock size={18} style={{ color: 'var(--primary)' }} />
                Chain of Custody Verification Log
              </div>
            </div>

            {selectedItemForChain ? (
              <div>
                <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(6,182,212,0.1)', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedItemForChain.deviceName} ({selectedItemForChain.id})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Immutable ledger log tracking every physical transfer</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '250px', overflowY: 'auto' }}>
                  {selectedItemForChain.custodyChain.map((c, idx) => (
                    <div key={idx} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{c.timestamp}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{c.action}</span>
                      </div>
                      <div style={{ fontWeight: 600, marginTop: '2px', fontSize: '0.85rem' }}>Custodian: {c.custodian}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Notes: {c.notes}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddCustody} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>Log New Custody Transfer</div>
                  <div className="form-group">
                    <label className="form-label">New Custodian Name / Designation</label>
                    <input required className="form-input" value={transferData.custodian} onChange={e => setTransferData({...transferData, custodian: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Action Reason</label>
                    <input required className="form-input" value={transferData.action} onChange={e => setTransferData({...transferData, action: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    Record Transfer Entry
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShieldAlert size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                Select an evidence item on the left to inspect or record its tamper-evident Chain of Custody transitions.
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="csoc-card" style={{ width: '500px' }}>
            <div className="csoc-card-header">
              <div className="csoc-card-title">Seize Digital Evidence</div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', color: 'white', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleAddEvidence}>
              <div className="form-group">
                <label className="form-label">Device / Media Name</label>
                <input required className="form-input" value={formData.deviceName} onChange={e => setFormData({...formData, deviceName: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Media Category</label>
                  <select className="form-select" value={formData.deviceType} onChange={e => setFormData({...formData, deviceType: e.target.value})}>
                    <option>Mobile Phone</option>
                    <option>Laptop / PC</option>
                    <option>Hard Disk / SSD</option>
                    <option>Pen Drive / Flash Storage</option>
                    <option>CCTV DVR Footage</option>
                    <option>Server Email Logs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Serial No / IMEI / MAC</label>
                  <input required className="form-input" value={formData.serialNo} onChange={e => setFormData({...formData, serialNo: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Seizing Officer</label>
                <input required className="form-input" value={formData.collectedBy} onChange={e => setFormData({...formData, collectedBy: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Compute Hash & Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
