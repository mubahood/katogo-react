// src/app/pages/account/AccountSubscriptions.tsx
// 
// Legacy redirect file - Now handled by AccountSubscriptionManagement.tsx
// This file is kept for backward compatibility only

import React, { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

const AccountSubscriptions: React.FC = () => {
  useEffect(() => {
    // Use full page reload to ensure fresh subscription data
    window.location.href = '/account/subscriptions';
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <Spinner animation="border" variant="primary" />
      <span className="ms-2">Loading subscriptions...</span>
    </div>
  );
};

export default AccountSubscriptions;