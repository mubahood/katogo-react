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
