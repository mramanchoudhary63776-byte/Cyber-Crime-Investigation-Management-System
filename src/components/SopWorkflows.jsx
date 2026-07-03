import React, { useState } from 'react';
import { Layers, CheckCircle2, ShieldAlert, FileText, ArrowRight, BookOpen } from 'lucide-react';
import { SOP_WORKFLOWS_REF } from '../data/investigationService';

export default function SopWorkflows() {
  const [selectedWorkflow, setSelectedWorkflow] = useState('OTP Fraud / Phishing');
  const [completedSteps, setCompletedSteps] = useState([0, 1]);

  const workflows = Object.keys(SOP_WORKFLOWS_REF);

  const toggleStep = (idx) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter(s => s !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
    }
  };

  return (
    <div>
      <div className="csoc-card">
        <div className="csoc-card-header">
          <div className="csoc-card-title">
            <Layers style={{ color: 'var(--primary)' }} />
            Standard Operating Procedures (SOP) Interactive Workflows
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Select a specific cybercrime classification to view step-by-step mandatory investigation protocols from the Cyber Crime Investigation Manual.
        </p>

        <div className="sop-layout-grid">
          {/* Workflow selector sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Crime Categories</div>
            {workflows.map(wf => (
              <button 
                key={wf}
                className={`btn ${selectedWorkflow === wf ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'space-between', padding: '12px 16px', textAlign: 'left' }}
                onClick={() => {
                  setSelectedWorkflow(wf);
                  setCompletedSteps([0]);
                }}
              >
                <span>{wf}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>

          {/* Workflow Checklist Execution */}
          <div className="csoc-card" style={{ background: '#0a0f1d', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} />
                {selectedWorkflow} SOP Checklist
              </div>
              <span className="status-badge info">
                {completedSteps.length} / {SOP_WORKFLOWS_REF[selectedWorkflow].length} Steps Done
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SOP_WORKFLOWS_REF[selectedWorkflow].map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                return (
                  <div 
                    key={idx}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: isDone ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                      border: isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleStep(idx)}
                  >
                    <div style={{ marginTop: '2px' }}>
                      <input type="checkbox" checked={isDone} onChange={() => {}} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isDone ? '#10b981' : 'var(--text-main)' }}>
                        Step {idx + 1}: {step}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {isDone ? '✓ Protocol step verified and recorded in case log.' : 'Pending officer verification and compliance execution.'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
