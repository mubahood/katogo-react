// src/app/components/Account/AccountCard.tsx
/**
 * 🎯 REUSABLE CARD COMPONENT FOR ACCOUNT PAGES
 * 
 * Features:
 * ✅ Consistent card styling
 * ✅ Optional header with title and actions
 * ✅ Loading states
 * ✅ Empty states
 * ✅ Mobile responsive
 */

import React from 'react';
import { motion } from 'framer-motion';
import './AccountCard.css';

interface CardAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface AccountCardProps {
  title?: string;
  subtitle?: string;
  actions?: CardAction[];
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  noPadding?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  title,
  subtitle,
  actions = [],
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
  className = '',
  noPadding = false
}) => {
  return (
    <motion.div
      className={`account-card ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
     

      {/* Card Body */}
      <div className={` pb-2 pb-md-4 ${noPadding ? 'no-padding' : ''}`}>
        {isLoading ? (
          <div className="card-loading">
            <div className="loading-spinner-small" />
            <p>Loading...</p>
          </div>
        ) : isEmpty ? (
          <div className="card-empty">
            <div className="empty-icon">📭</div>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
};

export default AccountCard;
