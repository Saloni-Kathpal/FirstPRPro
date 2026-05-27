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

const Dashboard = () => {
  const [skills, setSkills]   = useState('');
  const [level, setLevel]     = useState('beginner');
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [searched, setSearched] = useState(false);
  
  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  
  const appRef = useRef(null);
  const suggestionRef = useRef(null);
  
  useClickOutside(suggestionRef, () => setShowSuggestions(false));

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
    
    // Get the part being typed (last skill after comma)
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
    // Focus back on input
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

  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div className="skel-bar skel-w40" style={{ marginBottom: '0.8rem' }} />
      <div className="skel-bar skel-w90" style={{ marginBottom: '0.5rem' }} />
      <div className="skel-bar skel-w60" style={{ marginBottom: '1.2rem' }} />
      <div className="skel-bar skel-w40" />
    </div>
  );

  return (
    <>
      {/* Ambient glows */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <div className="ambient-glow ambient-glow-3" />

      <Navbar isDashboard={true} />

      <div className="page-wrapper" ref={appRef} style={{ paddingTop: '8rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              <div className="section-label-line" />
              <span className="section-label-text">Dashboard</span>
              <div className="section-label-line" />
            </div>
            <h2 className="section-title">
              FIND YOUR{' '}
              <span className="accent-green">FIRST ISSUE</span>
            </h2>
            <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
              Enter your skills below and let the engine do the work.
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
        </div>
      </div>
    </>
  );
};

export default Dashboard;
