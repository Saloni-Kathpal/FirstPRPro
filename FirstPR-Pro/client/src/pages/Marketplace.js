import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GithubLoginModal from '../components/GithubLoginModal';
import { useAuth } from '../AuthContext';

const Marketplace = () => {
  const { user, avatar, login } = useAuth() || {};
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [issues, setIssues] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Post form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repo_link: '',
    difficulty: 'Easy'
  });

  const fetchIssues = async () => {
    let url = 'https://firstprpro-1.onrender.com/marketplace/issues?';
    if (difficultyFilter) url += `difficulty=${difficultyFilter}&`;
    if (statusFilter) url += `status=${statusFilter}`;
    
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [difficultyFilter, statusFilter]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login via Navbar first!");
    
    try {
      const res = await fetch('https://firstprpro-1.onrender.com/marketplace/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, creator_name: user, creator_avatar: avatar })
      });
      if (res.ok) {
        alert("Issue posted successfully!");
        setShowForm(false);
        setFormData({ title: '', description: '', repo_link: '', difficulty: 'Easy' });
        fetchIssues();
      } else {
        const errorText = await res.text();
        alert(`Failed to post issue: ${errorText || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {showLoginModal && <GithubLoginModal onClose={() => setShowLoginModal(false)} />}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <Navbar isDashboard={true} />

      <div className="page-wrapper" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 className="section-title" style={{ margin: 0, fontSize: '2rem' }}>
                HACKER <span className="accent-pink">MARKETPLACE</span>
              </h2>
              <p className="section-sub" style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                Claim issues, merge PRs, and earn rep.
              </p>
            </div>
            {user ? (
              <button 
                className="btn-neon btn-primary" 
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : '+ Post Issue'}
              </button>
            ) : (
              <button
                className="btn-neon btn-outline"
                onClick={() => setShowLoginModal(true)}
              >
                {'>'} Login to Post Issues
              </button>
            )}
          </div>

          {showForm && (
            <div className="terminal c-cut" style={{ marginBottom: '3rem', padding: '1px' }}>
              <div className="terminal-bar">
                <span className="t-dot red" />
                <span className="t-dot yellow" />
                <span className="t-dot green" />
                <span className="t-title">post_issue.sh</span>
              </div>
              <div className="terminal-body" style={{ padding: '2rem' }}>
                <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="Issue Title" 
                    className="cyber-input" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                  <textarea 
                    placeholder="Description / Requirements" 
                    className="cyber-input" 
                    style={{ minHeight: '100px' }}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Repository URL (e.g. https://github.com/user/repo)" 
                    className="cyber-input"
                    value={formData.repo_link}
                    onChange={(e) => setFormData({...formData, repo_link: e.target.value})}
                    required
                  />
                  <select 
                    className="cyber-input"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Easy">Easy (1x multiplier)</option>
                    <option value="Medium">Medium (2x multiplier)</option>
                    <option value="Hard">Hard (3x multiplier)</option>
                  </select>
                  
                  <button type="submit" className="cyber-submit" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                    {'>'} SUBMIT_ISSUE
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <select className="cyber-input" style={{ width: 'auto' }} value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}>
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select className="cyber-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="issues-grid">
            {issues.map(issue => (
              <Link 
                to={`/marketplace/${issue.id}`} 
                key={issue.id} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                 <div className="issue-card" style={{ cursor: 'pointer', height: '100%' }}>
                  <div className="issue-labels">
                    <span className="label good-first-issue" style={{
                      background: issue.difficulty === 'Hard' ? 'var(--accent-red)' : 
                                  issue.difficulty === 'Medium' ? 'var(--accent-yellow)' : 'var(--accent-green)',
                      color: '#111'
                    }}>
                      {issue.difficulty}
                    </span>
                    <span className="label bug">
                      {issue.status}
                    </span>
                  </div>
                  <h3 className="issue-title" style={{ marginTop: '1rem' }}>{issue.title}</h3>
                  <div className="repo-info">
                    {issue.creator && issue.creator.avatar_url ? (
                      <img 
                        src={issue.creator.avatar_url} 
                        alt="" 
                        style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--accent-green)', marginRight: '0.5rem' }} 
                      />
                    ) : (
                      <span className="repo-icon">👤</span>
                    )}
                    {issue.creator ? `Posted by ${issue.creator.name}` : `Issue #${issue.id}`}
                  </div>
                </div>
              </Link>
            ))}
            {issues.length === 0 && (
               <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                 <span className="empty-icon">📡</span>
                 <p style={{ color: 'var(--muted)' }}>No issues found matching parameters.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Marketplace;
