// src/app/models/ConnectModels.ts

/**
 * Main Connect User Interface
 * Represents a user in the dating/connect module
 */
export interface ConnectUser {
  // Core Identity
  id: number;
  username: string;
  name: string;
  email: string;
  avatar: string;

  // Personal Info
  first_name: string;
  last_name: string;
  phone_number: string;
  phone_number_2?: string;
  sex: 'male' | 'female' | '';
  dob: string; // YYYY-MM-DD format
  age?: number; // Calculated field

  // Profile Content
  bio: string;
  tagline: string;
  profile_photos: string[]; // Array of photo URLs

  // Physical Attributes
  height_cm: string;
  body_type: string;
  sexual_orientation: string;

  // Location
  country: string;
  state: string;
  city: string;
  latitude: string;
  longitude: string;
  address?: string;

  // Phone Details
  phone_country_name?: string;
  phone_country_code?: string;
  phone_country_international?: string;

  // Dating Preferences
  looking_for: string; // e.g., "Serious Relationship", "Casual Dating"
  interested_in: string; // e.g., "Men", "Women", "Everyone"
  age_range_min: string;
  age_range_max: string;
  max_distance_km: string;

  // Lifestyle
  smoking_habit: string;
  drinking_habit: string;
  pet_preference: string;

  // Beliefs & Culture
  religion: string;
  political_views: string;
  languages_spoken: string;

  // Professional
  education_level: string;
  occupation: string;

  // Verification & Status
  email_verified: 'yes' | 'no';
  phone_verified: 'yes' | 'no';
  verification_code?: string;
  status: string;
  isVerified?: boolean; // Computed from email_verified

  // Online Presence
  last_online_at: string;
  online_status: string;
  isOnline?: boolean; // Computed from online_status

  // Subscription & Credits
  subscription_tier: string;
  subscription_expires?: string;
  credits_balance: string;

  // Engagement Metrics
  profile_views: string;
  likes_received: string;
  matches_count: string;
  completed_profile_pct: string;

  // Security
  failed_login_attempts?: string;
  last_password_change?: string;
  secret_code?: string;

  // System Fields
  company_id?: string;
  remember_token?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Filters for user discovery
 */
export interface ConnectFilters {
  search?: string;
  sex?: 'male' | 'female';
  country?: string;
  city?: string;
  age_min?: number;
  age_max?: number;
  online_only?: boolean;
  email_verified?: boolean;
  status?: string;
  sort_by?: 'last_online_at' | 'name' | 'created_at' | 'updated_at';
  sort_dir?: 'asc' | 'desc';
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  hasMore: boolean;
  from?: number;
  to?: number;
}

/**
 * API Response for users list
 */
export interface ConnectUsersResponse {
  users: ConnectUser[];
  pagination: PaginationMeta;
}

/**
 * View type for discovery page
 */
export type ConnectViewType = 'cards' | 'grid' | 'list';

/**
 * Swipe action result
 */
export type SwipeAction = 'like' | 'pass' | 'undo';

/**
 * Swipe gesture data
 */
export interface SwipeData {
  userId: number;
  action: SwipeAction;
  direction: 'left' | 'right';
  velocity: number;
}

/**
 * Match status between users
 */
export interface MatchStatus {
  userId: number;
  isMatched: boolean;
  isLiked: boolean;
  isLikedBy: boolean;
  matchedAt?: string;
}

/**
 * User preferences for discovery
 */
export interface ConnectPreferences {
  lookingFor: string[];
  interestedIn: string[];
  ageRange: [number, number];
  maxDistance: number; // in km
  showOnlineOnly: boolean;
  showVerifiedOnly: boolean;
}

/**
 * Profile edit data
 */
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  tagline?: string;
  sex?: 'male' | 'female';
  dob?: string;
  height_cm?: string;
  body_type?: string;
  sexual_orientation?: string;
  country?: string;
  state?: string;
  city?: string;
  looking_for?: string;
  interested_in?: string;
  age_range_min?: string;
  age_range_max?: string;
  max_distance_km?: string;
  smoking_habit?: string;
  drinking_habit?: string;
  pet_preference?: string;
  religion?: string;
  political_views?: string;
  languages_spoken?: string;
  education_level?: string;
  occupation?: string;
}

/**
 * Report reason options
 */
export type ReportReason =
  | 'inappropriate_content'
  | 'harassment'
  | 'fake_profile'
  | 'spam'
  | 'underage'
  | 'other';

/**
 * Report data structure
 */
export interface ReportData {
  contentType: 'user';
  contentId: number;
  reason: ReportReason;
  details?: string;
}

/**
 * Block user data
 */
export interface BlockData {
  blockedUserId: number;
  reason?: string;
}

/**
 * Chat start data
 */
export interface ChatStartData {
  receiverId: number;
  receiverName?: string;
  receiverAvatar?: string;
}

/**
 * Online status enum
 */
export enum OnlineStatus {
  Online = 'online',
  Offline = 'offline',
  Away = 'away',
}

/**
 * Body type options
 */
export const BODY_TYPES = [
  'Slim',
  'Athletic',
  'Average',
  'Curvy',
  'Muscular',
  'Plus Size',
  'Prefer not to say',
] as const;

/**
 * Relationship type options
 */
export const LOOKING_FOR_OPTIONS = [
  'Serious Relationship',
  'Casual Dating',
  'Friendship',
  'Networking',
  'Activity Partner',
  'Not Sure Yet',
] as const;

/**
 * Gender interest options
 */
export const INTERESTED_IN_OPTIONS = [
  'Men',
  'Women',
  'Everyone',
  'Non-binary',
] as const;

/**
 * Smoking habit options
 */
export const SMOKING_OPTIONS = [
  'Non-smoker',
  'Social smoker',
  'Regular smoker',
  'Trying to quit',
  'Prefer not to say',
] as const;

/**
 * Drinking habit options
 */
export const DRINKING_OPTIONS = [
  'Non-drinker',
  'Social drinker',
  'Regular drinker',
  'Never',
  'Prefer not to say',
] as const;

/**
 * Pet preference options
 */
export const PET_OPTIONS = [
  'Love pets',
  'Have pets',
  "Don't have pets",
  'Allergic to pets',
  'Not a pet person',
  'Prefer not to say',
] as const;

/**
 * Education level options
 */
export const EDUCATION_OPTIONS = [
  'High School',
  'Some College',
  'Associate Degree',
  'Bachelor Degree',
  'Master Degree',
  'Doctorate',
  'Trade School',
  'Prefer not to say',
] as const;

/**
 * Helper function to calculate age from DOB
 */
export function calculateAge(dob: string): number {
  if (!dob) return 0;
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
}

/**
 * Helper function to check if user is online
 */
export function isUserOnline(onlineStatus: string): boolean {
  return onlineStatus?.toLowerCase() === 'online';
}

/**
 * Helper function to parse profile photos
 */
export function parseProfilePhotos(photos: string | string[]): string[] {
  if (Array.isArray(photos)) return photos;
  if (!photos) return [];
  try {
    return JSON.parse(photos);
  } catch {
    return [];
  }
}

/**
 * Helper function to format last seen time
 */
export function formatLastSeen(lastOnline: string): string {
  if (!lastOnline) return 'Long ago';
  try {
    const lastOnlineDate = new Date(lastOnline);
    const now = new Date();
    const diffMs = now.getTime() - lastOnlineDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    return 'Long ago';
  } catch {
    return 'Long ago';
  }
}

/**
 * Helper to get gender icon
 */
export function getGenderIcon(sex: string): string {
  switch (sex?.toLowerCase()) {
    case 'male':
      return '♂';
    case 'female':
      return '♀';
    default:
      return '⚥';
  }
}

/**
 * Helper to format height
 */
export function formatHeight(heightCm: string): string {
  const cm = parseInt(heightCm);
  if (!cm || cm === 0) return 'Not specified';
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${cm} cm (${feet}'${inches}")`;
}

/**
 * Helper to get profile completeness percentage
 */
export function calculateProfileCompleteness(user: Partial<ConnectUser>): number {
  const fields = [
    'first_name',
    'last_name',
    'bio',
    'avatar',
    'dob',
    'sex',
    'city',
    'country',
    'occupation',
    'education_level',
    'height_cm',
    'body_type',
    'looking_for',
    'interested_in',
  ];

  const completed = fields.filter(
    (field) => user[field as keyof ConnectUser] && user[field as keyof ConnectUser] !== ''
  ).length;

  return Math.round((completed / fields.length) * 100);
}
