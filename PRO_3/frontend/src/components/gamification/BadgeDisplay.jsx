import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const BadgeDisplay = ({ badge, size = 'medium', showTooltip = true }) => {
  const sizeMap = {
    small: { width: '32px', height: '32px' },
    medium: { width: '48px', height: '48px' },
    large: { width: '64px', height: '64px' }
  };

  const badgeContent = (
    <div
      style={{
        width: sizeMap[size].width,
        height: sizeMap[size].height,
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <img
        src={badge.icon}
        alt={badge.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}
      />
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`badge-tooltip-${badge.id}`}>
          <div style={{ textAlign: 'center' }}>
            <strong>{badge.name}</strong>
            <br />
            <small>{badge.description}</small>
          </div>
        </Tooltip>
      }
    >
      {badgeContent}
    </OverlayTrigger>
  );
};

export default BadgeDisplay; 