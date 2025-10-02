// src/app/pages/connect/components/OnlineIndicator.tsx

import React from 'react';
import './OnlineIndicator.css';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  size = 'small',
  showText = false,
  className = '',
}) => {
  if (!isOnline && !showText) return null;

  const sizeClass = `online-indicator-${size}`;

  if (showText) {
    return (
      <span className={`online-indicator-badge ${className}`}>
        <span className={`online-dot ${isOnline ? 'online' : 'offline'}`} />
        <span className="online-text">{isOnline ? 'Online Now' : 'Offline'}</span>
      </span>
    );
  }

  return (
    <span
      className={`online-indicator ${sizeClass} ${isOnline ? 'online' : 'offline'} ${className}`}
      aria-label={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default OnlineIndicator;
