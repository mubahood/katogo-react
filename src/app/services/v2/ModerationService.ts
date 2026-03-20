// src/app/services/v2/ModerationService.ts
// Uses /api/moderation/* endpoints
// Content reporting, user blocking, legal consent

import { http_get, http_post } from '../Api';

export type ReportType = 'Inappropriate' | 'Spam' | 'Copyright' | 'Harassment' | 'Other';
export type BlockType = 'full' | 'messages';

export interface ReportContentParams {
  reported_content_type: 'movie' | 'blog_post' | 'comment' | 'user_profile' | 'product';
  reported_content_id: number;
  report_type: ReportType;
  description?: string;
}

export interface BlockUserParams {
  blocked_user_id: number;
  reason?: string;
  block_type?: BlockType;
}

export interface BlockedUser {
  id: number;
  blocked_user: {
    id: number;
    name: string;
    avatar?: string;
  };
  reason?: string;
  blocked_at: string;
}

export interface MyReport {
  id: number;
  reported_content_type: string;
  reported_content_id: number;
  report_type: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

class ModerationService {
  /**
   * Report content — POST /api/moderation/report-content
   */
  static async reportContent(params: ReportContentParams): Promise<void> {
    await http_post('moderation/report-content', params);
  }

  /**
   * Block a user — POST /api/moderation/block-user
   */
  static async blockUser(params: BlockUserParams): Promise<void> {
    await http_post('moderation/block-user', params);
  }

  /**
   * Unblock a user — POST /api/moderation/unblock-user
   */
  static async unblockUser(blockedUserId: number): Promise<void> {
    await http_post('moderation/unblock-user', { blocked_user_id: blockedUserId });
  }

  /**
   * Get list of blocked users — GET /api/moderation/blocked-users
   */
  static async getBlockedUsers(page = 1, per_page = 20): Promise<{
    items: BlockedUser[];
    pagination: any;
  }> {
    const response = await http_get('moderation/blocked-users', { page, per_page });
    return response.data;
  }

  /**
   * Get user's submitted reports — GET /api/moderation/my-reports
   */
  static async getMyReports(page = 1, per_page = 20): Promise<{
    items: MyReport[];
    pagination: any;
  }> {
    const response = await http_get('moderation/my-reports', { page, per_page });
    return response.data;
  }

  /**
   * Submit legal consent — POST /api/moderation/legal-consent
   */
  static async submitLegalConsent(consentAgreed: boolean): Promise<void> {
    await http_post('moderation/legal-consent', { consent_agreed: consentAgreed });
  }

  /**
   * Check legal consent status — GET /api/moderation/legal-consent-status
   */
  static async getLegalConsentStatus(): Promise<{ has_consented: boolean; consented_at?: string }> {
    const response = await http_get('moderation/legal-consent-status');
    return response.data || { has_consented: false };
  }
}

export default ModerationService;
