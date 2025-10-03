// src/app/components/Account/ProfileCompletionBanner.tsx
/**
 * 🎯 Profile Completion Reminder Banner
 * 
 * Features:
 * ✅ Non-intrusive design (appears at top of account pages)
 * ✅ Shows completion percentage with visual progress bar
 * ✅ Dismissible (saves to localStorage)
 * ✅ Beautiful gradient design
 * ✅ Direct call-to-action button
 * ✅ Smooth animations
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiX, FiEdit3 } from 'react-icons/fi';
import './ProfileCompletionBanner.css';

interface ProfileCompletionBannerProps {
  user: any;
  completionPercentage?: number;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ 
  user,
  completionPercentage 
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [calculatedPercentage, setCalculatedPercentage] = useState(0);

  // Calculate completion percentage if not provided
  useEffect(() => {
    if (completionPercentage !== undefined) {
      setCalculatedPercentage(completionPercentage);
    } else {
      const percentage = calculateProfileCompletion(user);
      setCalculatedPercentage(percentage);
    }

    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('profile_completion_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [user, completionPercentage]);

  // Calculate profile completion based on fields
  const calculateProfileCompletion = (user: any): number => {
    if (!user) return 0;

    const requiredFields = [
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'dob',
      'sex',
      'avatar', // Profile photo
      'bio',
      'city',
      'country',
      'body_type',
      'occupation',
      'looking_for',
      'interested_in'
    ];

    const filledFields = requiredFields.filter(field => {
      const value = user[field];
      return value && value !== '' && value !== null && value !== undefined;
    });

    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('profile_completion_dismissed', 'true');
  };

  // Don't show if profile is 100% complete or dismissed
  if (calculatedPercentage >= 100 || isDismissed) {
    return null;
  }

  // Get appropriate message based on completion
  const getMessage = () => {
    if (calculatedPercentage >= 80) {
      return "You're almost there! Complete your profile to get better matches.";
    } else if (calculatedPercentage >= 50) {
      return "Your profile is looking good! Add more details to stand out.";
    } else {
      return "Complete your profile to unlock the full experience!";
    }
  };

  const getMissingFields = (): string[] => {
    if (!user) return [];
    
    const fieldLabels: Record<string, string> = {
      'avatar': 'Profile Photo',
      'bio': 'Bio',
      'city': 'City',
      'country': 'Country',
      'body_type': 'Body Type',
      'occupation': 'Occupation',
      'looking_for': 'What You\'re Looking For',
      'interested_in': 'Interested In',
      'dob': 'Date of Birth',
      'sex': 'Gender'
    };

    const missingFields: string[] = [];
    Object.entries(fieldLabels).forEach(([field, label]) => {
      const value = user[field];
      if (!value || value === '' || value === null || value === undefined) {
        missingFields.push(label);
      }
    });

    return missingFields.slice(0, 3); // Show only top 3 missing
  };

  const missingFields = getMissingFields();

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          className="profile-completion-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="banner-content">
            <div className="banner-icon">
              {calculatedPercentage >= 80 ? (
                <FiCheckCircle size={24} />
              ) : (
                <FiAlertCircle size={24} />
              )}
            </div>

            <div className="banner-info">
              <div className="banner-text">
                <h4 className="banner-title">
                  Profile {calculatedPercentage}% Complete
                </h4>
                <p className="banner-message">{getMessage()}</p>
                
                {missingFields.length > 0 && (
                  <div className="missing-fields">
                    <span className="missing-label">Missing:</span>
                    <span className="missing-items">
                      {missingFields.join(', ')}
                      {getMissingFields().length > 3 && ` +${getMissingFields().length - 3} more`}
                    </span>
                  </div>
                )}
              </div>

              <div className="progress-container">
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculatedPercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className="progress-text">{calculatedPercentage}%</span>
              </div>
            </div>

            <div className="banner-actions">
              <Link 
                to="/account/profile/edit" 
                className="complete-profile-btn"
              >
                <FiEdit3 size={16} />
                <span>Complete Profile</span>
              </Link>
              
              <button 
                className="dismiss-btn"
                onClick={handleDismiss}
                title="Dismiss reminder"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileCompletionBanner;
