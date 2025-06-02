import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          'http://localhost:5000/api/gamification/leaderboard?page=1&limit=10'
        );
        setLeaderboardData(data.leaderboard || []);
      } catch (err) {
        setError('Failed to fetch leaderboard data');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="gamification-dashboard">
        <div className="loading-spinner">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamification-dashboard">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="gamification-dashboard">
      <div className="dashboard-header">
        <h1>Leaderboard</h1>
      </div>
      <div className="dashboard-content">
        <div className="leaderboard-tab">
          <h3>Top Collaborators</h3>
          <div className="leaderboard-list">
            {leaderboardData.map((user, index) => (
              <div key={user.userId} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${user.rank}`}
                </div>
                <div className="user-info">
                  <span className="username">{user.name}</span>
                  <span className="user-stats">{user.badges} badges</span>
                </div>
                <div className="points">{user.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 