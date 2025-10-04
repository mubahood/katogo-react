// src/app/pages/static/MobileApps.tsx
import React from 'react';
import { 
  Smartphone, 
  Play, 
  Download, 
  Zap, 
  Bell, 
  Wifi, 
  Shield, 
  Star,
  MessageCircle,
  Mail
} from 'react-feather';
import { APP_LINKS, COMPANY_INFO } from '../../constants';
import './MobileApps.css';

const MobileApps: React.FC = () => {
  const features = [
    {
      icon: <Play />,
      title: 'Stream Anywhere',
      description: 'Watch movies and series on the go with seamless streaming'
    },
    {
      icon: <Download />,
      title: 'Offline Viewing',
      description: 'Download content to watch later without internet (coming soon)'
    },
    {
      icon: <Bell />,
      title: 'Push Notifications',
      description: 'Get alerts for new releases, subscriptions, and messages'
    },
    {
      icon: <Zap />,
      title: 'Fast & Smooth',
      description: 'Optimized performance for quick browsing and playback'
    },
    {
      icon: <MessageCircle />,
      title: 'Chat & Connect',
      description: 'Message sellers and connect with friends instantly'
    },
    {
      icon: <Shield />,
      title: 'Secure Payments',
      description: 'Safe mobile money and card payments integrated'
    }
  ];

  return (
    <div className="mobile-apps-container">
      {/* Page Header */}
      <div className="mobile-apps-header">
        <h1>UgFlix Mobile Apps</h1>
        <p>Watch movies, buy & sell, and connect on the go</p>
      </div>

      {/* Hero Section */}
      <div className="mobile-apps-hero">
        <div className="mobile-apps-hero-content">
          <h2>Download UgFlix App</h2>
          <p>
            Experience the full power of UgFlix in the palm of your hand. Stream movies, 
            browse products, chat with friends, and manage your subscriptions - all from 
            our mobile app.
          </p>
          <div className="mobile-apps-download-buttons">
            <a 
              href={APP_LINKS.IOS || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-apps-download-btn ios"
            >
              <Smartphone />
              Download for iOS
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=ugflix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-apps-download-btn android"
            >
              <Smartphone />
              Download for Android
            </a>
          </div>
        </div>
        <div className="mobile-apps-hero-image">
          <Smartphone />
        </div>
      </div>

      {/* Features Grid */}
      <div className="mobile-apps-features">
        {features.map((feature, index) => (
          <div key={index} className="mobile-apps-feature-card">
            <div className="mobile-apps-feature-icon">
              {feature.icon}
            </div>
            <div className="mobile-apps-feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div className="mobile-apps-requirements">
        <div className="mobile-apps-requirement-card">
          <h3>
            <Smartphone />
            iOS Requirements
          </h3>
          <ul>
            <li>iOS 12.0 or later</li>
            <li>iPhone, iPad, and iPod touch</li>
            <li>100MB storage space</li>
            <li>Internet connection required</li>
          </ul>
        </div>
        <div className="mobile-apps-requirement-card">
          <h3>
            <Smartphone />
            Android Requirements
          </h3>
          <ul>
            <li>Android 6.0 or later</li>
            <li>All Android phones and tablets</li>
            <li>80MB storage space</li>
            <li>Internet connection required</li>
          </ul>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mobile-apps-cta">
        <h2>Ready to Get Started?</h2>
        <p>Download the app now and enjoy UgFlix on your mobile device</p>
        <div className="mobile-apps-cta-buttons">
          <a 
            href="https://play.google.com/store/apps/details?id=ugflix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-apps-cta-btn"
          >
            <Download />
            Download Now
          </a>
          <a 
            href={`mailto:${COMPANY_INFO.EMAIL || 'support@ugflix.com'}`}
            className="mobile-apps-cta-btn"
          >
            <Mail />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileApps;
