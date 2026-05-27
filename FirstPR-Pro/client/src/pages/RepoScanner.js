import React, { useState } from 'react';
import Navbar from '../components/Navbar';

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

const RepoScanner = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [converting, setConverting] = useState({});

    const handleScan = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError(null);
        setResults(null);

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
            setResults(data);
        } catch (err) {
            if (err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota'))) {
                setError('QUOTA_EXCEEDED');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadDemo = () => {
        setError(null);
        setLoading(true);
        setResults(null);
        if (!url.trim()) setUrl('https://github.com/example/demo-repo');
        setTimeout(() => {
            setLoading(false);
            setResults(DEMO_DATA);
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
            
            <Navbar isDashboard={false} />

            <div className="page-wrapper" style={{ paddingTop: '8rem' }}>
                <div className="container">
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
                                        disabled={loading}
                                    />
                                    <button 
                                        type="submit" 
                                        className="cyber-submit" 
                                        disabled={loading || !url.trim()}
                                        style={{ background: 'var(--neon-pink)', boxShadow: '0 0 10px rgba(255,0,255,0.3)' }}
                                    >
                                        {loading ? 'ANALYZING...' : '> INITIALIZE'}
                                    </button>
                                </form>

                                {error === 'QUOTA_EXCEEDED' && (
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

                                {error && error !== 'QUOTA_EXCEEDED' && (
                                    <p style={{ color: '#ff5f56', fontSize: '0.85rem', marginTop: '1rem' }}>
                                        {'>'} ERROR: {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {!results && !loading && !error && (
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button className="btn-demo-soft" onClick={loadDemo}>
                                ✦ Try Demo Analysis
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="scan-loader">
                            <div className="loader-ring" />
                            <p>Gemini is parsing the codebase...</p>
                        </div>
                    )}

                    {results && (
                        <div className="results-panel fade-in">
                            <div className="health-meter-container">
                                <div className="health-meter">
                                    <div 
                                        className="health-fill" 
                                        style={{ width: `${results.health_score}%` }} 
                                    />
                                </div>
                                <div className="health-label">
                                    PROJECT HEALTH: <span className="health-value">{results.health_score}%</span>
                                </div>
                            </div>

                            <div className="scan-grid">
                                <Section title="⚠ Critical Issues" items={results.issues} colorClass="critical" />
                                <Section title="🔒 Security Risks" items={results.security_risks} colorClass="security" />
                                <Section title="🧪 Code Smells" items={results.code_smells} colorClass="smells" />
                                <Section title="✦ Improvements" items={results.improvements} colorClass="improvements" />
                            </div>

                            <div className="beginner-issues-section">
                                <h3 className="section-header accent-green">⚡ Suggested Beginner Issues</h3>
                                <div className="beginner-grid">
                                    {results.beginner_friendly_issues.map((issue, i) => (
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
                </div>
            </div>
        </>
    );
};

export default RepoScanner;
