// src/app/pages/connect/ConnectProfile.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMessageCircle,
  FiHeart,
  FiMapPin,
  FiMail,
  FiBriefcase,
  FiHome,
  FiBook,
  FiGlobe,
  FiX,
  FiCheck,
  FiUser,
} from 'react-icons/fi';
import DynamicBreadcrumb from '../../components/shared/DynamicBreadcrumb';
import { ConnectUser, getGenderIcon } from '../../models/ConnectModels';
import ConnectApiService from '../../services/ConnectApiService';
import AccountApiService from '../../services/AccountApiService';
import UserAvatar from './components/UserAvatar';
import ToastService from '../../services/ToastService';
import './ConnectProfile.css';

const ConnectProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ConnectUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile(parseInt(userId));
    }
  }, [userId]);

  const loadProfile = async (id: number) => {
    try {
      setLoading(true);
      console.log('📥 Loading profile for user ID:', id);
      const userData = await ConnectApiService.getUserProfile(id);
      console.log('✅ Profile loaded successfully:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('❌ Failed to load profile:', error);
      ToastService.error(error.message || 'Failed to load profile');
      navigate('/connect');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!user) return;

    const token = localStorage.getItem('ugflix_auth_token');
    const userStr = localStorage.getItem('ugflix_user');

    if (!token || !userStr) {
      ToastService.warning('Please login to start chat');
      navigate('/auth/login');
      return;
    }

    const currentUser = JSON.parse(userStr);
    if (currentUser.id === user.id) {
      ToastService.warning("You can't message yourself");
      return;
    }

    setShowChatModal(true);
  };

  const sendChatMessage = async (message: string) => {
    if (!user || isSending) return;

    try {
      setIsSending(true);
      console.log('🔄 Starting conversation with user:', user.id, 'Message:', message);
      
      // Start conversation using AccountApiService
      const conversation = await AccountApiService.startConversation(user.id, message);
      
      console.log('✅ Conversation started successfully:', conversation);
      
      // Only navigate after successful conversation creation
      if (conversation && conversation.id) {
        // Pass the initial message via URL params (like product contact flow)
        let chatUrl = `/account/chats?chatId=${conversation.id}`;
        
        // Add the message as URL parameter so it pre-fills the chat textarea
        if (message && message.trim()) {
          chatUrl += `&initialMessage=${encodeURIComponent(message)}`;
        }
        
        // Add user info for context
        if (user) {
          chatUrl += `&userName=${encodeURIComponent(user.name)}`;
          chatUrl += `&userId=${user.id}`;
        }
        
        navigate(chatUrl);
        ToastService.success('Chat started successfully');
      } else {
        throw new Error('Invalid conversation response');
      }
    } catch (error: any) {
      console.error('❌ Error starting conversation:', error);
      
      // Show user-friendly error message
      if (error?.message?.includes('not found')) {
        ToastService.error('Unable to start chat: User not found');
      } else if (error?.message?.includes('authenticated')) {
        ToastService.error('Please login to start chat');
        navigate('/auth/login');
      } else {
        ToastService.error('Failed to start chat. Please try again.');
      }
    } finally {
      setIsSending(false);
      setShowChatModal(false);
    }
  };

  const handleSuggestionClick = (message: string) => {
    setShowChatModal(false);
    sendChatMessage(message);
  };

  const handleCustomMessage = () => {
    if (customMessage.trim()) {
      setShowChatModal(false);
      sendChatMessage(customMessage.trim());
      setCustomMessage('');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>User not found</h2>
        <button className="back-home-btn" onClick={() => navigate('/connect')}>
          <FiArrowLeft /> Back to Connect
        </button>
      </div>
    );
  }

  const chatSuggestions = [
    `Hi ${user.name}! I'd love to connect with you 😊`,
    `Hey! I saw your profile and thought we might have a lot in common`,
    `Hi there! Your profile caught my attention. Would love to chat!`,
    `Hello ${user.name}! I think we'd get along great. Want to talk?`,
    `Hey! I'm interested in getting to know you better 💬`,
    `Hi ${user.name}! Your profile really stood out to me 🌟`,
    `Hello! I'd like to get to know you better. How are you today?`,
    `Hey ${user.name}! I noticed we have similar interests. Let's chat!`,
    `Hi! I'm looking forward to connecting with you 👋`,
    `Hello ${user.name}! I'd love to learn more about you`,
    `Hey there! Your profile is amazing. Would you like to chat?`,
    `Hi ${user.name}! I think we could have great conversations together 💭`,
  ];

  const location = [user.city, user.state, user.country].filter(Boolean).join(', ');

  return (
    <div className="connect-profile-page">
      {/* Breadcrumb Navigation */}
      <DynamicBreadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Connect', href: '/connect' },
          { label: user.name || 'User Profile', isActive: true }
        ]}
      />

      {/* Main Content */}
      <div className="profile-main">
        {/* Left Sidebar - Avatar & Quick Actions */}
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <div className="profile-avatar-container">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                size="xlarge"
                isOnline={user.isOnline}
              />
            </div>

            <div className="profile-name-section">
              <h2 className="profile-display-name">
                {user.name}
                {user.isVerified && (
                  <span className="verified-icon" title="Verified">
                    <FiCheck />
                  </span>
                )}
              </h2>
              <p className="profile-age">{user.age && user.age >= 10 ? `${user.age} years old` : 'Age: N/A'}</p>
              {user.isOnline && (
                <div className="online-status-badge">
                  <span className="status-dot"></span>
                  <span>Online Now</span>
                </div>
              )}
            </div>

            <div className="quick-stats">
              {user.sex && (
                <div className="stat-item">
                  <span className="stat-icon">{getGenderIcon(user.sex)}</span>
                  <span className="stat-label">{user.sex}</span>
                </div>
              )}
              {location && (
                <div className="stat-item">
                  <FiMapPin className="stat-icon" />
                  <span className="stat-label">{location}</span>
                </div>
              )}
            </div>

            <button className="primary-action-btn" onClick={handleStartChat}>
              <FiMessageCircle size={20} />
              <span>Send Message</span>
            </button>
          </div>
        </aside>

        {/* Right Content - Details */}
        <main className="profile-content">
          {/* About Section */}
          <section className="content-card">
            <div className="card-header">
              <FiBook className="card-icon" />
              <h3 className="card-title">About Me</h3>
            </div>
            <div className="card-body">
              <p className="bio-text">{user.bio || 'N/A'}</p>
            </div>
          </section>

          {/* Tagline */}
          <section className="content-card">
            <div className="card-header">
              <FiMessageCircle className="card-icon" />
              <h3 className="card-title">Tagline</h3>
            </div>
            <div className="card-body">
              <p className="bio-text">{user.tagline || 'N/A'}</p>
            </div>
          </section>

          {/* Basic Information */}
          <section className="content-card">
            <div className="card-header">
              <FiUser className="card-icon" />
              <h3 className="card-title">Basic Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <FiBriefcase className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Occupation</span>
                    <span className="info-value">{user.occupation || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiBook className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Education</span>
                    <span className="info-value">{user.education_level || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiHeart className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Looking For</span>
                    <span className="info-value">{user.looking_for || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiHome className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Location</span>
                    <span className="info-value">{[user.city, user.state, user.country].filter(Boolean).join(', ') || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiGlobe className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Languages</span>
                    <span className="info-value">{user.languages_spoken || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Lifestyle & Preferences */}
          <section className="content-card">
            <div className="card-header">
              <FiHeart className="card-icon" />
              <h3 className="card-title">Lifestyle & Preferences</h3>
            </div>
            <div className="card-body">
              <div className="preferences-list">
                <div className="preference-item">
                  <span className="pref-emoji">🚭</span>
                  <div className="pref-content">
                    <span className="pref-label">Smoking</span>
                    <span className="pref-value">{user.smoking_habit || 'N/A'}</span>
                  </div>
                </div>
                <div className="preference-item">
                  <span className="pref-emoji">🍷</span>
                  <div className="pref-content">
                    <span className="pref-label">Drinking</span>
                    <span className="pref-value">{user.drinking_habit || 'N/A'}</span>
                  </div>
                </div>
                <div className="preference-item">
                  <span className="pref-emoji">🐾</span>
                  <div className="pref-content">
                    <span className="pref-label">Pets</span>
                    <span className="pref-value">{user.pet_preference || 'N/A'}</span>
                  </div>
                </div>
                <div className="preference-item">
                  <span className="pref-emoji">🙏</span>
                  <div className="pref-content">
                    <span className="pref-label">Religion</span>
                    <span className="pref-value">{user.religion || 'N/A'}</span>
                  </div>
                </div>
                <div className="preference-item">
                  <span className="pref-emoji">🗳️</span>
                  <div className="pref-content">
                    <span className="pref-label">Political Views</span>
                    <span className="pref-value">{user.political_views || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Chat Message Modal */}
      {showChatModal && (
        <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Start a Conversation</h3>
              <button className="modal-close" onClick={() => setShowChatModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">Choose a message or write your own:</p>
              <div className="suggestions-list">
                {chatSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isSending}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="custom-message-section">
                <textarea
                  className="custom-message-textarea"
                  placeholder="Or write your own message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCustomMessage();
                    }
                  }}
                  disabled={isSending}
                  rows={1}
                />
                <button
                  className="send-message-btn"
                  onClick={handleCustomMessage}
                  disabled={!customMessage.trim() || isSending}
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectProfile;
