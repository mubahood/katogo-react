// src/app/pages/connect/ConnectProfile.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMessageCircle,
  FiFlag,
  FiSlash,
  FiMapPin,
  FiUser,
  FiBook,
  FiHeart,
  FiBriefcase,
  FiHome,
} from 'react-icons/fi';
import { ConnectUser, getGenderIcon } from '../../models/ConnectModels';
import ConnectApiService from '../../services/ConnectApiService';
import OnlineIndicator from './components/OnlineIndicator';
import VerifiedBadge from './components/VerifiedBadge';
import Utils from '../../utils/Utils';
import './ConnectProfile.css';

const ConnectProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ConnectUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile(parseInt(userId));
    }
  }, [userId]);

  const loadProfile = async (id: number) => {
    try {
      setLoading(true);
      const userData = await ConnectApiService.getUserProfile(id);
      setUser(userData);
    } catch (error) {
      Utils.toast('Failed to load profile', 'error');
      navigate('/connect');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) return;
    try {
      const { chatId } = await ConnectApiService.startChat({ receiverId: user.id });
      Utils.toast('Opening chat...', 'success');
      navigate(`/account/chats?chat=${chatId}`);
    } catch (error) {
      Utils.toast('Failed to start chat', 'error');
    }
  };

  const handleReport = () => {
    Utils.toast('Report feature coming soon', 'info');
  };

  const handleBlock = async () => {
    if (!user) return;
    if (confirm(`Block ${user.name}? They won't be able to contact you.`)) {
      try {
        await ConnectApiService.blockUser({ blockedUserId: user.id });
        Utils.toast(`${user.name} has been blocked`, 'success');
        navigate('/connect');
      } catch (error) {
        Utils.toast('Failed to block user', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="connect-profile loading">
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="connect-profile error">
        <p>User not found</p>
        <button onClick={() => navigate('/connect')}>Back to Connect</button>
      </div>
    );
  }

  const avatarUrl = user.avatar ? Utils.getImageUrl(user.avatar) : '/default-avatar.png';
  const location = [user.city, user.state, user.country].filter(Boolean).join(', ');

  return (
    <div className="connect-profile">
      {/* Hero Section */}
      <div className="profile-hero">
        <button className="back-btn" onClick={() => navigate('/connect')}>
          <FiArrowLeft size={24} />
        </button>

        <div className="hero-image">
          <img src={avatarUrl} alt={user.name} />
          <div className="hero-gradient" />
        </div>

        <div className="hero-content">
          <h1 className="profile-name">
            {user.name}
            {user.isVerified && <VerifiedBadge isVerified size={24} />}
          </h1>
          {user.tagline && <p className="profile-tagline">{user.tagline}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="profile-content">
        {/* Info Badges */}
        <div className="info-badges">
          {user.age > 0 && (
            <div className="info-badge">
              <span className="badge-icon">🎂</span>
              <span>{user.age} Years</span>
            </div>
          )}
          {location && (
            <div className="info-badge">
              <FiMapPin />
              <span>{location}</span>
            </div>
          )}
          {user.sex && (
            <div className="info-badge">
              <span className="badge-icon">{getGenderIcon(user.sex)}</span>
              <span>{user.sex}</span>
            </div>
          )}
          {user.isOnline && (
            <div className="info-badge online">
              <OnlineIndicator isOnline showText size="small" />
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <section className="profile-section">
            <h3 className="section-title">About Me</h3>
            <div className="bio-card">
              <p>{user.bio}</p>
            </div>
          </section>
        )}

        {/* Details Grid */}
        <section className="profile-section">
          <h3 className="section-title">Details</h3>
          <div className="details-grid">
            {user.occupation && (
              <DetailItem icon={<FiBriefcase />} label="Occupation" value={user.occupation} />
            )}
            {user.education_level && (
              <DetailItem icon={<FiBook />} label="Education" value={user.education_level} />
            )}
            {user.height_cm && (
              <DetailItem icon={<FiUser />} label="Height" value={`${user.height_cm} cm`} />
            )}
            {user.body_type && (
              <DetailItem icon={<FiUser />} label="Body Type" value={user.body_type} />
            )}
            {user.looking_for && (
              <DetailItem icon={<FiHeart />} label="Looking For" value={user.looking_for} />
            )}
            {user.interested_in && (
              <DetailItem icon={<FiUser />} label="Interested In" value={user.interested_in} />
            )}
          </div>
        </section>

        {/* Preferences */}
        <section className="profile-section">
          <h3 className="section-title">Lifestyle & Preferences</h3>
          <div className="preferences-grid">
            {user.smoking_habit && (
              <PreferenceItem emoji="🚭" label="Smoking" value={user.smoking_habit} />
            )}
            {user.drinking_habit && (
              <PreferenceItem emoji="🍷" label="Drinking" value={user.drinking_habit} />
            )}
            {user.pet_preference && (
              <PreferenceItem emoji="🐾" label="Pets" value={user.pet_preference} />
            )}
            {user.religion && (
              <PreferenceItem emoji="🙏" label="Religion" value={user.religion} />
            )}
            {user.political_views && (
              <PreferenceItem emoji="🗳️" label="Politics" value={user.political_views} />
            )}
            {user.languages_spoken && (
              <PreferenceItem emoji="💬" label="Languages" value={user.languages_spoken} />
            )}
          </div>
        </section>

        {/* Spacer for floating buttons */}
        <div style={{ height: '100px' }} />
      </div>

      {/* Action Buttons */}
      <div className="profile-actions">
        <button className="action-btn secondary" onClick={handleReport} title="Report">
          <FiFlag size={20} />
        </button>
        <button className="action-btn secondary" onClick={handleBlock} title="Block">
          <FiSlash size={20} />
        </button>
        <button className="action-btn primary" onClick={handleStartChat}>
          <FiMessageCircle size={20} />
          <span>Send Message</span>
        </button>
      </div>
    </div>
  );
};

// Detail Item Component
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="detail-item">
    <div className="detail-icon">{icon}</div>
    <div className="detail-content">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  </div>
);

// Preference Item Component
interface PreferenceItemProps {
  emoji: string;
  label: string;
  value: string;
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({ emoji, label, value }) => (
  <div className="preference-item">
    <div className="preference-header">
      <span className="preference-emoji">{emoji}</span>
      <span className="preference-label">{label}</span>
    </div>
    <span className="preference-value">{value}</span>
  </div>
);

export default ConnectProfile;
