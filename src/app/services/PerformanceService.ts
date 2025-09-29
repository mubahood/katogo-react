// src/app/services/PerformanceService.ts
import AnalyticsService from "./AnalyticsService";
import { PRODUCTION_CONFIG, DEBUG_CONFIG } from "../../Constants";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface VitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Production Performance Monitoring Service
 * Tracks Core Web Vitals, page load times, and user interactions
 */
export class PerformanceService {
  private static metrics: PerformanceMetric[] = [];
  private static observers: Map<string, PerformanceObserver> = new Map();
  private static isEnabled = PRODUCTION_CONFIG.ENABLE_ANALYTICS;
  private static isInitialized = false;

  /**
   * Initialize performance monitoring
   */
  static initialize() {
    if (!this.isEnabled || typeof window === 'undefined' || this.isInitialized) return;

    // Track navigation timing
    this.trackNavigationTiming();
    
    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track resource timing
    this.trackResourceTiming();
    
    // Track user interactions
    this.trackUserInteractions();

    this.isInitialized = true;
    if (DEBUG_CONFIG.ENABLE_PERFORMANCE_LOGS) {
      console.log('📊 Performance monitoring initialized');
    }
  }

  /**
   * Track navigation timing metrics
   */
  private static trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = {
            dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp_connect: navigation.connectEnd - navigation.connectStart,
            server_response: navigation.responseStart - navigation.requestStart,
            dom_loading: navigation.domContentLoadedEventStart - navigation.fetchStart,
            page_load: navigation.loadEventStart - navigation.fetchStart,
          };

          Object.entries(metrics).forEach(([name, value]) => {
            this.recordMetric(name, value);
            AnalyticsService.trackPerformance(name, value);
          });
        }
      }, 0);
    });
  }

  /**
   * Track Core Web Vitals using Web Vitals API
   */
  private static trackCoreWebVitals() {
    // Track Largest Contentful Paint (LCP)
    this.observePerformance('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      this.trackVital('LCP', lcp.startTime);
    });

    // Track First Input Delay (FID)
    this.observePerformance('first-input', (entries) => {
      const fid = entries[0] as any;
      if (fid && fid.processingStart) {
        this.trackVital('FID', fid.processingStart - fid.startTime);
      }
    });

    // Track Cumulative Layout Shift (CLS)
    this.observePerformance('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.trackVital('CLS', clsValue);
    });

    // Track First Contentful Paint (FCP)
    this.observePerformance('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.trackVital('FCP', entry.startTime);
        }
      });
    });

    // Track Time to First Byte (TTFB)
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.trackVital('TTFB', ttfb);
    }
  }

  /**
   * Track resource loading performance
   */
  private static trackResourceTiming() {
    this.observePerformance('resource', (entries) => {
      entries.forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        const duration = resourceEntry.responseEnd - resourceEntry.startTime;
        
        // Track slow resources (>500ms)
        if (duration > 500) {
          this.recordMetric(`slow_resource_${resourceEntry.initiatorType}`, duration);
          AnalyticsService.trackPerformance(`slow_resource_${resourceEntry.initiatorType}`, duration);
        }

        // Track large resources (>100KB)
        if (resourceEntry.transferSize && resourceEntry.transferSize > 100 * 1024) {
          AnalyticsService.trackEvent({
            event: 'large_resource',
            category: 'Performance',
            action: 'large_resource_loaded',
            label: resourceEntry.name,
            value: Math.round(resourceEntry.transferSize / 1024),
          });
        }
      });
    });
  }

  /**
   * Track user interaction performance
   */
  private static trackUserInteractions() {
    let clickStartTime: number;

    // Track click response time
    document.addEventListener('mousedown', () => {
      clickStartTime = performance.now();
    });

    document.addEventListener('click', () => {
      if (clickStartTime) {
        const responseTime = performance.now() - clickStartTime;
        this.recordMetric('click_response_time', responseTime);
        
        if (responseTime > 100) {
          AnalyticsService.trackPerformance('slow_click_response', responseTime);
        }
      }
    });

    // Track scroll performance
    let scrollStartTime: number;
    let isScrolling = false;

    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        scrollStartTime = performance.now();
        isScrolling = true;
      }

      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(() => {
        const scrollDuration = performance.now() - scrollStartTime;
        this.recordMetric('scroll_duration', scrollDuration);
        isScrolling = false;
      }, 150);
    });
  }

  /**
   * Track a Core Web Vital metric
   */
  private static trackVital(name: VitalMetric['name'], value: number) {
    const rating = this.getRating(name, value);
    
    this.recordMetric(name.toLowerCase(), value);
    
    AnalyticsService.trackEvent({
      event: 'web_vital',
      category: 'Performance',
      action: name,
      label: rating,
      value: Math.round(value),
      custom_parameters: {
        metric_name: name,
        metric_value: value,
        metric_rating: rating,
      },
    });

    // Log poor performing metrics
    if (rating === 'poor') {
      console.warn(`⚠️ Poor ${name} performance:`, value);
    }
  }

  /**
   * Get performance rating for Core Web Vitals
   */
  private static getRating(name: VitalMetric['name'], value: number): VitalMetric['rating'] {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Safely observe performance entries, preventing duplicate observers
   */
  private static observePerformance(type: string, callback: (entries: PerformanceEntry[]) => void) {
    // Prevent duplicate observers for the same type
    if (this.observers.has(type)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type} performance:`, error);
    }
  }

  /**
   * Record a performance metric
   */
  private static recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Track page load completion
   */
  static trackPageLoad(pageName: string) {
    const startTime = performance.now();
    
    return {
      complete: () => {
        const loadTime = performance.now() - startTime;
        this.recordMetric(`page_load_${pageName}`, loadTime);
        AnalyticsService.trackPerformance(`page_load_${pageName}`, loadTime);
        
        if (loadTime > 3000) {
          AnalyticsService.trackEvent({
            event: 'slow_page_load',
            category: 'Performance',
            action: 'slow_page',
            label: pageName,
            value: Math.round(loadTime),
          });
        }
      }
    };
  }

  /**
   * Track API call performance
   */
  static trackApiCall(endpoint: string, startTime: number, success: boolean) {
    const duration = performance.now() - startTime;
    
    this.recordMetric(`api_call_${endpoint}`, duration);
    AnalyticsService.trackPerformance(`api_call_${endpoint}`, duration);

    AnalyticsService.trackEvent({
      event: 'api_call',
      category: 'Performance',
      action: success ? 'api_success' : 'api_error',
      label: endpoint,
      value: Math.round(duration),
      custom_parameters: {
        endpoint,
        duration,
        success,
      },
    });

    // Track slow API calls (>2s)
    if (duration > 2000) {
      AnalyticsService.trackEvent({
        event: 'slow_api_call',
        category: 'Performance',
        action: 'slow_api',
        label: endpoint,
        value: Math.round(duration),
      });
    }
  }

  /**
   * Track bundle size and loading performance
   */
  static trackBundlePerformance() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let totalJSSize = 0;
      let totalCSSSize = 0;
      
      resources.forEach((resource) => {
        if (resource.name.includes('.js')) {
          totalJSSize += resource.transferSize || 0;
        } else if (resource.name.includes('.css')) {
          totalCSSSize += resource.transferSize || 0;
        }
      });

      AnalyticsService.trackEvent({
        event: 'bundle_performance',
        category: 'Performance',
        action: 'bundle_loaded',
        custom_parameters: {
          js_size_kb: Math.round(totalJSSize / 1024),
          css_size_kb: Math.round(totalCSSSize / 1024),
          total_size_kb: Math.round((totalJSSize + totalCSSSize) / 1024),
        },
      });
    });
  }

  /**
   * Get current performance metrics
   */
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary() {
    const metrics = this.getMetrics();
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, min: Infinity, max: 0, count: 0 };
      }

      const s = summary[metric.name];
      s.count++;
      s.min = Math.min(s.min, metric.value);
      s.max = Math.max(s.max, metric.value);
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count;
    });

    return summary;
  }
}

export default PerformanceService;