import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch('https://firstprpro-1.onrender.com/leaderboard');
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, []);

  return (
    <>
      <div className="ambient-glow ambient-glow-3" />
      <Navbar isDashboard={true} />

      <div className="page-wrapper" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
             <h2 className="section-title">
              GLOBAL <span className="accent-cyan">LEADERBOARD</span>
            </h2>
            <p className="section-sub" style={{ margin: '0.5rem auto' }}>
              Solve hard issues. Earn high ratings. Climb the ranks.
            </p>
          </div>

          <div className="terminal c-cut" style={{ padding: '0' }}>
            <div className="terminal-bar">
              <span className="t-dot red" />
              <span className="t-dot yellow" />
              <span className="t-dot green" />
              <span className="t-title">firstpr-pro — rank_table.sql</span>
            </div>
            <div className="terminal-body" style={{ overflowX: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,255,136,0.05)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1.2rem', color: 'var(--accent-green)' }}># RANK</th>
                    <th style={{ padding: '1.2rem', color: 'var(--text)' }}>HACKER</th>
                    <th style={{ padding: '1.2rem', color: 'var(--text)' }}>SCORE</th>
                    <th style={{ padding: '1.2rem', color: 'var(--text)' }}>SOLVED</th>
                    <th style={{ padding: '1.2rem', color: 'var(--text)' }}>AVG RATING</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                        Syncing with mainframe...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                        No hackers on the board yet. Be the first!
                      </td>
                    </tr>
                  ) : (
                    users.map((user, idx) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1.2rem', color: idx === 0 ? 'var(--accent-pink)' : 'var(--muted)', fontWeight: 'bold' }}>
                          0{idx + 1}
                        </td>
                        <td style={{ padding: '1.2rem', color: 'var(--accent-cyan)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {user.avatar_url && (
                              <img src={user.avatar_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--accent-green)' }} />
                            )}
                            [{user.name}]
                          </div>
                        </td>
                        <td style={{ padding: '1.2rem', color: 'var(--text)', fontWeight: 'bold' }}>
                          {user.score.toFixed(1)}
                        </td>
                        <td style={{ padding: '1.2rem', color: 'var(--muted)' }}>
                          {user.totalSolved}
                        </td>
                        <td style={{ padding: '1.2rem', color: 'var(--accent-yellow)' }}>
                          {user.avgRating > 0 ? `${user.avgRating.toFixed(1)} ⭐` : '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
