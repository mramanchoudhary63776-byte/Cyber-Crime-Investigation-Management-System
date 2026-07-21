import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Complaints from './components/Complaints';
import PreAssessment from './components/PreAssessment';
import FirManagement from './components/FirManagement';
import EvidenceManagement from './components/EvidenceManagement';
import NoticesManagement from './components/NoticesManagement';
import ForensicsWitnesses from './components/ForensicsWitnesses';
import SopWorkflows from './components/SopWorkflows';
import CaseTimeline from './components/CaseTimeline';
import FinalReport from './components/FinalReport';
import CompletedCases from './components/CompletedCases';
import KnowledgeBase from './components/KnowledgeBase';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('Officer');
  const [selectedComplaintId, setSelectedComplaintId] = useState('CCIS-2026-1001');

  return (
    <div className="csoc-layout">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
      />

      <main className="main-content">
        <div className="content-container">
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              setSelectedComplaintId={setSelectedComplaintId} 
            />
          )}

          {activeTab === 'complaints' && (
            <Complaints 
              setSelectedComplaintId={setSelectedComplaintId} 
              setActiveTab={setActiveTab} 
              activeRole={activeRole}
            />
          )}

          {activeTab === 'assessment' && (
            <PreAssessment 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'fir' && (
            <FirManagement 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceManagement 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
            />
          )}

          {activeTab === 'notices' && (
            <NoticesManagement 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
            />
          )}

          {activeTab === 'forensics' && (
            <ForensicsWitnesses 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
            />
          )}

          {activeTab === 'sop' && (
            <SopWorkflows 
              selectedComplaintId={selectedComplaintId}
              activeRole={activeRole}
            />
          )}

          {activeTab === 'timeline' && (
            <CaseTimeline 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'report' && (
            <FinalReport 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
            />
          )}

          {activeTab === 'completed' && (
            <CompletedCases 
              selectedComplaintId={selectedComplaintId} 
              setSelectedComplaintId={setSelectedComplaintId} 
              setActiveTab={setActiveTab}
              activeRole={activeRole}
            />
          )}

          {activeTab === 'handbook' && (
            <KnowledgeBase />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
