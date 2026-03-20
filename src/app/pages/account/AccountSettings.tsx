// src/app/pages/account/AccountSettings.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Settings, Shield, Bell, CreditCard, Eye, EyeOff, Save, Moon, Sun, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectThemeMode, toggleThemeMode } from "../../store/slices/themeSlice";
import { AppDispatch, RootState } from "../../store/store";
import ModerationService from "../../services/v2/ModerationService";
import { http_post } from "../../services/Api";

const AccountSettings: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // SETTINGS-01: Dark mode
  const dispatch = useDispatch<AppDispatch>();
  const themeMode = useSelector(selectThemeMode);

  // SETTINGS-02: Delete account
  const [deleting, setDeleting] = useState(false);
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure? This will permanently delete your account and all data. This cannot be undone.'
    );
    if (!confirmed) return;
    const doubleConfirm = window.confirm('Final confirmation: delete account permanently?');
    if (!doubleConfirm) return;
    setDeleting(true);
    try {
      await http_post('disable-account', {});
      window.location.href = '/landing';
    } catch {
      alert('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  // SETTINGS-03: Consent status
  const [consentStatus, setConsentStatus] = useState<{ has_consented: boolean; consented_at?: string } | null>(null);
  useEffect(() => {
    ModerationService.getLegalConsentStatus().then(setConsentStatus).catch(() => {});
  }, []);
  const handleReconsent = async () => {
    try {
      await ModerationService.submitLegalConsent(true);
      sessionStorage.setItem('katogo_has_consented', 'true');
      setConsentStatus(prev => prev ? { ...prev, has_consented: true, consented_at: new Date().toISOString() } : null);
      alert('Consent updated.');
    } catch {
      alert('Failed to update consent. Please try again.');
    }
  };
  
  // Settings state
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    securityAlerts: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    personalization: true
  });

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // In a real app, this would make an API call
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSecuritySettings(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleSettingsSave = () => {
    // In a real app, this would make an API call
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="acc-settings-container">
      {/* Page Header */}
      <div className="acc-page-header">
        <div>
          <h1 className="acc-page-title">Account Settings</h1>
          <p className="acc-page-subtitle">
            Manage your account preferences and security
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="acc-card" style={{
          backgroundColor: 'var(--success-bg)',
          borderColor: 'var(--success-border)',
          color: 'var(--success-color)',
          marginBottom: 'var(--spacing-4)'
        }}>
          <div className="acc-card-body" style={{ padding: 'var(--spacing-4)' }}>
            <Save size={16} style={{ marginRight: '8px' }} />
            Settings updated successfully!
          </div>
        </div>
      )}

      {/* Security Settings */}
      {/* SETTINGS-01: Appearance / Dark Mode */}
      <div className="acc-card" style={{ marginBottom: 'var(--spacing-4)' }}>
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            {themeMode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            Appearance
          </h3>
        </div>
        <div className="acc-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>Dark Mode</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-color-medium)' }}>
                Currently: {themeMode === 'dark' ? 'Dark' : 'Light'}
              </p>
            </div>
            <button
              className="acc-btn acc-btn-outline acc-btn-sm"
              onClick={() => dispatch(toggleThemeMode())}
            >
              {themeMode === 'dark' ? <Sun size={14} style={{ marginRight: '6px' }} /> : <Moon size={14} style={{ marginRight: '6px' }} />}
              Switch to {themeMode === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* SETTINGS-03: Legal Consent Status */}
      {consentStatus && (
        <div className="acc-card" style={{ marginBottom: 'var(--spacing-4)' }}>
          <div className="acc-card-header">
            <h3 className="acc-card-title">
              <Shield size={20} />
              Legal Consent
            </h3>
          </div>
          <div className="acc-card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ margin: 0 }}>
                  Status:{' '}
                  <strong style={{ color: consentStatus.has_consented ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {consentStatus.has_consented ? 'Agreed' : 'Not agreed'}
                  </strong>
                </p>
                {consentStatus.consented_at && (
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-color-medium)' }}>
                    Consented on {new Date(consentStatus.consented_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/terms" className="acc-btn acc-btn-outline acc-btn-sm">View Terms</Link>
                <button className="acc-btn acc-btn-outline acc-btn-sm" onClick={handleReconsent}>
                  Re-consent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="acc-card">
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <Shield size={20} />
            Security Settings
          </h3>
        </div>
        <div className="acc-card-body">
          <form onSubmit={handlePasswordSubmit}>
            <h5 style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text-color)',
              marginBottom: 'var(--spacing-3)'
            }}>
              Change Password
            </h5>
            
            <div className="acc-form-group">
              <label className="acc-form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={securitySettings.currentPassword}
                  onChange={handleSecurityChange}
                  className="acc-form-control"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-color-medium)'
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
              <div className="acc-form-group">
                <label className="acc-form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={securitySettings.newPassword}
                    onChange={handleSecurityChange}
                    className="acc-form-control"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-color-medium)'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="acc-form-group">
                <label className="acc-form-label">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={securitySettings.confirmPassword}
                  onChange={handleSecurityChange}
                  className="acc-form-control"
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 'var(--spacing-3)',
              borderTop: '1px solid var(--border-color)',
              marginTop: 'var(--spacing-4)'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                <input
                  type="checkbox"
                  name="twoFactorEnabled"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={handleSecurityChange}
                />
                Enable Two-Factor Authentication
              </label>
              <button type="submit" className="acc-btn acc-btn-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="acc-card">
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <Bell size={20} />
            Notification Preferences
          </h3>
        </div>
        <div className="acc-card-body">
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            <div>
              <h5 style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-color)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Communication Preferences
              </h5>
              <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                  Email notifications
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationChange}
                  />
                  SMS notifications
                </label>
              </div>
            </div>

            <div>
              <h5 style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-color)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Content Preferences
              </h5>
              <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="orderUpdates"
                    checked={notificationSettings.orderUpdates}
                    onChange={handleNotificationChange}
                  />
                  Order updates and shipping notifications
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="promotions"
                    checked={notificationSettings.promotions}
                    onChange={handleNotificationChange}
                  />
                  Promotions and special offers
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={notificationSettings.newsletter}
                    onChange={handleNotificationChange}
                  />
                  Weekly newsletter
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="securityAlerts"
                    checked={notificationSettings.securityAlerts}
                    onChange={handleNotificationChange}
                  />
                  Security alerts (recommended)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="acc-card">
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <Settings size={20} />
            Privacy & Data
          </h3>
        </div>
        <div className="acc-card-body">
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            <div className="acc-form-group">
              <label className="acc-form-label">Profile Visibility</label>
              <select
                name="profileVisibility"
                value={privacySettings.profileVisibility}
                onChange={handlePrivacyChange}
                className="acc-form-control"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div>
              <h5 style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-color)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Data Usage Preferences
              </h5>
              <div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="dataSharing"
                    checked={privacySettings.dataSharing}
                    onChange={handlePrivacyChange}
                  />
                  Allow data sharing with partners
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="analytics"
                    checked={privacySettings.analytics}
                    onChange={handlePrivacyChange}
                  />
                  Help improve our service with analytics
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <input
                    type="checkbox"
                    name="personalization"
                    checked={privacySettings.personalization}
                    onChange={handlePrivacyChange}
                  />
                  Enable personalized recommendations
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="acc-card">
        <div className="acc-card-header">
          <h3 className="acc-card-title">
            <CreditCard size={20} />
            Account Actions
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
              background: 'var(--background-light)'
            }}>
              <div>
                <h5 style={{
                  margin: 0,
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  Download Your Data
                </h5>
                <p style={{
                  margin: 0,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-color-medium)'
                }}>
                  Get a copy of all your account data
                </p>
              </div>
              <button className="acc-btn acc-btn-outline acc-btn-sm">
                Download
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-3)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--border-radius)',
              background: 'var(--background-light)'
            }}>
              <div>
                <h5 style={{
                  margin: 0,
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--danger-color)'
                }}>
                  Delete Account
                </h5>
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
                style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                <Trash2 size={14} style={{ marginRight: '6px' }} />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save All Settings */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 'var(--spacing-6)'
      }}>
        <button className="acc-btn acc-btn-primary acc-btn-lg" onClick={handleSettingsSave}>
          <Save size={16} style={{ marginRight: '8px' }} />
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
