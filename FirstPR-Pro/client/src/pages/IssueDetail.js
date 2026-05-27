import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../AuthContext';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, avatar } = useAuth() || {};
  const [issue, setIssue] = useState(null);
  
  // Submit phase
  const [solution, setSolution] = useState('');
  // Rate phase
  const [rating, setRating] = useState(5);

  const fetchIssue = async () => {
    try {
      const res = await fetch(`https://firstprpro-1.onrender.com/marketplace/issues/${id}`);
      if (res.ok) setIssue(await res.json());
      else navigate('/marketplace');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const handleClaim = async () => {
    if (!user) return alert("Login to claim issues");
    try {
      const res = await fetch(`https://firstprpro-1.onrender.com/marketplace/issues/${id}/claim?username=${encodeURIComponent(user)}&avatar_url=${encodeURIComponent(avatar || '')}`, {
        method: 'POST'
      });
      if (res.ok) fetchIssue();
      else alert(await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch(`https://firstprpro-1.onrender.com/marketplace/issues/${id}/submit?username=${encodeURIComponent(user)}&avatar_url=${encodeURIComponent(avatar || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solution })
      });
      if (res.ok) {
        alert("Solution submitted!");
        fetchIssue();
      } else {
        const errorText = await res.text();
        alert(`Failed to submit solution: ${errorText || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (submissionId) => {
    try {
      const res = await fetch(`https://firstprpro-1.onrender.com/marketplace/issues/${id}/rate?submission_id=${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: parseInt(rating) })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully rated! Solver earned ${data.points_earned} points.`);
        fetchIssue();
      } else alert(await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  if (!issue) return <div style={{ color: 'var(--accent-green)', padding: '5rem', textAlign: 'center' }}>Loading System...</div>;

  const isCreator = user && issue.creator?.name === user;
  const submissions = issue.submissions || [];

  return (
    <>
      <div className="ambient-glow ambient-glow-2" />
      <Navbar isDashboard={true} />

      <div className="page-wrapper" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div className="terminal c-cut" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {issue.creator && issue.creator.avatar_url && (
                  <img src={issue.creator.avatar_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-green)' }} />
                )}
                <div>
                  <h1 style={{ color: 'var(--text)', margin: '0 0 1rem 0' }}>{issue.title}</h1>
                  <div className="issue-labels" style={{ marginBottom: '2rem' }}>
                    <span className="label bug">{issue.status}</span>
                    <span className="label good-first-issue">{issue.difficulty}</span>
                  </div>
                </div>
              </div>
              <a 
                href={issue.repo_link} 
                target="_blank" 
                rel="noreferrer"
                className="btn-neon btn-outline"
              >
                View Repo
              </a>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Description</h3>
              <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{issue.description}</p>
            </div>

            {/* ACTION PANELS */}
            {issue.status === 'open' && (
              <div style={{ textAlign: 'center' }}>
                <button className="btn-neon btn-primary btn-large" onClick={handleClaim}>
                  &gt; Claim Issue
                </button>
              </div>
            )}

            {issue.status === 'in-progress' && !isCreator && (
              <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--accent-cyan)' }}>Submit Solution</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <input
                    type="text"
                    required
                    placeholder="Link to your PR (e.g. https://github.com/user/repo/pull/1)"
                    className="cyber-input"
                    value={solution}
                    onChange={e => setSolution(e.target.value)}
                  />
                  <button type="submit" className="cyber-submit" style={{ alignSelf: 'flex-start' }}>MERGE_REQUEST</button>
                </form>
              </div>
            )}

            {submissions.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Submissions</h3>
                {submissions.map(sub => (
                  <div key={sub.id} style={{ background: 'var(--bg-card)', padding: '1rem', marginTop: '1rem', borderRadius: '4px', borderLeft: '3px solid var(--accent-pink)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      {sub.solver && sub.solver.avatar_url && (
                        <img src={sub.solver.avatar_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--accent-pink)' }} />
                      )}
                      <strong style={{ color: 'var(--accent-pink)' }}>{sub.solver ? sub.solver.name : 'Unknown Hacker'}</strong>
                    </div>
                    <p style={{ margin: '0 0 1rem 0' }}><strong>Link:</strong> <a href={sub.solution} target="_blank" rel="noreferrer" style={{color: 'var(--accent-cyan)'}}>{sub.solution}</a></p>
                    
                    {issue.status === 'in-progress' && isCreator && (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--muted)' }}>Rate & Close:</span>
                        <select className="cyber-input" style={{ width: 'auto' }} value={rating} onChange={e => setRating(e.target.value)}>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                        </select>
                        <button className="cyber-submit" onClick={() => handleRate(sub.id)}>Submit Rating</button>
                      </div>
                    )}
                    
                    {issue.status === 'closed' && (
                      <p style={{ color: 'var(--accent-green)', margin: 0 }}>Rated: {sub.rating} ⭐</p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default IssueDetail;
