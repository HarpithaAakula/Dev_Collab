import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Card } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const UserPointsDisplay = ({ className, showLabel = true }) => {
  const { userPoints, loading } = useGamification();

  if (loading) {
    return <div className="points-display loading">Loading...</div>;
  }

  return (
    <Card className={`points-display ${className || ''}`} style={{ 
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '10px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <FaStar className="points-icon" style={{ color: '#FFD700' }} />
      <div>
        {showLabel && <small style={{ opacity: 0.8 }}>Points</small>}
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          {userPoints.toLocaleString()}
        </div>
      </div>
    </Card>
  );
};

export default UserPointsDisplay; 