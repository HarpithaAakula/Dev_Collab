import React, { useState, useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';
import '../GamificationDashboard.css';

const GamificationDashboard = () => {
  const {
    userPoints,
    userBadges,
    userRank,
    userLevel,
    levelProgress,
    loading,
    error,
    notifications,
    getLeaderboard,
    getAllBadges,
    getNextBadgeProgress,
    removeNotification
  } = useGamification();

  const [leaderboard, setLeaderboard] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardData, badgesData] = await Promise.all([
          getLeaderboard(1, 10),
          getAllBadges()
        ]);
        
        if (leaderboardData) {
          setLeaderboard(leaderboardData.leaderboard || []);
        }
        
        if (badgesData) {
          setAllBadges(badgesData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [getLeaderboard, getAllBadges]);

  const nextBadgeProgress = getNextBadgeProgress();

  if (loading) {
    return (
      <div className="gamification-dashboard">
        <div className="loading-spinner">Loading your progress...</div>
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
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((notification) => (
            <div key={notification.id} className={`notification notification-${notification.type}`}>
              <div className="notification-content">
                <span className="notification-message">{notification.message}</span>
                {notification.badges && (
                  <div className="notification-badges">
                    {notification.badges.map((badge) => (
                      <span key={badge.id} className="notification-badge">
                        {badge.icon} {badge.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button 
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <h1>Your Gaming Progress</h1>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-value">{userPoints}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">#{userRank || '--'}</span>
            <span className="stat-label">Rank</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userLevel}</span>
            <span className="stat-label">Level</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userBadges.length}</span>
            <span className="stat-label">Badges</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
        <button 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Level Progress */}
            <div className="progress-section">
              <h3>Level Progress</h3>
              <div className="level-card">
                <div className="level-info">
                  <span className="current-level">Level {userLevel}</span>
                  <span className="level-points">
                    {levelProgress.progressPoints} / {levelProgress.requiredPoints} XP
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${levelProgress.percentage}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">{levelProgress.percentage}%</span>
              </div>
            </div>

            {/* Recent Badges */}
            <div className="recent-badges-section">
              <h3>Recent Badges</h3>
              <div className="badges-grid">
                {userBadges.slice(-6).map((badge) => (
                  <div key={badge.id} className="badge-card earned">
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-info">
                      <h4>{badge.name}</h4>
                      <p>{badge.description}</p>
                    </div>
                  </div>
                ))}
                {userBadges.length === 0 && (
                  <div className="no-badges">
                    <p>No badges earned yet. Start collaborating to earn your first badge!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Badge Progress */}
            {nextBadgeProgress && (
              <div className="next-badge-section">
                <h3>Next Badge</h3>
                <div className="next-badge-card">
                  <div className="badge-progress">
                    <span>🏆 {nextBadgeProgress.pointsNeeded} points to next milestone</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${nextBadgeProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="badges-tab">
            <h3>Badge Collection</h3>
            <div className="badges-grid">
              {allBadges.map((badge) => {
                const isEarned = userBadges.some(userBadge => userBadge.id === badge.id);
                return (
                  <div key={badge.id} className={`badge-card ${isEarned ? 'earned' : 'locked'}`}>
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-info">
                      <h4>{badge.name}</h4>
                      <p>{badge.description}</p>
                      <div className="badge-requirement">
                        Requirement: {badge.requirement.type.replace('_', ' ').toLowerCase()} ({badge.requirement.count})
                      </div>
                    </div>
                    {isEarned && <div className="earned-indicator">✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-tab">
            <h3>Top Collaborators</h3>
            <div className="leaderboard-list">
              {leaderboard.map((user, index) => (
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
        )}
      </div>
    </div>
  );
};

export default GamificationDashboard;