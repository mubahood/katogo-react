// src/app/components/Account/AccountPageWrapper.tsx
/**
 * 🎯 REUSABLE PAGE WRAPPER FOR ACCOUNT PAGES
 * 
 * Features:
 * ✅ Consistent page header
 * ✅ Action buttons support
 * ✅ Loading states
 * ✅ Mobile responsive
 * ✅ Breadcrumb integration
 */

import React from 'react';
import { motion } from 'framer-motion';
import './AccountPageWrapper.css';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AccountPageWrapperProps {
  title: string;
  subtitle?: string;
  actions?: ActionButton[];
  children: React.ReactNode;
  isLoading?: boolean;
}

const AccountPageWrapper: React.FC<AccountPageWrapperProps> = ({
  title,
  subtitle,
  actions = [],
  children,
  isLoading = false
}) => {
  return (
    <motion.div
      className="account-page-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        {actions.length > 0 && (
          <div className="page-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`action-btn ${action.variant || 'primary'}`}
                onClick={action.onClick}
                disabled={action.disabled || isLoading}
              >
                {action.icon && <span className="btn-icon">{action.icon}</span>}
                <span className="btn-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="page-body">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading...</p>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
};

export default AccountPageWrapper;
