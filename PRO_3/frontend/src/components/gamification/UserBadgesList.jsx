import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import BadgeDisplay from './BadgeDisplay';
import { Container, Row, Col } from 'react-bootstrap';

const UserBadgesList = ({ 
  className,
  size = 'medium',
  showTooltip = true,
  maxBadges,
  layout = 'grid' // 'grid' or 'list'
}) => {
  const { userBadges, loading } = useGamification();

  if (loading) {
    return <div className="badges-list loading">Loading badges...</div>;
  }

  const displayBadges = maxBadges ? userBadges.slice(0, maxBadges) : userBadges;

  if (layout === 'list') {
    return (
      <Container className={`badges-list ${className || ''}`}>
        <Row>
          {displayBadges.map((badge, index) => (
            <Col key={badge.id} xs={12} className="mb-3">
              <div
                className="d-flex align-items-center"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
                }}
              >
                <BadgeDisplay badge={badge} size={size} showTooltip={showTooltip} />
                <div className="ms-3">
                  <h6 className="mb-0">{badge.name}</h6>
                  <small className="text-muted">{badge.description}</small>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  return (
    <Container className={`badges-grid ${className || ''}`}>
      <div className="d-flex flex-wrap justify-content-center gap-3">
        {displayBadges.map((badge, index) => (
          <div
            key={badge.id}
            style={{
              opacity: 0,
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
            }}
          >
            <BadgeDisplay badge={badge} size={size} showTooltip={showTooltip} />
          </div>
        ))}
      </div>
    </Container>
  );
};

export default UserBadgesList; 