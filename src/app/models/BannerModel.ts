// src/app/models/BannerModel.ts

import Utils from '../utils/imageUtils';

export interface BannerData {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  action_type?: 'category' | 'product' | 'vendor' | 'url' | 'none';
  action_value?: string;
  link?: string;
  is_active: 'Yes' | 'No';
  position?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Banner model for managing promotional banners and carousel items
 */
export default class BannerModel {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  action_type?: 'category' | 'product' | 'vendor' | 'url' | 'none';
  action_value?: string;
  link?: string;
  is_active: 'Yes' | 'No';
  position?: number;
  created_at?: string;
  updated_at?: string;

  constructor(data: BannerData) {
    this.id = data.id;
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.description = data.description;
    this.image = data.image;
    this.action_type = data.action_type;
    this.action_value = data.action_value;
    this.link = data.link;
    this.is_active = data.is_active;
    this.position = data.position;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Get full image URL using the image utility
   */
  getImageUrl(): string {
    return Utils.img(this.image);
  }

  /**
   * Check if banner is active
   */
  isActive(): boolean {
    return this.is_active === 'Yes';
  }

  /**
   * Get banner action URL based on action type
   */
  getActionUrl(): string {
    switch (this.action_type) {
      case 'category':
        return `/products?category=${this.action_value}`;
      case 'product':
        return `/product/${this.action_value}`;
      case 'vendor':
        return `/vendor/${this.action_value}`;
      case 'url':
        return this.action_value || '#';
      default:
        return this.link || '#';
    }
  }

  /**
   * Create a BannerModel from API response data
   */
  static fromApiData(data: any): BannerModel {
    return new BannerModel({
      id: data.id,
      title: data.title || data.name || 'Featured Banner',
      subtitle: data.subtitle,
      description: data.description,
      image: data.image || data.banner_image || data.photo,
      action_type: data.action_type,
      action_value: data.action_value,
      link: data.link,
      is_active: data.is_active || 'Yes',
      position: data.position || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  }

  /**
   * Sort banners by position
   */
  static sortByPosition(banners: BannerModel[]): BannerModel[] {
    return [...banners].sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  /**
   * Filter active banners
   */
  static filterActive(banners: BannerModel[]): BannerModel[] {
    return banners.filter(banner => banner.isActive());
  }
}
