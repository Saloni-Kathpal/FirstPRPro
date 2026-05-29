import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import IssueCard from '../components/IssueCard';

/* ─── Common Skills Data ─── */
const SKILLS_DATA = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "Ruby",
  "React", "Vue", "Angular", "Svelte", "Next.js", "Express", "FastAPI", "Django", "Flask", "Spring",
  "Node.js", "Docker", "Kubernetes", "AWS", "Firebase", "PostgreSQL", "MongoDB", "Redis", "MySQL",
  "HTML", "CSS", "TailwindCSS", "Sass", "Redux", "GraphQL", "TensorFlow", "PyTorch", "OpenCV",
  "Scikit-learn", "Unity", "Unreal Engine", "Figma", "WebAssembly", "Bash", "Shell"
];

/* ─── Demo data for Repo Scanner ─── */
const DEMO_DATA = {
    health_score: 72,
    issues: [
        "No test coverage found — missing __tests__ directory or test configuration",
        "Inconsistent error handling across API routes",
        "Blocking I/O in main event loop may cause performance bottlenecks",
        "No CI/CD pipeline configured (missing .github/workflows)"
    ],
    code_smells: [
        "Large functions with too many responsibilities (violates Single Responsibility Principle)",
        "Magic strings and hardcoded values spread across multiple modules",
        "Deeply nested callback-style code instead of async/await patterns",
        "Missing JSDoc/docstring comments on exported functions"
    ],
    security_risks: [
        "API keys may be exposed — no .env.example file documenting required secrets",
        "No input sanitization detected on user-facing endpoints",
        "CORS configured with wildcard (*) in production-level code",
        "No rate limiting on authentication endpoints"
    ],
    improvements: [
        "Add TypeScript for improved type safety and developer experience",
        "Implement proper logging with log levels (debug, info, warn, error)",
        "Add a contribution guide (CONTRIBUTING.md) to attract open-source contributors",
        "Consider Redis caching for frequently accessed data"
    ],
    beginner_friendly_issues: [
        {
            title: "Add .env.example file",
            description: "Create a documented .env.example file that lists all required environment variables without exposing actual values. This helps new contributors set up the project.",
            difficulty: "Easy"
        },
        {
            title: "Write unit tests for utility functions",
            description: "The project lacks test coverage. Start by writing unit tests for pure utility/helper functions. Use Jest or the existing test framework.",
            difficulty: "Easy"
        },
        {
            title: "Add JSDoc comments to API routes",
            description: "Document the input parameters, return types, and side effects of each route handler using JSDoc-style comments to improve code readability.",
            difficulty: "Easy"
        }
    ]
};

/* ─── Click Outside Hook ─── */
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

/* ─── CJK safety filter (frontend fallback) ─── */
const containsCJK = (text = '') => {
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i);
    if (
      (cp >= 0x2E80 && cp <= 0x2EFF) ||
      (cp >= 0x3000 && cp <= 0x303F) ||
      (cp >= 0x3040 && cp <= 0x309F) ||
      (cp >= 0x30A0 && cp <= 0x30FF) ||
      (cp >= 0x3400 && cp <= 0x4DBF) ||
      (cp >= 0x4E00 && cp <= 0x9FFF) ||
      (cp >= 0xAC00 && cp <= 0xD7AF) ||
      (cp >= 0xF900 && cp <= 0xFAFF)
    ) return true;
  }
  return false;
};
const isEnglishIssue = (issue) =>
  !containsCJK(issue.title || '') && !containsCJK(issue.repo || '');

/* ════════════════════════════════════════════ */

const FindIssues = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' or 'scanner'

  // Issue Recommendations state
  const [skills, setSkills]   = useState('');
  const [level, setLevel]     = useState('beginner');
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  
  // Repo Scanner state
  const [url, setUrl] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [converting, setConverting] = useState({});
  
  const appRef = useRef(null);
  const suggestionRef = useRef(null);
  
  useClickOutside(suggestionRef, () => setShowSuggestions(false));

  // ═══════════════════════════════════════════
  // RECOMMENDATIONS FUNCTIONS
  // ═══════════════════════════════════════════

  const findIssues = async (overrideSkills, overrideLevel) => {
    const query = overrideSkills || skills;
    const currentLevel = overrideLevel || level;
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`https://firstprpro-1.onrender.com/issues?skills=${encodeURIComponent(query)}&level=${currentLevel}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const englishOnly = Array.isArray(data) ? data.filter(isEnglishIssue) : [];
      setIssues(englishOnly);
    } catch (err) {
      setError(err.message);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSkills(val);
    
    const lastCommaIndex = val.lastIndexOf(',');
    const currentPart = (lastCommaIndex === -1 ? val : val.substring(lastCommaIndex + 1)).trim().toLowerCase();
    
    if (currentPart.length >= 1) {
      const matches = SKILLS_DATA.filter(s => s.toLowerCase().startsWith(currentPart) && !val.toLowerCase().includes(s.toLowerCase()));
      setFilteredSuggestions(matches);
      setShowSuggestions(matches.length > 0);
      setSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (skill) => {
    const lastCommaIndex = skills.lastIndexOf(',');
    const base = lastCommaIndex === -1 ? '' : skills.substring(0, lastCommaIndex + 1).trim() + ' ';
    const newVal = base + skill + ', ';
    setSkills(newVal);
    setShowSuggestions(false);
    appRef.current?.querySelector('input')?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      if (showSuggestions && filteredSuggestions[suggestionIndex]) {
        selectSuggestion(filteredSuggestions[suggestionIndex]);
      } else {
        findIssues();
      }
    } else if (e.key === 'ArrowDown') {
      if (showSuggestions) {
        e.preventDefault();
        setSuggestionIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      if (showSuggestions) {
        e.preventDefault();
        setSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // ═══════════════════════════════════════════
  // REPO SCANNER FUNCTIONS
  // ═══════════════════════════════════════════

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScanLoading(true);
    setScanError(null);
    setScanResults(null);

    try {
      const response = await fetch('https://firstprpro-1.onrender.com/scanner/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to analyze repository');
      }

      const data = await response.json();
      setScanResults(data);
    } catch (err) {
      if (err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota'))) {
        setScanError('QUOTA_EXCEEDED');
      } else {
        setScanError(err.message);
      }
    } finally {
      setScanLoading(false);
    }
  };

  const loadDemo = () => {
    setScanError(null);
    setScanLoading(true);
    setScanResults(null);
    if (!url.trim()) setUrl('https://github.com/example/demo-repo');
    setTimeout(() => {
      setScanLoading(false);
      setScanResults(DEMO_DATA);
    }, 2000);
  };

  const convertToIssue = async (issue, index) => {
    setConverting(prev => ({ ...prev, [index]: true }));
    try {
      const response = await fetch(`https://firstprpro-1.onrender.com/scanner/convert?repo_url=${encodeURIComponent(url || 'https://github.com/example/demo-repo')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue)
      });

      if (response.ok) {
        alert('Issue converted and pushed to Marketplace!');
        setConverting(prev => ({ ...prev, [index]: 'done' }));
      }
    } catch (err) {
      alert('Failed to convert issue');
    } finally {
      if (converting[index] !== 'done') {
        setConverting(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  // ═══════════════════════════════════════════
  // SHARED COMPONENTS
  // ═══════════════════════════════════════════

  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div className="skel-bar skel-w40" style={{ marginBottom: '0.8rem' }} />
      <div className="skel-bar skel-w90" style={{ marginBottom: '0.5rem' }} />
      <div className="skel-bar skel-w60" style={{ marginBottom: '1.2rem' }} />
      <div className="skel-bar skel-w40" />
    </div>
  );

  const Section = ({ title, items, colorClass }) => (
    <div className={`scan-section ${colorClass}`}>
      <h3 className="section-header">{title}</h3>
      {items && items.length > 0 ? (
        <ul className="scan-list">
          {items.map((item, i) => (
            <li key={i} className="scan-item">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="scan-empty">No findings in this category.</p>
      )}
    </div>
  );

  return (
    <>
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <div className="ambient-glow ambient-glow-3" />
      
      <Navbar isDashboard={true} />

      <div className="page-wrapper" ref={appRef} style={{ paddingTop: '8rem' }}>
        <div className="container">
          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            <button
              className="tab-button"
              onClick={() => setActiveTab('recommendations')}
              style={{
                padding: '0.8rem 2rem',
                background: activeTab === 'recommendations' 
                  ? 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,212,255,0.1))'
                  : 'transparent',
                border: activeTab === 'recommendations'
                  ? '1px solid var(--neon-green)'
                  : '1px solid rgba(255,255,255,0.2)',
                color: activeTab === 'recommendations'
                  ? 'var(--neon-green)'
                  : 'var(--muted)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === 'recommendations'
                  ? '0 0 15px rgba(0,255,136,0.2)'
                  : 'none'
              }}
            >
              🔍 Issue Recommendations
            </button>

            <button
              className="tab-button"
              onClick={() => setActiveTab('scanner')}
              style={{
                padding: '0.8rem 2rem',
                background: activeTab === 'scanner' 
                  ? 'linear-gradient(135deg, rgba(255,0,255,0.2), rgba(0,212,255,0.1))'
                  : 'transparent',
                border: activeTab === 'scanner'
                  ? '1px solid var(--neon-pink)'
                  : '1px solid rgba(255,255,255,0.2)',
                color: activeTab === 'scanner'
                  ? 'var(--neon-pink)'
                  : 'var(--muted)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === 'scanner'
                  ? '0 0 15px rgba(255,0,255,0.2)'
                  : 'none'
              }}
            >
              ⚡ AI Repo Scanner
            </button>
          </div>

          {/* RECOMMENDATIONS TAB */}
          {activeTab === 'recommendations' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div className="section-label" style={{ justifyContent: 'center' }}>
                  <div className="section-label-line" />
                  <span className="section-label-text">Smart Matching</span>
                  <div className="section-label-line" />
                </div>
                <h2 className="section-title">
                  FIND YOUR{' '}
                  <span className="accent-green">FIRST ISSUE</span>
                </h2>
                <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
                  Enter your skills and let the engine find the perfect issues for your experience level.
                </p>
              </div>

              <div className="search-terminal">
                <div className="terminal c-cut">
                  <div className="terminal-bar">
                    <span className="t-dot red" />
                    <span className="t-dot yellow" />
                    <span className="t-dot green" />
                    <span className="t-title">firstpr-pro — skill scanner</span>
                  </div>
                  <div className="terminal-body">
                    <div className="search-input-row">
                      <span className="search-prefix">$</span>
                      <div className="search-input-container" ref={suggestionRef}>
                        <input
                          id="skill-input"
                          type="text"
                          className="cyber-input"
                          placeholder="enter skills: python, react, rust, go..."
                          value={skills}
                          onChange={handleInputChange}
                          onKeyDown={handleKey}
                          autoComplete="off"
                          autoFocus
                        />
                        {showSuggestions && (
                          <div className="suggestions-dropdown">
                            {filteredSuggestions.map((s, i) => (
                              <div
                                key={i}
                                className={`suggestion-item ${i === suggestionIndex ? 'active' : ''}`}
                                onClick={() => selectSuggestion(s)}
                              >
                                <span>{s}</span>
                                <span className="suggestion-tag">skill</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        id="scan-btn"
                        className="cyber-submit"
                        onClick={() => findIssues()}
                        disabled={loading || !skills.trim()}
                      >
                        {loading ? 'scanning...' : '> scan'}
                      </button>
                    </div>
                    
                    <div className="level-selector" style={{display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem', justifyContent: 'center'}}>
                        {['beginner', 'intermediate', 'pro'].map(lv => (
                          <button 
                            key={lv} 
                            className={`level-pill ${level === lv ? 'active' : ''}`}
                            onClick={() => {
                              setLevel(lv);
                              if (skills.trim()) {
                                findIssues(null, lv);
                              }
                            }}
                            style={{
                              background: level === lv ? 'rgba(0, 255, 170, 0.1)' : 'transparent',
                              border: `1px solid ${level === lv ? 'var(--accent-green)' : 'var(--muted)'}`,
                              color: level === lv ? 'var(--accent-green)' : 'var(--muted)',
                              padding: '0.4rem 1rem',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              transition: 'all 0.2s ease',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            {lv}
                          </button>
                        ))}
                    </div>

                    {error && (
                      <p style={{ color: '#ff5f56', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        {'>'} Error: {error}
                      </p>
                    )}

                    {!loading && searched && issues.length > 0 && (
                      <p className="results-count">
                        {'>'} found {issues.length} issues matching "{skills}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Results grid */}
              {loading ? (
                <div className="issues-grid" style={{ marginTop: '2rem' }}>
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : issues.length > 0 ? (
                <div className="issues-grid">
                  {issues.map((issue, i) => (
                    <IssueCard key={i} issue={issue} />
                  ))}
                </div>
              ) : searched && !loading && (
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {'>'} No issues matched. Try different skills.
                  </p>
                </div>
              )}
            </>
          )}

          {/* SCANNER TAB */}
          {activeTab === 'scanner' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="section-label" style={{ justifyContent: 'center' }}>
                  <div className="section-label-line" />
                  <span className="section-label-text">Repo Analyzer</span>
                  <div className="section-label-line" />
                </div>
                <h2 className="section-title">AI REPO <span className="accent-pink">SCANNER</span></h2>
                <p className="section-sub" style={{ margin: '0 auto' }}>
                   Extract insights, identify risks, and generate issues directly from any GitHub URL using Gemini AI.
                </p>
              </div>

              <div className="search-terminal" style={{ maxWidth: '800px' }}>
                <div className="terminal c-cut">
                  <div className="terminal-bar">
                    <span className="t-dot red" />
                    <span className="t-dot yellow" />
                    <span className="t-dot green" />
                    <span className="t-title">firstpr-pro — intelligence module</span>
                  </div>
                  <div className="terminal-body" style={{ padding: '2rem' }}>
                    <form onSubmit={handleScan} className="search-input-row">
                      <span className="search-prefix">REPO_URL:</span>
                      <input 
                        type="text" 
                        className="cyber-input"
                        placeholder="https://github.com/owner/repository"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={scanLoading}
                      />
                      <button 
                        type="submit" 
                        className="cyber-submit" 
                        disabled={scanLoading || !url.trim()}
                        style={{ background: 'var(--neon-pink)', boxShadow: '0 0 10px rgba(255,0,255,0.3)' }}
                      >
                        {scanLoading ? 'ANALYZING...' : '> INITIALIZE'}
                      </button>
                    </form>

                    {scanError === 'QUOTA_EXCEEDED' && (
                      <div className="quota-warning">
                        <p>⚠️ <strong>Gemini API quota exceeded.</strong> Your daily limit has been reached.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--muted)' }}>
                          You can try again tomorrow, use a new API key, or load a demo to preview the feature.
                        </p>
                        <button className="btn-demo" onClick={loadDemo}>
                          ▶ Load Demo Analysis
                        </button>
                      </div>
                    )}

                    {scanError && scanError !== 'QUOTA_EXCEEDED' && (
                      <p style={{ color: '#ff5f56', fontSize: '0.85rem', marginTop: '1rem' }}>
                        {'>'} ERROR: {scanError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {!scanResults && !scanLoading && !scanError && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button className="btn-demo-soft" onClick={loadDemo}>
                    ✦ Try Demo Analysis
                  </button>
                </div>
              )}

              {scanLoading && (
                <div className="scan-loader">
                  <div className="loader-ring" />
                  <p>Gemini is parsing the codebase...</p>
                </div>
              )}

              {scanResults && (
                <div className="results-panel fade-in">
                  <div className="health-meter-container">
                    <div className="health-meter">
                      <div 
                        className="health-fill" 
                        style={{ width: `${scanResults.health_score}%` }} 
                      />
                    </div>
                    <div className="health-label">
                      PROJECT HEALTH: <span className="health-value">{scanResults.health_score}%</span>
                    </div>
                  </div>

                  <div className="scan-grid">
                    <Section title="⚠ Critical Issues" items={scanResults.issues} colorClass="critical" />
                    <Section title="🔒 Security Risks" items={scanResults.security_risks} colorClass="security" />
                    <Section title="🧪 Code Smells" items={scanResults.code_smells} colorClass="smells" />
                    <Section title="✦ Improvements" items={scanResults.improvements} colorClass="improvements" />
                  </div>

                  <div className="beginner-issues-section">
                    <h3 className="section-header accent-green">⚡ Suggested Beginner Issues</h3>
                    <div className="beginner-grid">
                      {scanResults.beginner_friendly_issues.map((issue, i) => (
                        <div key={i} className="mini-issue-card">
                          <div className="mini-card-header">
                            <span className="mini-card-title">{issue.title}</span>
                            <span className="diff-pill beginner">{issue.difficulty}</span>
                          </div>
                          <p className="mini-card-desc">{issue.description}</p>
                          <button 
                            className="btn-mini-convert"
                            onClick={() => convertToIssue(issue, i)}
                            disabled={converting[i] === 'done' || converting[i] === true}
                          >
                            {converting[i] === 'done' ? '✓ CONVERTED' : (converting[i] ? 'PUSHING...' : '+ CONVERT TO MARKETPLACE')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FindIssues;
