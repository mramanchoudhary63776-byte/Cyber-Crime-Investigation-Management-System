import React, { useState } from 'react';
import { 
  ShieldAlert, LayoutDashboard, FileText, CheckSquare, FileSpreadsheet, 
  HardDrive, FileCheck, Search, Users, GitBranch, Award, Layers, Menu, X 
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, activeRole, setActiveRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const roles = [
    { key: 'Officer', label: 'Investigation Officer', class: 'role-officer' },
    { key: 'Forensic', label: 'Forensic Expert', class: 'role-forensic' },
    { key: 'Supervisor', label: 'Supervisor / SHO', class: 'role-supervisor' },
    { key: 'Admin', label: 'System Administrator', class: 'role-admin' }
  ];

  const menuItems = [
    { key: 'dashboard', label: 'CSOC Dashboard', icon: LayoutDashboard },
    { key: 'complaints', label: 'Complaint Register', icon: FileText },
    { key: 'assessment', label: 'Pre-Investigation', icon: CheckSquare },
    { key: 'fir', label: 'FIR Management', icon: FileSpreadsheet },
    { key: 'evidence', label: 'Digital Evidence & Hash', icon: HardDrive },
    { key: 'notices', label: 'Preservation Notices', icon: FileCheck },
    { key: 'forensics', label: 'Forensics & Witnesses', icon: Search },
    { key: 'sop', label: 'SOP Workflows', icon: Layers },
    { key: 'timeline', label: 'Case Timeline', icon: GitBranch },
    { key: 'report', label: 'Final Investigation Report', icon: Award }
  ];

  const handleSelectTab = (key) => {
    setActiveTab(key);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay no-print" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar no-print ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <ShieldAlert size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="brand-title">CCIMS CSOC</div>
            <div className="brand-sub">DIGITIZED SOP v3.0</div>
          </div>
          <button className="mobile-menu-btn" style={{ display: 'block' }} onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="nav-menu">
          <div className="nav-section-label">Investigation Lifecycle</div>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <header className="top-bar no-print">
        <div className="page-header-title">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} style={{ marginRight: '8px' }}>
            <Menu size={22} />
          </button>
          <ShieldAlert className="text-cyan" size={22} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '1rem' }}>Cyber Crime Investigation System</span>
        </div>

        <div className="role-switcher">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            {roles.map(r => (
              <option key={r.key} value={r.key} style={{ background: '#111827', color: 'white' }}>
                {r.label}
              </option>
            ))}
          </select>
          <span className={`role-badge role-${activeRole.toLowerCase()}`}>
            {activeRole}
          </span>
        </div>
      </header>
    </>
  );
}
