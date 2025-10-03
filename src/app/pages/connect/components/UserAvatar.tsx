// src/app/pages/connect/components/UserAvatar.tsx

import React, { useState } from 'react';
import { getImageUrl } from '../../../utils/imageUtils';
import './UserAvatar.css';

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  isOnline?: boolean;
  className?: string;
}

/**
 * Generate a vibrant color based on the user's name
 * Uses a hash function to ensure consistent colors for the same name
 */
const getColorFromName = (name: string): string => {
  const colors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' }, // Purple
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#ffffff' }, // Pink
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#ffffff' }, // Blue
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#ffffff' }, // Green
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#ffffff' }, // Orange
    { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', text: '#ffffff' }, // Teal
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#333333' }, // Pastel
    { bg: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', text: '#ffffff' }, // Coral
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', text: '#333333' }, // Peach
    { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', text: '#ffffff' }, // Lavender
    { bg: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', text: '#333333' }, // Light Pink
    { bg: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', text: '#333333' }, // Yellow
    { bg: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', text: '#ffffff' }, // Indigo
    { bg: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)', text: '#ffffff' }, // Rose
    { bg: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', text: '#ffffff' }, // Cyan
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index].bg;
};

const getTextColor = (name: string): string => {
  const lightGradients = ['linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                          'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                          'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
                          'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)'];
  const gradient = getColorFromName(name);
  return lightGradients.includes(gradient) ? '#333333' : '#ffffff';
};

/**
 * Get initials from name (max 2 characters)
 */
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  size = 'medium',
  isOnline = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const hasValidAvatar = avatar && !imageError;
  const avatarUrl = avatar ? getImageUrl(avatar) : null;
  const initials = getInitials(name);
  const gradientBg = getColorFromName(name);
  const textColor = getTextColor(name);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`user-avatar user-avatar-${size} ${className}`}>
      <div className="user-avatar-wrapper">
        {hasValidAvatar && avatarUrl ? (
          <>
            <img
              src={avatarUrl}
              alt={name}
              className={`user-avatar-image ${imageLoading ? 'loading' : 'loaded'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {imageLoading && (
              <div 
                className="user-avatar-placeholder"
                style={{ background: gradientBg }}
              >
                <span style={{ color: textColor }}>{initials}</span>
              </div>
            )}
          </>
        ) : (
          <div 
            className="user-avatar-placeholder"
            style={{ background: gradientBg }}
          >
            <span style={{ color: textColor }}>{initials}</span>
          </div>
        )}
        
        {isOnline && (
          <div className="user-avatar-online-dot">
            <div className="online-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAvatar;
