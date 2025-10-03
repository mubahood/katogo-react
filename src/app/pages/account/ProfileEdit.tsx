// src/app/pages/account/ProfileEdit.tsx
/**
 * COMPREHENSIVE PROFILE EDIT PAGE
 * 
 * Features:
 * ✅ Multi-step wizard (Basic Info → Location → Dating Profile → Preferences)
 * ✅ Avatar upload with preview
 * ✅ Comprehensive validation
 * ✅ All user profile fields from Flutter model
 * ✅ Design system consistency
 * ✅ Mobile-first responsive
 * ✅ Progress indicator
 * ✅ API integration with update-profile endpoint
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { updateProfile } from '../../store/slices/authSlice';
import { FiUser, FiMapPin, FiHeart, FiSettings, FiCamera, FiCheck, FiArrowRight, FiArrowLeft, FiLoader } from 'react-icons/fi';
import ApiService from '../../services/ApiService';
import ToastService from '../../services/ToastService';
import ProfileService from '../../services/ProfileService';
import './ProfileEdit.css';

interface ProfileFormData {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  phone_number_2: string;
  dob: string;
  sex: string;
  avatar?: File | null;
  avatarPreview?: string;
  
  // Location
  country: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  
  // Dating Profile
  bio: string;
  tagline: string;
  profile_photos: string;
  sexual_orientation: string;
  height_cm: string;
  body_type: string;
  
  // Lifestyle
  smoking_habit: string;
  drinking_habit: string;
  pet_preference: string;
  religion: string;
  political_views: string;
  
  // Additional Details
  languages_spoken: string;
  education_level: string;
  occupation: string;
  
  // Preferences
  looking_for: string;
  interested_in: string;
  age_range_min: string;
  age_range_max: string;
  max_distance_km: string;
}

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true); // For initial profile fetch
  const [loading, setLoading] = useState(false); // For form submission

  // Utility function to clean and validate numeric input
  const cleanNumericValue = (value: string): string => {
    // Remove all non-numeric characters except decimal point and minus
    const cleaned = value.replace(/[^0-9.-]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  // Utility to validate if string is a valid number
  const isValidNumber = (value: string): boolean => {
    if (!value || value.trim() === '') return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  };

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    phone_number_2: user?.phone_number_2 || '',
    dob: user?.dob || '',
    sex: user?.sex || '',
    avatar: null,
    avatarPreview: user?.avatar || '',
    
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    address: user?.address || '',
    latitude: user?.latitude || '',
    longitude: user?.longitude || '',
    
    bio: user?.bio || '',
    tagline: user?.tagline || '',
    profile_photos: user?.profile_photos || '',
    sexual_orientation: user?.sexual_orientation || '',
    height_cm: user?.height_cm || '',
    body_type: user?.body_type || '',
    
    smoking_habit: user?.smoking_habit || '',
    drinking_habit: user?.drinking_habit || '',
    pet_preference: user?.pet_preference || '',
    religion: user?.religion || '',
    political_views: user?.political_views || '',
    
    languages_spoken: user?.languages_spoken || '',
    education_level: user?.education_level || '',
    occupation: user?.occupation || '',
    
    looking_for: user?.looking_for || '',
    interested_in: user?.interested_in || '',
    age_range_min: user?.age_range_min || '18',
    age_range_max: user?.age_range_max || '35',
    max_distance_km: user?.max_distance_km || '50'
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with user data
  const initializeForm = useCallback((userData: any) => {
    console.log('🔄 Initializing form with user data:', userData);
    
    setFormData({
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      email: userData?.email || '',
      phone_number: userData?.phone_number || '',
      phone_number_2: userData?.phone_number_2 || '',
      dob: userData?.dob || '',
      sex: userData?.sex || '',
      avatar: null,
      avatarPreview: userData?.avatar || '',
      
      country: userData?.country || '',
      state: userData?.state || '',
      city: userData?.city || '',
      address: userData?.address || '',
      latitude: userData?.latitude?.toString() || '',
      longitude: userData?.longitude?.toString() || '',
      
      bio: userData?.bio || '',
      tagline: userData?.tagline || '',
      profile_photos: userData?.profile_photos || '',
      sexual_orientation: userData?.sexual_orientation || '',
      height_cm: userData?.height_cm?.toString() || '',
      body_type: userData?.body_type || '',
      
      smoking_habit: userData?.smoking_habit || '',
      drinking_habit: userData?.drinking_habit || '',
      pet_preference: userData?.pet_preference || '',
      religion: userData?.religion || '',
      political_views: userData?.political_views || '',
      
      languages_spoken: userData?.languages_spoken || '',
      education_level: userData?.education_level || '',
      occupation: userData?.occupation || '',
      
      looking_for: userData?.looking_for || '',
      interested_in: userData?.interested_in || '',
      age_range_min: userData?.age_range_min?.toString() || '18',
      age_range_max: userData?.age_range_max?.toString() || '35',
      max_distance_km: userData?.max_distance_km?.toString() || '50'
    });
    
    console.log('✅ Form initialized successfully');
  }, []);

  // Fetch latest profile from backend on component mount
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        setInitialLoading(true);
        console.log('🔄 Fetching latest profile before editing...');
        
        // Import ProfileService dynamically to avoid circular dependencies
        const { ProfileService } = await import('../../services/ProfileService');
        
        // Fetch and sync profile
        const freshProfile = await ProfileService.fetchAndSyncProfile(false);
        
        // Initialize form with fresh data
        initializeForm(freshProfile);
        
        console.log('✅ Profile fetched and form initialized');
        
      } catch (error: any) {
        console.error('❌ Failed to fetch profile:', error);
        ToastService.error('Failed to load profile data. Using cached data.');
        
        // Fallback to Redux user if fetch fails
        if (user) {
          initializeForm(user);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchLatestProfile();
  }, []); // Empty dependency array - run once on mount

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        ToastService.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        ToastService.error('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Info validation
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.sex) newErrors.sex = 'Gender is required';
    }

    if (step === 2) {
      // Location validation
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
    }

    if (step === 3) {
      // Dating Profile validation
      if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
      if (formData.bio.length < 20) newErrors.bio = 'Bio must be at least 20 characters';
      if (!formData.body_type) newErrors.body_type = 'Body type is required';
      if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate steps
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for API
      const apiFormData = new FormData();
      
      // IMPORTANT: Include user ID so backend knows which record to update
      if (user?.id) {
        apiFormData.append('id', user.id.toString());
      }
      
      // Basic info (required fields)
      apiFormData.append('first_name', formData.first_name.trim());
      apiFormData.append('last_name', formData.last_name.trim());
      apiFormData.append('email', formData.email.trim().toLowerCase());
      apiFormData.append('phone_number', formData.phone_number.trim());
      if (formData.phone_number_2 && formData.phone_number_2.trim()) {
        apiFormData.append('phone_number_2', formData.phone_number_2.trim());
      }
      apiFormData.append('dob', formData.dob);
      apiFormData.append('sex', formData.sex);
      
      // Avatar - Following Flutter app's pattern for file uploads
      if (formData.avatar) {
        apiFormData.append('temp_file_field', 'avatar'); // Tell backend which field to update
        apiFormData.append('photo', formData.avatar); // The actual file
      }
      
      // Location
      if (formData.country && formData.country.trim()) {
        apiFormData.append('country', formData.country.trim());
      }
      if (formData.state && formData.state.trim()) {
        apiFormData.append('state', formData.state.trim());
      }
      if (formData.city && formData.city.trim()) {
        apiFormData.append('city', formData.city.trim());
      }
      if (formData.address && formData.address.trim()) {
        apiFormData.append('address', formData.address.trim());
      }
      // Only send numeric coordinates if they are valid numbers
      if (formData.latitude && isValidNumber(formData.latitude)) {
        const lat = parseFloat(formData.latitude);
        if (lat >= -90 && lat <= 90) {
          apiFormData.append('latitude', lat.toString());
        }
      }
      if (formData.longitude && isValidNumber(formData.longitude)) {
        const lng = parseFloat(formData.longitude);
        if (lng >= -180 && lng <= 180) {
          apiFormData.append('longitude', lng.toString());
        }
      }
      
      // Dating profile
      if (formData.bio && formData.bio.trim()) {
        apiFormData.append('bio', formData.bio.trim());
      }
      if (formData.tagline && formData.tagline.trim()) {
        apiFormData.append('tagline', formData.tagline.trim());
      }
      if (formData.sexual_orientation) {
        apiFormData.append('sexual_orientation', formData.sexual_orientation);
      }
      // Only send height if it's a valid number
      if (formData.height_cm && isValidNumber(formData.height_cm)) {
        const height = parseInt(formData.height_cm);
        if (height >= 100 && height <= 250) {
          apiFormData.append('height_cm', height.toString());
        }
      }
      if (formData.body_type) {
        apiFormData.append('body_type', formData.body_type);
      }
      
      // Lifestyle (dropdown values - send as-is if selected)
      if (formData.smoking_habit) {
        apiFormData.append('smoking_habit', formData.smoking_habit);
      }
      if (formData.drinking_habit) {
        apiFormData.append('drinking_habit', formData.drinking_habit);
      }
      if (formData.pet_preference) {
        apiFormData.append('pet_preference', formData.pet_preference);
      }
      if (formData.religion) {
        apiFormData.append('religion', formData.religion);
      }
      if (formData.political_views) {
        apiFormData.append('political_views', formData.political_views);
      }
      
      // Additional details
      if (formData.languages_spoken && formData.languages_spoken.trim()) {
        apiFormData.append('languages_spoken', formData.languages_spoken.trim());
      }
      if (formData.education_level) {
        apiFormData.append('education_level', formData.education_level);
      }
      if (formData.occupation && formData.occupation.trim()) {
        apiFormData.append('occupation', formData.occupation.trim());
      }
      
      // Preferences
      if (formData.looking_for) {
        apiFormData.append('looking_for', formData.looking_for);
      }
      if (formData.interested_in) {
        apiFormData.append('interested_in', formData.interested_in);
      }
      // Only send numeric age ranges if valid
      if (formData.age_range_min && isValidNumber(formData.age_range_min)) {
        const minAge = parseInt(formData.age_range_min);
        if (minAge >= 18 && minAge <= 100) {
          apiFormData.append('age_range_min', minAge.toString());
        }
      }
      if (formData.age_range_max && isValidNumber(formData.age_range_max)) {
        const maxAge = parseInt(formData.age_range_max);
        if (maxAge >= 18 && maxAge <= 100) {
          apiFormData.append('age_range_max', maxAge.toString());
        }
      }
      // Only send distance if it's a valid number
      if (formData.max_distance_km && isValidNumber(formData.max_distance_km)) {
        const distance = parseInt(formData.max_distance_km);
        if (distance >= 1 && distance <= 500) {
          apiFormData.append('max_distance_km', distance.toString());
        }
      }

      // Debug: Log FormData contents
      console.log('📤 Submitting profile update with FormData:');
      for (let pair of apiFormData.entries()) {
        if (pair[0] === 'photo') {
          console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
        } else {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      }

      // Call comprehensive API update
      const response = await ApiService.updateProfileComprehensive(apiFormData);

      console.log('✅ Profile updated successfully, fetching fresh data...');

      // CRITICAL: Fetch fresh profile from backend and sync everywhere
      // This ensures localStorage and Redux are up-to-date with latest data
      try {
        await ProfileService.fetchAndSyncProfile(false);
        console.log('✅ Profile synced after update');
      } catch (syncError) {
        console.error('⚠️ Failed to sync profile after update, using response data:', syncError);
        // Fallback: sync the response data if fetch fails
        if (response) {
          ProfileService.syncUpdatedProfile(response);
        }
      }

      ToastService.success('Profile updated successfully!');
      
      // Small delay to ensure Redux state is updated before navigation
      setTimeout(() => {
        navigate('/account/profile');
      }, 300);
    } catch (error: any) {
      console.error('Profile update error:', error);
      ToastService.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Step titles and icons
  const steps = [
    { number: 1, title: 'Basic Info', icon: <FiUser /> },
    { number: 2, title: 'Location', icon: <FiMapPin /> },
    { number: 3, title: 'Dating Profile', icon: <FiHeart /> },
    { number: 4, title: 'Preferences', icon: <FiSettings /> }
  ];

  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;

  // Show loading screen while fetching initial profile
  if (initialLoading) {
    return (
      <div className="profile-edit-page">
        <div className="profile-edit-container">
          <div className="profile-loading">
            <div className="loading-spinner">
              <FiLoader className="spinner-icon" />
            </div>
            <h2>Loading Your Profile...</h2>
            <p>Fetching your latest information from the server</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-container">
        {/* Header */}
        <div className="profile-edit-header">
          <h1 className="profile-edit-title">Edit Your Profile</h1>
          <p className="profile-edit-subtitle">
            Complete your profile to enhance your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-steps">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              >
                <div className="step-icon">
                  {currentStep > step.number ? <FiCheck /> : step.icon}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="profile-edit-form">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="form-step active">
              <h2 className="step-heading">
                <FiUser /> Basic Information
              </h2>

              {/* Avatar Upload */}
              <div className="avatar-upload-section">
                <div className="avatar-preview" onClick={triggerFileInput}>
                  {formData.avatarPreview ? (
                    <img src={formData.avatarPreview} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      <FiCamera size={32} />
                    </div>
                  )}
                  <div className="avatar-overlay">
                    <FiCamera size={24} />
                    <span>Change Photo</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <p className="avatar-hint">Click to upload your profile photo</p>
              </div>

              {/* Name Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={errors.first_name ? 'error' : ''}
                    placeholder="Enter your first name"
                  />
                  {errors.first_name && <span className="error-message">{errors.first_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={errors.last_name ? 'error' : ''}
                    placeholder="Enter your last name"
                  />
                  {errors.last_name && <span className="error-message">{errors.last_name}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="your.email@example.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Phone Numbers */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone_number">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={errors.phone_number ? 'error' : ''}
                    placeholder="+256 700 000000"
                  />
                  {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number_2">Alternative Phone (Optional)</label>
                  <input
                    type="tel"
                    id="phone_number_2"
                    name="phone_number_2"
                    value={formData.phone_number_2}
                    onChange={handleChange}
                    placeholder="+256 700 000000"
                  />
                </div>
              </div>

              {/* Date of Birth & Gender */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dob">
                    Date of Birth <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={errors.dob ? 'error' : ''}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 14)).toISOString().split('T')[0]}
                  />
                  {errors.dob && <span className="error-message">{errors.dob}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="sex">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className={errors.sex ? 'error' : ''}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.sex && <span className="error-message">{errors.sex}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="form-step active">
              <h2 className="step-heading">
                <FiMapPin /> Location Information
              </h2>

              {/* Country & City */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">
                    Country <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={errors.country ? 'error' : ''}
                    placeholder="e.g., Uganda"
                  />
                  {errors.country && <span className="error-message">{errors.country}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city">
                    City <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                    placeholder="e.g., Kampala"
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
              </div>

              {/* State */}
              <div className="form-group">
                <label htmlFor="state">State/Province (Optional)</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g., Central Region"
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label htmlFor="address">Street Address (Optional)</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter your full address"
                ></textarea>
              </div>

              {/* Coordinates (Optional) */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude (Optional)</label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={(e) => {
                      const cleaned = cleanNumericValue(e.target.value);
                      setFormData(prev => ({ ...prev, latitude: cleaned }));
                    }}
                    placeholder="0.347596"
                    step="0.000001"
                    min="-90"
                    max="90"
                  />
                  <small className="field-hint">Valid range: -90 to 90</small>
                </div>

                <div className="form-group">
                  <label htmlFor="longitude">Longitude (Optional)</label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={(e) => {
                      const cleaned = cleanNumericValue(e.target.value);
                      setFormData(prev => ({ ...prev, longitude: cleaned }));
                    }}
                    placeholder="32.582520"
                    step="0.000001"
                    min="-180"
                    max="180"
                  />
                  <small className="field-hint">Valid range: -180 to 180</small>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dating Profile */}
          {currentStep === 3 && (
            <div className="form-step active">
              <h2 className="step-heading">
                <FiHeart /> Dating Profile
              </h2>

              {/* Bio */}
              <div className="form-group">
                <label htmlFor="bio">
                  About Me (Bio) <span className="required">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className={errors.bio ? 'error' : ''}
                  rows={5}
                  placeholder="Tell others about yourself... (minimum 20 characters)"
                  maxLength={500}
                ></textarea>
                <div className="char-count">{formData.bio.length}/500</div>
                {errors.bio && <span className="error-message">{errors.bio}</span>}
              </div>

              {/* Tagline */}
              <div className="form-group">
                <label htmlFor="tagline">Tagline (Optional)</label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="A catchy phrase about you"
                  maxLength={100}
                />
              </div>

              {/* Physical Attributes */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="height_cm">Height (cm) (Optional)</label>
                  <input
                    type="number"
                    id="height_cm"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                    placeholder="170"
                    min="100"
                    max="250"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="body_type">
                    Body Type <span className="required">*</span>
                  </label>
                  <select
                    id="body_type"
                    name="body_type"
                    value={formData.body_type}
                    onChange={handleChange}
                    className={errors.body_type ? 'error' : ''}
                  >
                    <option value="">Select Body Type</option>
                    <option value="Slim">Slim</option>
                    <option value="Average">Average</option>
                    <option value="Athletic">Athletic</option>
                    <option value="Curvy">Curvy</option>
                    <option value="Muscular">Muscular</option>
                  </select>
                  {errors.body_type && <span className="error-message">{errors.body_type}</span>}
                </div>
              </div>

              {/* Sexual Orientation */}
              <div className="form-group">
                <label htmlFor="sexual_orientation">Sexual Orientation (Optional)</label>
                <select
                  id="sexual_orientation"
                  name="sexual_orientation"
                  value={formData.sexual_orientation}
                  onChange={handleChange}
                >
                  <option value="">Select Orientation</option>
                  <option value="Straight">Straight</option>
                  <option value="Homosexual">Homosexual</option>
                  <option value="Bisexual">Bisexual</option>
                  <option value="Asexual">Asexual</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Lifestyle */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="smoking_habit">Smoking Habit (Optional)</label>
                  <select
                    id="smoking_habit"
                    name="smoking_habit"
                    value={formData.smoking_habit}
                    onChange={handleChange}
                  >
                    <option value="">Select Option</option>
                    <option value="Never">Never</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="drinking_habit">Drinking Habit (Optional)</label>
                  <select
                    id="drinking_habit"
                    name="drinking_habit"
                    value={formData.drinking_habit}
                    onChange={handleChange}
                  >
                    <option value="">Select Option</option>
                    <option value="Never">Never</option>
                    <option value="Socially">Socially</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>
              </div>

              {/* Education & Occupation */}
              <div className="form-group">
                <label htmlFor="occupation">
                  Occupation <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className={errors.occupation ? 'error' : ''}
                  placeholder="e.g., Software Engineer"
                />
                {errors.occupation && <span className="error-message">{errors.occupation}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="education_level">Education Level (Optional)</label>
                <select
                  id="education_level"
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                >
                  <option value="">Select Education Level</option>
                  <option value="None">None</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor Degree">Bachelor Degree</option>
                  <option value="Master Degree">Master Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Postdoctoral">Postdoctoral</option>
                </select>
              </div>

              {/* Additional Details */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="religion">Religion (Optional)</label>
                  <select
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                  >
                    <option value="">Select Religion</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Islam">Islam</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="Judaism">Judaism</option>
                    <option value="Atheism">Atheism</option>
                    <option value="Agnostic">Agnostic</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Sikhism">Sikhism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="languages_spoken">Languages Spoken (Optional)</label>
                  <input
                    type="text"
                    id="languages_spoken"
                    name="languages_spoken"
                    value={formData.languages_spoken}
                    onChange={handleChange}
                    placeholder="e.g., English, Luganda"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="form-step active">
              <h2 className="step-heading">
                <FiSettings /> Relationship Preferences
              </h2>

              {/* Looking For & Interested In */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="looking_for">Looking For (Optional)</label>
                  <select
                    id="looking_for"
                    name="looking_for"
                    value={formData.looking_for}
                    onChange={handleChange}
                  >
                    <option value="">Select Option</option>
                    <option value="Relationship">Relationship</option>
                    <option value="Connect">Connect</option>
                    <option value="Friendship">Friendship</option>
                    <option value="Casual">Casual</option>
                    <option value="Marriage">Marriage</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="interested_in">Interested In (Optional)</label>
                  <select
                    id="interested_in"
                    name="interested_in"
                    value={formData.interested_in}
                    onChange={handleChange}
                  >
                    <option value="">Select Option</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Both">Both</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Age Range */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age_range_min">Minimum Age (Optional)</label>
                  <select
                    id="age_range_min"
                    name="age_range_min"
                    value={formData.age_range_min}
                    onChange={handleChange}
                  >
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="age_range_max">Maximum Age (Optional)</label>
                  <select
                    id="age_range_max"
                    name="age_range_max"
                    value={formData.age_range_max}
                    onChange={handleChange}
                  >
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                    <option value="45">45</option>
                    <option value="50">50</option>
                    <option value="60">60+</option>
                  </select>
                </div>
              </div>

              {/* Max Distance */}
              <div className="form-group">
                <label htmlFor="max_distance_km">
                  Maximum Distance (km) (Optional)
                </label>
                <input
                  type="range"
                  id="max_distance_km"
                  name="max_distance_km"
                  value={formData.max_distance_km}
                  onChange={handleChange}
                  min="10"
                  max="500"
                  step="10"
                />
                <div className="range-value">{formData.max_distance_km} km</div>
              </div>

              {/* Political Views */}
              <div className="form-group">
                <label htmlFor="political_views">Political Views (Optional)</label>
                <input
                  type="text"
                  id="political_views"
                  name="political_views"
                  value={formData.political_views}
                  onChange={handleChange}
                  placeholder="e.g., Liberal, Conservative, etc."
                />
              </div>

              {/* Pet Preference */}
              <div className="form-group">
                <label htmlFor="pet_preference">Pet Preference (Optional)</label>
                <select
                  id="pet_preference"
                  name="pet_preference"
                  value={formData.pet_preference}
                  onChange={handleChange}
                >
                  <option value="">Select Option</option>
                  <option value="Love pets">Love pets</option>
                  <option value="Have pets">Have pets</option>
                  <option value="Allergic to pets">Allergic to pets</option>
                  <option value="No pets">No pets</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={loading}
              >
                <FiArrowLeft /> Previous
              </button>
            )}
            
            {currentStep < totalSteps && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next <FiArrowRight />
              </button>
            )}

            {currentStep === totalSteps && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'} <FiCheck />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
