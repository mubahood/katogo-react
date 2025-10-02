// src/app/pages/connect/components/UserCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiMapPin, FiUser, FiHeart } from 'react-icons/fi';
import { ConnectUser } from '../../../models/ConnectModels';
import OnlineIndicator from './OnlineIndicator';
import VerifiedBadge from './VerifiedBadge';
import Utils from '../../../utils/Utils';
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

  const avatarUrl = user.avatar ? Utils.getImageUrl(user.avatar) : '/default-avatar.png';
  const displayName = user.name || user.username;
  const location = [user.city, user.state].filter(Boolean).join(', ') || user.country;

  if (variant === 'list') {
    return (
      <div className={`user-card user-card-list ${className}`} onClick={handleCardClick}>
        <div className="user-card-avatar-wrapper">
          <img src={avatarUrl} alt={displayName} className="user-card-avatar" />
          {user.isOnline && (
            <OnlineIndicator isOnline={true} size="medium" className="avatar-online-dot" />
          )}
        </div>

        <div className="user-card-content">
          <div className="user-card-header">
            <h3 className="user-card-name">
              {displayName}
              {user.isVerified && <VerifiedBadge isVerified={true} size={16} />}
            </h3>
            {user.age > 0 && <span className="user-card-age">{user.age}</span>}
          </div>

          <div className="user-card-details">
            {user.occupation && (
              <span className="user-card-occupation">{user.occupation}</span>
            )}
            {location && (
              <span className="user-card-location">
                <FiMapPin size={12} />
                {location}
              </span>
            )}
          </div>

          <div className="user-card-status">
            <span className="status-text">{user.online_status}</span>
          </div>
        </div>

        <div className="user-card-actions">
          <button
            className="action-btn chat-btn"
            onClick={handleChatClick}
            aria-label="Send message"
          >
            <FiMessageCircle size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`user-card user-card-grid ${className}`} onClick={handleCardClick}>
        <div className="user-card-image-container">
          <img src={avatarUrl} alt={displayName} className="user-card-image" />
          <div className="user-card-gradient" />
          
          {user.isOnline && (
            <div className="online-badge-overlay">
              <OnlineIndicator isOnline={true} size="small" />
            </div>
          )}

          <div className="user-card-overlay-content">
            <div className="user-card-name-row">
              <span className="user-name">{displayName}</span>
              {user.isVerified && <VerifiedBadge isVerified={true} size={14} />}
            </div>
            {user.age > 0 && (
              <span className="user-age-badge">{user.age} years</span>
            )}
          </div>
        </div>

        <div className="user-card-info">
          {location && (
            <div className="info-row">
              <FiMapPin size={12} />
              <span>{location}</span>
            </div>
          )}
          {user.occupation && (
            <div className="info-row">
              <FiUser size={12} />
              <span>{user.occupation}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Swipe variant - large card
  return (
    <div className={`user-card user-card-swipe ${className}`}>
      <div className="swipe-card-image-container">
        <img src={avatarUrl} alt={displayName} className="swipe-card-image" />
        <div className="swipe-card-gradient" />

        <div className="swipe-card-content">
          <div className="swipe-card-header">
            <h2 className="swipe-card-name">
              {displayName}
              {user.isVerified && <VerifiedBadge isVerified={true} size={20} />}
            </h2>
            {user.age > 0 && <span className="swipe-card-age">{user.age}</span>}
          </div>

          {user.tagline && (
            <p className="swipe-card-tagline">{user.tagline}</p>
          )}

          <div className="swipe-card-details">
            {location && (
              <div className="detail-item">
                <FiMapPin size={16} />
                <span>{location}</span>
              </div>
            )}
            {user.occupation && (
              <div className="detail-item">
                <FiUser size={16} />
                <span>{user.occupation}</span>
              </div>
            )}
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
