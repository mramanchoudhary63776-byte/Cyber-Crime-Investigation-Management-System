import React, { useState } from 'react';
import { 
  ShieldAlert, LayoutDashboard, FileText, CheckSquare, FileSpreadsheet, 
  HardDrive, FileCheck, Search, Users, GitBranch, Award, Layers, Menu, X, Archive, BookOpen
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, activeRole, setActiveRole }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { key: 'report', label: 'Final Investigation Report', icon: Award },
    { key: 'completed', label: 'Completed Cases', icon: Archive },
    { key: 'handbook', label: 'Reference Handbook', icon: BookOpen }
  ];

  const handleSelectTab = (key) => {
    setActiveTab(key);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-container no-print">
      {/* Top Banner Row: Brand and Role Switcher */}
      <div className="navbar-top-row">
        <div className="navbar-brand">
          <div className="brand-icon">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="brand-title">CCIMS CSOC</div>
            <div className="brand-sub">DIGITIZED SOP v3.0</div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button className="mobile-navbar-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Role Switcher */}
        <div className="navbar-role-section">
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
        </div>
      </div>

      {/* Bottom Tabs Row: Centered Navigation */}
      <nav className={`navbar-tabs-row ${mobileMenuOpen ? 'mobile-show' : ''}`}>
        <div className="navbar-tabs-list">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`navbar-tab-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.key)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
