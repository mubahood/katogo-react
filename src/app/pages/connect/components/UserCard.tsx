// src/app/pages/connect/components/UserCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiMapPin, FiUser, FiHeart } from 'react-icons/fi';
import { ConnectUser } from '../../../models/ConnectModels';
import OnlineIndicator from './OnlineIndicator';
import VerifiedBadge from './VerifiedBadge';
import UserAvatar from './UserAvatar';
import './UserCard.css';

interface UserCardProps {
  user: ConnectUser;
  variant?: 'list' | 'grid' | 'swipe';
  onChatClick?: (user: ConnectUser) => void;
  onLikeClick?: (user: ConnectUser) => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  variant = 'list',
  onChatClick,
  onLikeClick,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/connect/profile/${user.id}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick?.(user);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeClick?.(user);
  };

  const displayName = user.name || user.username;
  const location = [user.city, user.state].filter(Boolean).join(', ') || user.country;

  if (variant === 'list') {
    return (
      <div className={`user-card user-card-list ${className}`} onClick={handleCardClick}>
        <UserAvatar
          name={displayName}
          avatar={user.avatar}
          size="medium"
          isOnline={user.isOnline}
          className="user-card-avatar-wrapper"
        />

        <div className="user-card-content">
          <div className="user-card-header">
            <h3 className="user-card-name">
              {displayName}
              {user.isVerified && <VerifiedBadge isVerified={true} size={16} />}
            </h3>
            <span className="user-card-age">{user.age && user.age >= 10 ? `${user.age} yrs` : 'N/A'}</span>
          </div>

          <div className="user-card-details">
            <span className="user-card-info-item">
              <FiUser size={12} />
              {user.occupation || 'Not specified'}
            </span>
            <span className="user-card-info-item">
              <FiMapPin size={12} />
              {location || 'Location not set'}
            </span>
          </div>

          {user.tagline && (
            <div className="user-card-tagline">
              {user.tagline}
            </div>
          )}
        </div>

        <div className="user-card-actions">
          <button
            className="action-btn chat-btn"
            onClick={handleChatClick}
            aria-label="Send message"
          >
            <FiMessageCircle size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`user-card user-card-grid ${className}`} onClick={handleCardClick}>
        <div className="user-card-image-container">
          <UserAvatar
            name={displayName}
            avatar={user.avatar}
            size="xlarge"
            isOnline={user.isOnline}
            className="user-card-grid-avatar"
          />
          <div className="user-card-gradient" />

          <div className="user-card-overlay-content">
            <div className="user-card-name-row">
              <span className="user-name">{displayName}</span>
              {user.isVerified && <VerifiedBadge isVerified={true} size={14} />}
            </div>
            <span className="user-age-badge">{user.age && user.age >= 10 ? `${user.age} yrs` : 'N/A'}</span>
          </div>
        </div>

        <div className="user-card-info">
          <div className="info-row">
            <FiMapPin size={12} />
            <span>{location || 'Location not set'}</span>
          </div>
          <div className="info-row">
            <FiUser size={12} />
            <span>{user.occupation || 'Not specified'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Swipe variant - large card
  return (
    <div className={`user-card user-card-swipe ${className}`}>
      <div className="swipe-card-image-container">
        <UserAvatar
          name={displayName}
          avatar={user.avatar}
          size="xlarge"
          isOnline={user.isOnline}
          className="swipe-card-avatar"
        />
        <div className="swipe-card-gradient" />

        <div className="swipe-card-content">
          <div className="swipe-card-header">
            <h2 className="swipe-card-name">
              {displayName}
              {user.isVerified && <VerifiedBadge isVerified={true} size={20} />}
            </h2>
            <span className="swipe-card-age">{user.age && user.age >= 10 ? user.age : 'N/A'}</span>
          </div>

          {user.tagline && (
            <p className="swipe-card-tagline">{user.tagline}</p>
          )}

          <div className="swipe-card-details">
            <div className="detail-item">
              <FiMapPin size={16} />
              <span>{location || 'Location not set'}</span>
            </div>
            <div className="detail-item">
              <FiUser size={16} />
              <span>{user.occupation || 'Not specified'}</span>
            </div>
          </div>

          {user.isOnline && (
            <OnlineIndicator isOnline={true} showText size="medium" />
          )}
        </div>
      </div>

      <div className="swipe-card-actions">
        <button
          className="swipe-action-btn pass-btn"
          onClick={(e) => {
            e.stopPropagation();
            // Pass action will be handled by parent
          }}
          aria-label="Pass"
        >
          ✕
        </button>
        <button
          className="swipe-action-btn info-btn"
          onClick={handleCardClick}
          aria-label="View profile"
        >
          <FiUser size={24} />
        </button>
        <button
          className="swipe-action-btn like-btn"
          onClick={handleLikeClick}
          aria-label="Like"
        >
          <FiHeart size={24} />
        </button>
      </div>
    </div>
  );
};

export default UserCard;
