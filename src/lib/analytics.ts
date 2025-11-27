import { track } from '@vercel/analytics';

// Analytics and monitoring utilities
export const initAnalytics = () => {
  // Only initialize in production
  if (process.env.NODE_ENV === 'production') {
    // Vercel Analytics is automatically initialized
    console.info('Analytics initialized');
  }
};

// Page view tracking
export const trackPageView = (page: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    track('page_view', {
      page,
      ...properties,
      timestamp: new Date().toISOString()
    });
  } else {
    console.info('Page view:', page, properties);
  }
};

// User action tracking
export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    track(action, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  } else {
    console.info('User action:', action, properties);
  }
};

// OS workflow tracking
export const trackOSWorkflow = (osId: string, step: number, action: string, properties?: Record<string, any>) => {
  trackUserAction('os_workflow', {
    os_id: osId,
    step,
    action,
    ...properties
  });
};

// File upload/download tracking
export const trackFileOperation = (operation: 'upload' | 'download', fileType: string, fileSize?: number, properties?: Record<string, any>) => {
  trackUserAction('file_operation', {
    operation,
    file_type: fileType,
    file_size: fileSize,
    ...properties
  });
};

// Search and filter tracking
export const trackSearch = (query: string, filters?: Record<string, any>, resultsCount?: number) => {
  trackUserAction('search', {
    query,
    filters,
    results_count: resultsCount
  });
};

// Error tracking (complement to Sentry)
export const trackError = (error: Error, context?: Record<string, any>) => {
  trackUserAction('error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

// Performance tracking
export const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) => {
  trackUserAction('performance', {
    metric,
    value,
    ...properties
  });
};

// Feature usage tracking
export const trackFeatureUsage = (feature: string, properties?: Record<string, any>) => {
  trackUserAction('feature_usage', {
    feature,
    ...properties
  });
};

// Theme tracking
export const trackThemeChange = (theme: 'light' | 'dark') => {
  trackUserAction('theme_change', {
    theme
  });
};

// Session tracking
export const trackSessionStart = (properties?: Record<string, any>) => {
  trackUserAction('session_start', {
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...properties
  });
};

export const trackSessionEnd = (duration: number, properties?: Record<string, any>) => {
  trackUserAction('session_end', {
    duration_minutes: Math.round(duration / 60000), // Convert to minutes
    ...properties
  });
};

// Custom event tracking
export const trackCustomEvent = (eventName: string, properties?: Record<string, any>) => {
  trackUserAction(eventName, properties);
};

// Monitoring helpers
export class PerformanceMonitor {
  private startTime: number = 0;
  private marks: Map<string, number> = new Map();

  start(operation: string) {
    this.startTime = performance.now();
    this.marks.set(operation, this.startTime);
    console.info(`Performance: ${operation} started`);
  }

  mark(markName: string) {
    const time = performance.now();
    this.marks.set(markName, time);
    console.info(`Performance mark: ${markName} at ${time}ms`);
  }

  end(operation: string, properties?: Record<string, any>) {
    const endTime = performance.now();
    const startTime = this.marks.get(operation) || this.startTime;
    const duration = endTime - startTime;

    trackPerformance(`${operation}_duration`, duration, properties);
    console.info(`Performance: ${operation} completed in ${duration.toFixed(2)}ms`);

    return duration;
  }

  measure(from: string, to: string, name: string, properties?: Record<string, any>) {
    const startTime = this.marks.get(from);
    const endTime = this.marks.get(to);

    if (startTime && endTime) {
      const duration = endTime - startTime;
      trackPerformance(`${name}_duration`, duration, properties);
      console.info(`Performance measure: ${name} = ${duration.toFixed(2)}ms`);
      return duration;
    }

    return 0;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();