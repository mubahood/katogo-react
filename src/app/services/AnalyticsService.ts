// src/app/services/AnalyticsService.ts
import { PRODUCTION_CONFIG, DEBUG_CONFIG } from "../../Constants";

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface EcommerceEvent {
  event: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item' | 'begin_checkout';
  transaction_id?: string;
  value?: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

/**
 * Production Analytics Service
 * Handles Google Analytics 4, Facebook Pixel, and custom analytics
 */
export class AnalyticsService {
  private static isInitialized = false;
  private static isEnabled = PRODUCTION_CONFIG.ENABLE_ANALYTICS;

  /**
   * Initialize analytics services
   */
  static initialize() {
    if (!this.isEnabled || this.isInitialized) return;

    // Initialize Google Analytics 4
    this.initializeGA4();
    
    // Initialize Facebook Pixel (if needed)
    // this.initializeFacebookPixel();
    
    this.isInitialized = true;
    console.log('📊 Analytics initialized');
  }

  /**
   * Initialize Google Analytics 4
   */
  private static initializeGA4() {
    // Add GA4 tracking code
    const GA_TRACKING_ID = 'G-XJY7DJQJ9E'; // Your GA4 ID
    
    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', 'G-XJY7DJQJ9E', {
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  /**
   * Track page views
   */
  static trackPageView(page_title: string, page_location?: string) {
    if (!this.isEnabled) return;

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('config', 'G-XJY7DJQJ9E', {
        page_title,
        page_location: page_location || window.location.href,
      });
    }

    console.log('📊 Page view tracked:', page_title);
  }

  /**
   * Track custom events
   */
  static trackEvent({ event, category, action, label, value, custom_parameters }: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...custom_parameters,
      });
    }

    if (DEBUG_CONFIG.ENABLE_ANALYTICS_LOGS) {
      console.log('📊 Event tracked:', { event, category, action, label, value });
    }
  }

  /**
   * Track ecommerce events
   */
  static trackEcommerce(eventData: EcommerceEvent) {
    if (!this.isEnabled) return;

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('event', eventData.event, {
        transaction_id: eventData.transaction_id,
        value: eventData.value,
        currency: eventData.currency || 'UGX',
        items: eventData.items,
      });
    }

    console.log('📊 Ecommerce event tracked:', eventData.event);
  }

  /**
   * Track user actions
   */
  static trackUserAction(action: string, details?: Record<string, any>) {
    this.trackEvent({
      event: 'user_action',
      category: 'User Interaction',
      action,
      custom_parameters: details,
    });
  }

  /**
   * Track search events
   */
  static trackSearch(searchTerm: string, resultsCount: number) {
    this.trackEvent({
      event: 'search',
      category: 'Search',
      action: 'perform_search',
      label: searchTerm,
      value: resultsCount,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount,
      },
    });
  }

  /**
   * Track product interactions
   */
  static trackProductView(productId: string, productName: string, category: string, price: number) {
    this.trackEcommerce({
      event: 'view_item',
      currency: 'UGX',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        category,
        price,
        quantity: 1,
      }],
    });
  }

  /**
   * Track cart actions
   */
  static trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1) {
    this.trackEcommerce({
      event: 'add_to_cart',
      currency: 'UGX',
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        category: 'Product',
        price,
        quantity,
      }],
    });
  }

  /**
   * Track purchases
   */
  static trackPurchase(transactionId: string, value: number, items: any[]) {
    this.trackEcommerce({
      event: 'purchase',
      transaction_id: transactionId,
      value,
      currency: 'UGX',
      items: items.map(item => ({
        item_id: item.id.toString(),
        item_name: item.name,
        category: item.category || 'Product',
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }

  /**
   * Track performance metrics
   */
  static trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.trackEvent({
      event: 'performance_metric',
      category: 'Performance',
      action: metric,
      value,
      custom_parameters: {
        metric_unit: unit,
      },
    });
  }

  /**
   * Track errors
   */
  static trackError(error: string, errorType: string = 'javascript', fatal: boolean = false) {
    this.trackEvent({
      event: 'exception',
      category: 'Error',
      action: errorType,
      label: error,
      custom_parameters: {
        fatal,
        error_description: error,
      },
    });
  }

  /**
   * Set user properties
   */
  static setUserProperties(properties: Record<string, any>) {
    if (!this.isEnabled) return;

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('config', 'G-XJY7DJQJ9E', {
        custom_map: properties,
      });
    }
  }

  /**
   * Track page timing
   */
  static trackTiming(timingCategory: string, timingVar: string, timingValue: number) {
    this.trackEvent({
      event: 'timing_complete',
      category: timingCategory,
      action: timingVar,
      value: timingValue,
      custom_parameters: {
        timing_category: timingCategory,
        timing_variable: timingVar,
        timing_value: timingValue,
      },
    });
  }
}

export default AnalyticsService;