// src/app/pages/account/AccountProfile.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { updateProfile } from '../../store/slices/authSlice';
import ToastService from '../../services/ToastService';
import ApiService from '../../services/ApiService';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  dob: string;
  sex: string;
  intro: string;
}

const AccountProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    dob: '',
    sex: '',
    intro: ''
  });

  // Initialize profile data from user state
  useEffect(() => {
    if (user) {
      const newProfile = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number_1 || '',
        dob: user.date_of_birth || '',
        sex: user.sex || '',
        intro: user.intro || ''
      };
      setProfile(newProfile);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case 'first_name':
        if (!value.trim() || value.trim().length < 2) {
          return 'First name is required and must be at least 2 characters';
        }
        break;
      case 'last_name':
        if (!value.trim() || value.trim().length < 2) {
          return 'Last name is required and must be at least 2 characters';
        }
        break;
      case 'phone_number':
        if (!value.trim() || value.trim().length < 5) {
          return 'Phone number is required and must be at least 5 characters';
        }
        break;
      case 'email':
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address';
          }
        }
        break;
      case 'intro':
        if (value && value.length > 500) {
          return 'Bio cannot exceed 500 characters';
        }
        break;
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      ToastService.error('User not found');
      return;
    }

    // Validate all fields
    const errors: Record<string, string> = {};
    
    const firstNameError = validateField('first_name', profile.first_name);
    if (firstNameError) errors.first_name = firstNameError;
    
    const lastNameError = validateField('last_name', profile.last_name);
    if (lastNameError) errors.last_name = lastNameError;
    
    const phoneError = validateField('phone_number', profile.phone_number);
    if (phoneError) errors.phone_number = phoneError;
    
    const emailError = validateField('email', profile.email);
    if (emailError) errors.email = emailError;
    
    const bioError = validateField('intro', profile.intro);
    if (bioError) errors.intro = bioError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      ToastService.error('Please fix the validation errors');
      return;
    }

    setValidationErrors({});
    setIsSaving(true);
    
    try {
      // Prepare data for API - ensure no empty strings are sent
      const profileData = {
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        phone_number: profile.phone_number.trim(),
        email: profile.email.trim() || undefined,
        dob: profile.dob || undefined,
        sex: profile.sex || undefined,
        intro: profile.intro.trim() || undefined,
      };

      // Validate that required fields are not empty before sending
      if (!profileData.first_name || profileData.first_name.length < 2) {
        setValidationErrors(prev => ({ ...prev, first_name: 'First name is required and must be at least 2 characters' }));
        ToastService.error('Please check the form data');
        return;
      }

      if (!profileData.last_name || profileData.last_name.length < 2) {
        setValidationErrors(prev => ({ ...prev, last_name: 'Last name is required and must be at least 2 characters' }));
        ToastService.error('Please check the form data');
        return;
      }

      if (!profileData.phone_number || profileData.phone_number.length < 5) {
        setValidationErrors(prev => ({ ...prev, phone_number: 'Phone number is required and must be at least 5 characters' }));
        ToastService.error('Please check the form data');
        return;
      }

      // Call the API
      const updatedUser = await ApiService.updateProfile(profileData);
      
      // Update Redux store with new user data
      if (updatedUser) {
        dispatch(updateProfile(updatedUser));
      }
      
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error: any) {
      // Error message is already shown by ToastService in ApiService
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number_1 || '',
        dob: user.date_of_birth || '',
        sex: user.sex || '',
        intro: user.intro || ''
      });
    }
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setValidationErrors({});
    setIsEditing(true);
  };

  if (!user) {
    return (
      <div className="acc-card" style={{
        backgroundColor: 'var(--warning-bg)',
        borderColor: 'var(--warning-border)',
        color: 'var(--warning-color)'
      }}>
        <div className="acc-card-body">
          <i className="bi bi-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="acc-profile-container">
      {/* Page Header */}
      <div className="acc-page-header">
        <div>
          <h1 className="acc-page-title">My Profile</h1>
          <p className="acc-page-subtitle">
            Manage your personal information and account settings
          </p>
        </div>
        {!isEditing && (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <button 
              className="acc-btn acc-btn-outline"
              onClick={handleEditClick}
            >
              <i className="bi bi-pencil" style={{ marginRight: '8px' }}></i>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="acc-card" style={{
          backgroundColor: 'var(--success-bg)',
          borderColor: 'var(--success-border)',
          color: 'var(--success-color)',
          marginBottom: 'var(--spacing-4)'
        }}>
          <div className="acc-card-body">
            <i className="bi bi-check-circle" style={{ marginRight: '8px' }}></i>
            Profile updated successfully!
          </div>
        </div>
      )}

      {/* Profile Information Card */}
      <div className="acc-card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <i className="bi bi-person-circle"></i>
            Personal Information
          </h3>
        </div>
        <div className="acc-card-body">
          <form onSubmit={handleSave}>
            {/* Name Fields */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 'var(--spacing-4)',
              marginBottom: 'var(--spacing-4)'
            }}>
              <div className="acc-form-group">
                <label className="acc-form-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className={`acc-form-control ${validationErrors.first_name ? 'error' : ''}`}
                  value={profile.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your first name"
                />
                {validationErrors.first_name && (
                  <div style={{ color: 'var(--danger-color)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>
                    {validationErrors.first_name}
                  </div>
                )}
              </div>
              <div className="acc-form-group">
                <label className="acc-form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className={`acc-form-control ${validationErrors.last_name ? 'error' : ''}`}
                  value={profile.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your last name"
                />
                {validationErrors.last_name && (
                  <div style={{ color: 'var(--danger-color)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>
                    {validationErrors.last_name}
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="acc-form-group" style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="acc-form-label">
                <i className="bi bi-envelope" style={{ marginRight: '8px' }}></i>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`acc-form-control ${validationErrors.email ? 'error' : ''}`}
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your email address"
              />
              {validationErrors.email && (
                <div style={{ color: 'var(--danger-color)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>
                  {validationErrors.email}
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div className="acc-form-group" style={{ marginBottom: 'var(--spacing-4)' }}>
              <label className="acc-form-label">
                <i className="bi bi-telephone" style={{ marginRight: '8px' }}></i>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                className={`acc-form-control ${validationErrors.phone_number ? 'error' : ''}`}
                value={profile.phone_number}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
              {validationErrors.phone_number && (
                <div style={{ color: 'var(--danger-color)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>
                  {validationErrors.phone_number}
                </div>
              )}
            </div>

            {/* Date of Birth and Gender */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--spacing-4)',
              marginBottom: 'var(--spacing-4)'
            }}>
              <div className="acc-form-group">
                <label className="acc-form-label">
                  <i className="bi bi-calendar-event" style={{ marginRight: '8px' }}></i>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  className="acc-form-control"
                  value={profile.dob}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="acc-form-group">
                <label className="acc-form-label">Gender</label>
                <select
                  name="sex"
                  className="acc-form-control"
                  value={profile.sex}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Bio Field */}
            <div className="acc-form-group">
              <label className="acc-form-label">About Me</label>
              <textarea
                name="intro"
                className={`acc-form-control ${validationErrors.intro ? 'error' : ''}`}
                rows={4}
                value={profile.intro}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Tell us a bit about yourself..."
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
              {validationErrors.intro && (
                <div style={{ color: 'var(--danger-color)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>
                  {validationErrors.intro}
                </div>
              )}
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: profile.intro.length > 500 ? 'var(--danger-color)' : 'var(--text-color-medium)', 
                marginTop: 'var(--spacing-1)' 
              }}>
                {profile.intro.length}/500 characters
              </div>
            </div>

            {/* Form Action Buttons - Inside the form */}
            {isEditing && (
              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-2)', 
                marginTop: 'var(--spacing-4)',
                paddingTop: 'var(--spacing-4)',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button 
                  type="button"
                  className="acc-btn acc-btn-outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="acc-btn acc-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid currentColor',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" style={{ marginRight: '8px' }}></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Account Information Card */}
      <div className="acc-card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <i className="bi bi-info-circle"></i>
            Account Information
          </h3>
        </div>
        <div className="acc-card-body">
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--background-light)'
            }}>
              <div>
                <h6 style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-base)', 
                  fontWeight: 'var(--font-weight-medium)' 
                }}>
                  Account ID
                </h6>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--text-color-medium)',
                  fontFamily: 'monospace'
                }}>
                  #{user.id}
                </p>
              </div>
              <span style={{
                padding: 'var(--spacing-1) var(--spacing-2)',
                backgroundColor: 'var(--success-color)',
                color: 'var(--white)',
                borderRadius: 'var(--border-radius)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                Active
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--background-light)'
            }}>
              <div>
                <h6 style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-base)', 
                  fontWeight: 'var(--font-weight-medium)' 
                }}>
                  Member Since
                </h6>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--text-color-medium)' 
                }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings Card */}
      <div className="acc-card">
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <i className="bi bi-shield-lock"></i>
            Security Settings
          </h3>
        </div>
        <div className="acc-card-body">
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--background-light)'
            }}>
              <div>
                <h6 style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-base)', 
                  fontWeight: 'var(--font-weight-medium)' 
                }}>
                  Change Password
                </h6>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--text-color-medium)' 
                }}>
                  Update your password to keep your account secure
                </p>
              </div>
              <Link to="/account/change-password" className="acc-btn acc-btn-outline acc-btn-sm">
                <i className="bi bi-key" style={{ marginRight: '6px' }}></i>
                Change
              </Link>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--background-light)'
            }}>
              <div>
                <h6 style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-base)', 
                  fontWeight: 'var(--font-weight-medium)' 
                }}>
                  Email Verification
                </h6>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--text-color-medium)' 
                }}>
                  Verify your email address for added security
                </p>
              </div>
              <span style={{
                padding: 'var(--spacing-1) var(--spacing-2)',
                backgroundColor: user.verification ? 'var(--success-color)' : 'var(--warning-color)',
                color: 'var(--white)',
                borderRadius: 'var(--border-radius)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                {user.verification ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--background-light)'
            }}>
              <div>
                <h6 style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-base)', 
                  fontWeight: 'var(--font-weight-medium)' 
                }}>
                  Account Deletion
                </h6>
                <p style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--text-color-medium)' 
                }}>
                  Permanently delete your account and all data
                </p>
              </div>
              <button 
                className="acc-btn acc-btn-outline acc-btn-sm"
                style={{ 
                  borderColor: 'var(--danger-color)', 
                  color: 'var(--danger-color)' 
                }}
                onClick={() => ToastService.info('Account deletion feature coming soon')}
              >
                <i className="bi bi-trash" style={{ marginRight: '6px' }}></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spinner animation styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AccountProfile;