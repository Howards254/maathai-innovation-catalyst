// Analytics and monitoring utilities

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

class Analytics {
  private isProduction = import.meta.env.PROD;
  
  track(event: string, properties?: Record<string, any>, userId?: string) {
    if (!this.isProduction) {
      console.log('Analytics Event:', { event, properties, userId });
      return;
    }
    
    // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
    // Example: gtag('event', event, properties);
  }

  // Track user actions
  trackUserAction(action: string, details?: Record<string, any>) {
    this.track('user_action', { action, ...details });
  }

  // Track campaign interactions
  trackCampaignInteraction(campaignId: string, action: string) {
    this.track('campaign_interaction', { campaignId, action });
  }

  // Track gamification events
  trackGamificationEvent(type: string, points?: number, badge?: string) {
    this.track('gamification', { type, points, badge });
  }

  // Track AI assistant usage
  trackAIUsage(query: string, responseTime?: number) {
    this.track('ai_assistant', { 
      query: query.substring(0, 100), // Truncate for privacy
      responseTime 
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, context?: string) {
    this.track('performance', { metric, value, context });
  }
}

export const analytics = new Analytics();

// Performance monitoring
export const measurePerformance = <T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> => {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      analytics.trackPerformance(name, duration);
    });
  } else {
    const duration = performance.now() - start;
    analytics.trackPerformance(name, duration);
    return result;
  }
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  analytics.track('error', {
    message: error.message,
    stack: error.stack?.substring(0, 500),
    context
  });
};