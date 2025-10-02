// src/app/pages/connect/components/VerifiedBadge.tsx

import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import './VerifiedBadge.css';

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: number;
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified,
  size = 16,
  className = '',
}) => {
  if (!isVerified) return null;

  return (
    <span className={`verified-badge ${className}`} aria-label="Verified user">
      <FiCheckCircle size={size} />
    </span>
  );
};

export default VerifiedBadge;
