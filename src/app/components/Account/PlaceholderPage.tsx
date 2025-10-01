// src/app/components/Account/PlaceholderPage.tsx
/**
 * 🎯 PLACEHOLDER PAGE COMPONENT
 * 
 * Used for pages that haven't been implemented yet
 * Provides consistent UX with "Coming Soon" message
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTool } from 'react-icons/fi';
import AccountPageWrapper from './AccountPageWrapper';
import AccountCard from './AccountCard';
import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This page is under construction. Check back soon!',
  icon
}) => {
  return (
    <AccountPageWrapper
      title={title}
      subtitle="Coming Soon"
      actions={[
        {
          label: 'Back to Dashboard',
          onClick: () => window.location.href = '/account',
          icon: <FiArrowLeft />
        }
      ]}
    >
      <AccountCard>
        <div className="placeholder-content">
          <div className="placeholder-icon">
            {icon || <FiTool size={64} />}
          </div>
          <h2 className="placeholder-title">Page Under Construction</h2>
          <p className="placeholder-description">{description}</p>
          <div className="placeholder-actions">
            <Link to="/account" className="placeholder-btn primary">
              Go to Dashboard
            </Link>
            <Link to="/movies" className="placeholder-btn secondary">
              Browse Movies
            </Link>
          </div>
        </div>
      </AccountCard>
    </AccountPageWrapper>
  );
};

export default PlaceholderPage;
