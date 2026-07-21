import React, { useState } from 'react';
import { 
  BookOpen, Search, Shield, HelpCircle, FileText, 
  Copy, Check, Scale, Bookmark, MessageSquare, AlertCircle 
} from 'lucide-react';
import handbookData from '../data/cybercrime_handbook_knowledge_base.json';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('chapters'); // chapters, legal, crimes, cases
  const [chapterSearch, setChapterSearch] = useState('');
  const [legalSearch, setLegalSearch] = useState('');
  const [crimeSearch, setCrimeSearch] = useState('');
  
  const [selectedChapter, setSelectedChapter] = useState(handbookData.chapters[0]);
  const [copiedId, setCopiedId] = useState(null);

  const triggerCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter legal sections from Chapter 9
  const legalChapter = handbookData.chapters.find(c => c.chapter_no === 9);
  const filteredLegalSections = legalChapter?.it_act_sections.filter(sec => 
    sec.section.toLowerCase().includes(legalSearch.toLowerCase()) ||
    sec.summary.toLowerCase().includes(legalSearch.toLowerCase())
  ) || [];

  // Filter CrPC / Evidence Act provisions from Chapter 9
  const filteredCrpcSections = legalChapter?.crpc_provisions.filter(sec =>
    sec.section.toLowerCase().includes(legalSearch.toLowerCase()) ||
    sec.summary.toLowerCase().includes(legalSearch.toLowerCase())
  ) || [];

  const filteredEvidenceSections = legalChapter?.evidence_act_provisions.filter(sec =>
    sec.section.toLowerCase().includes(legalSearch.toLowerCase()) ||
    sec.summary.toLowerCase().includes(legalSearch.toLowerCase())
  ) || [];

  // Gather all crimes from Chapter 1 and Chapter 6
  const ch1Crimes = handbookData.chapters.find(c => c.chapter_no === 1)?.crime_types_catalog || [];
  const ch6Crimes = handbookData.chapters.find(c => c.chapter_no === 6)?.investigation_steps_by_type || [];

  // Combine crime list
  const combinedCrimes = ch1Crimes.map(c => {
    const ch6Match = ch6Crimes.find(x => x.fraud_type.toLowerCase() === c.name.toLowerCase() || x.fraud_type.toLowerCase().includes(c.name.toLowerCase()));
    return {
      name: c.name,
      definition: c.definition,
      steps: ch6Match ? ch6Match.steps : []
    };
  });

  // Append crimes that only exist in Chapter 6
  ch6Crimes.forEach(c => {
    if (!combinedCrimes.some(x => x.name.toLowerCase().includes(c.fraud_type.toLowerCase()) || c.fraud_type.toLowerCase().includes(x.name.toLowerCase()))) {
      combinedCrimes.push({
        name: c.fraud_type,
        definition: c.definition || 'Financial fraud involving digital transactions and assets.',
        steps: c.steps
      });
    }
  });

  const filteredCrimes = combinedCrimes.filter(c => 
    c.name.toLowerCase().includes(crimeSearch.toLowerCase()) ||
    c.definition.toLowerCase().includes(crimeSearch.toLowerCase())
  );

  return (
    <div className="knowledge-base-view">
      <div className="csoc-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={24} style={{ color: 'var(--primary)' }} />
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>MHA Cybercrime Investigation Reference Desk</h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Source: {handbookData.source_document.title} | {handbookData.source_document.issuing_authority}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: '#0a0f1d', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${activeTab === 'chapters' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setActiveTab('chapters')}
            >
              <Bookmark size={14} /> Chapters
            </button>
            <button 
              className={`btn ${activeTab === 'legal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setActiveTab('legal')}
            >
              <Scale size={14} /> Legal Provisions
            </button>
            <button 
              className={`btn ${activeTab === 'crimes' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setActiveTab('crimes')}
            >
              <Shield size={14} /> Crime & SOP Traces
            </button>
            <button 
              className={`btn ${activeTab === 'cases' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setActiveTab('cases')}
            >
              <MessageSquare size={14} /> Case Studies
            </button>
          </div>
        </div>
      </div>

      {/* Chapters Navigation & Viewer */}
      {activeTab === 'chapters' && (
        <div className="grid-3" style={{ gridTemplateColumns: '280px 1fr 1fr', gap: '20px' }}>
          {/* Chapter Sidebar */}
          <div className="csoc-card" style={{ padding: '16px', margin: 0, maxHeight: '600px', overflowY: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Handbook Chapters</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {handbookData.chapters.map(ch => (
                <div 
                  key={ch.chapter_no}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedChapter.chapter_no === ch.chapter_no ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.01)',
                    border: selectedChapter.chapter_no === ch.chapter_no ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedChapter(ch)}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chapter {ch.chapter_no}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chapter Reader Container */}
          <div className="csoc-card" style={{ gridColumn: 'span 2', margin: 0, maxHeight: '600px', overflowY: 'auto' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Chapter {selectedChapter.chapter_no}</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>{selectedChapter.title}</h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '6px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Overview & Summary</div>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-dim)' }}>{selectedChapter.summary}</p>
            </div>

            {/* Render Key Concepts / Terms */}
            {selectedChapter.key_concepts && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '10px', color: 'var(--primary)' }}>Key Technical Concepts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedChapter.key_concepts.map((concept, index) => (
                    <div key={index} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'white' }}>{concept.term}</span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px', fontSize: '0.7rem' }}
                          onClick={() => triggerCopy(`${concept.term}: ${concept.definition}`, `concept-${index}`)}
                        >
                          {copiedId === `concept-${index}` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>{concept.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render Chapter specific checklists/steps */}
            {selectedChapter.cdr_analysis_steps && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '10px', color: 'var(--primary)' }}>SOP CDR Analysis Steps</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedChapter.cdr_analysis_steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                      <span style={{ background: 'var(--primary)', color: 'black', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <div style={{ color: 'var(--text-dim)', paddingTop: '2px' }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedChapter.scene_of_crime_steps_summary && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '10px', color: 'var(--primary)' }}>13-Step Crime Scene Seizure Protocol</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                  {selectedChapter.scene_of_crime_steps_summary.map((step, idx) => (
                    <div key={idx} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Reference Tab */}
      {activeTab === 'legal' && (
        <div>
          <div className="csoc-card" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ margin: 0, border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }} 
              placeholder="Search IT Act Sections, CrPC provisions, or Evidence Act admissibility (e.g. 66D, 91, 65B)..."
              value={legalSearch}
              onChange={e => setLegalSearch(e.target.value)}
            />
          </div>

          <div className="grid-2">
            {/* IT Act Column */}
            <div className="csoc-card" style={{ margin: 0, maxHeight: '600px', overflowY: 'auto' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={18} />
                Information Technology (IT) Act, 2000 / 2008
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredLegalSections.map((sec, idx) => (
                  <div key={idx} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>{sec.section}</span>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => triggerCopy(`${sec.section}: ${sec.summary}`, `sec-${idx}`)}
                      >
                        {copiedId === `sec-${idx}` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        Copy Section
                      </button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px', lineHeight: '1.4' }}>{sec.summary}</div>
                  </div>
                ))}
                {filteredLegalSections.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matching IT Act sections found.</div>
                )}
              </div>
            </div>

            {/* CrPC & Evidence Act Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* CrPC Card */}
              <div className="csoc-card" style={{ flex: 1, margin: 0, maxHeight: '290px', overflowY: 'auto' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} />
                  Code of Criminal Procedure (CrPC)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredCrpcSections.map((sec, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--secondary)' }}>{sec.section}</span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 6px', fontSize: '0.7rem' }}
                          onClick={() => triggerCopy(`${sec.section}: ${sec.summary}`, `crpc-${idx}`)}
                        >
                          {copiedId === `crpc-${idx}` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>{sec.summary}</div>
                    </div>
                  ))}
                  {filteredCrpcSections.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No matching CrPC provisions found.</div>
                  )}
                </div>
              </div>

              {/* Evidence Act Card */}
              <div className="csoc-card" style={{ flex: 1, margin: 0, maxHeight: '290px', overflowY: 'auto' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--info)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} />
                  Indian Evidence Act (Electronic Admissibility)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredEvidenceSections.map((sec, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--info)' }}>{sec.section}</span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 6px', fontSize: '0.7rem' }}
                          onClick={() => triggerCopy(`${sec.section}: ${sec.summary}`, `evd-${idx}`)}
                        >
                          {copiedId === `evd-${idx}` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>{sec.summary}</div>
                    </div>
                  ))}
                  {filteredEvidenceSections.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No matching Evidence Act provisions found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crime & SOP Traces Tab */}
      {activeTab === 'crimes' && (
        <div>
          <div className="csoc-card" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ margin: 0, border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }} 
              placeholder="Search crime types, categories, or MHA recommended steps (e.g. ATM, Job, Spoofing, Phishing)..."
              value={crimeSearch}
              onChange={e => setCrimeSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
            {filteredCrimes.map((crime, idx) => (
              <div key={idx} className="csoc-card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="status-badge info" style={{ textTransform: 'uppercase', padding: '4px 8px', fontSize: '0.72rem' }}>MHA Crime Reference</span>
                    <h3 style={{ margin: '6px 0 0 0', fontSize: '1.05rem', fontWeight: 800 }}>{crime.name}</h3>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => triggerCopy(`${crime.name}\nDefinition: ${crime.definition}\nInvestigation Steps:\n${crime.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`, `crime-copy-${idx}`)}
                  >
                    {copiedId === `crime-copy-${idx}` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    Copy SOP Profile
                  </button>
                </div>
                
                <div style={{ margin: '10px 0', fontSize: '0.85rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '6px', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Definition: </span>{crime.definition}
                </div>

                {crime.steps && crime.steps.length > 0 ? (
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', tracking: '0.5px' }}>Official MHA Recommended Investigation Steps</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {crime.steps.map((step, sIdx) => (
                        <div key={sIdx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                          <div>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Follow general Cyber Cell bank KYC verification and Section 91 CrPC ISP access logs tracing.
                  </div>
                )}
              </div>
            ))}
            {filteredCrimes.length === 0 && (
              <div className="csoc-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No matching crime definitions or SOP procedures found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Studies Tab */}
      {activeTab === 'cases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {handbookData.chapters.find(c => c.chapter_no === 10)?.case_studies.map((item, index) => (
            <div key={index} className="csoc-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bookmark size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{item.case}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {item.laws_applied.map((law, lIdx) => (
                    <span key={lIdx} className="status-badge approved" style={{ fontSize: '0.7rem', padding: '3px 6px', fontFamily: 'var(--font-mono)' }}>{law}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Brief & Modus Operandi</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: '1.4' }}>{item.brief}</div>
                </div>

                <div style={{ background: 'rgba(6,182,212,0.03)', borderLeft: '3px solid var(--primary)', padding: '12px', borderRadius: '0 6px 6px 0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>Investigation Highlights & Evidence Traced</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>{item.investigation_highlights}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
