/**
 * Analytics Utility
 * 
 * This module provides comprehensive analytics functionality for the application,
 * implementing various tracking and reporting features.
 */

// Analytics event interface
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  properties?: Record<string, any>;
}

// Analytics data storage
const analyticsData: AnalyticsEvent[] = [];

/**
 * Track an analytics event
 * @param event - The event to track
 */
export const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp'>): void => {
  const analyticsEvent: AnalyticsEvent = {
    ...event,
    timestamp: Date.now(),
  };
  analyticsData.push(analyticsEvent);
  console.log('Analytics Event:', analyticsEvent);
};

/**
 * Track page view
 * @param path - The page path
 * @param title - The page title
 */
export const trackPageView = (path: string, title: string): void => {
  trackEvent({
    category: 'Page',
    action: 'View',
    label: path,
    properties: {
      title,
      url: window.location.href,
      referrer: document.referrer,
    },
  });
};

/**
 * Track user interaction
 * @param element - The interacted element
 * @param action - The interaction action
 */
export const trackUserInteraction = (
  element: HTMLElement,
  action: string
): void => {
  trackEvent({
    category: 'User Interaction',
    action,
    label: element.tagName.toLowerCase(),
    properties: {
      id: element.id,
      className: element.className,
      text: element.textContent,
    },
  });
};

/**
 * Track form submission
 * @param formId - The form ID
 * @param success - Whether the submission was successful
 */
export const trackFormSubmission = (
  formId: string,
  success: boolean
): void => {
  trackEvent({
    category: 'Form',
    action: 'Submit',
    label: formId,
    value: success ? 1 : 0,
  });
};

/**
 * Track error
 * @param error - The error to track
 * @param context - Additional context
 */
export const trackError = (
  error: Error,
  context?: Record<string, any>
): void => {
  trackEvent({
    category: 'Error',
    action: error.name,
    label: error.message,
    properties: {
      stack: error.stack,
      ...context,
    },
  });
};

/**
 * Track performance metric
 * @param metric - The metric name
 * @param value - The metric value
 */
export const trackPerformanceMetric = (
  metric: string,
  value: number
): void => {
  trackEvent({
    category: 'Performance',
    action: metric,
    value,
  });
}

/**
 * Track API call
 * @param endpoint - The API endpoint
 * @param method - The HTTP method
 * @param status - The response status
 * @param duration - The request duration
 */
export const trackApiCall = (
  endpoint: string,
  method: string,
  status: number,
  duration: number
): void => {
  trackEvent({
    category: 'API',
    action: method,
    label: endpoint,
    value: duration,
    properties: {
      status,
    },
  });
};

/**
 * Track search
 * @param query - The search query
 * @param results - Number of results
 */
export const trackSearch = (
  query: string,
  results: number
): void => {
  trackEvent({
    category: 'Search',
    action: 'Query',
    label: query,
    value: results,
  });
};

/**
 * Track authentication
 * @param action - The authentication action
 * @param success - Whether the action was successful
 */
export const trackAuth = (
  action: 'login' | 'logout' | 'signup',
  success: boolean
): void => {
  trackEvent({
    category: 'Authentication',
    action,
    value: success ? 1 : 0,
  });
};

/**
 * Get analytics data
 * @param category - Optional category to filter by
 * @returns Array of analytics events
 */
export const getAnalyticsData = (category?: string): AnalyticsEvent[] => {
  if (category) {
    return analyticsData.filter((event) => event.category === category);
  }
  return [...analyticsData];
};

/**
 * Get analytics summary
 * @returns Object containing analytics summary
 */
export const getAnalyticsSummary = (): Record<string, number> => {
  const summary: Record<string, number> = {};
  analyticsData.forEach((event) => {
    const key = `${event.category}_${event.action}`;
    summary[key] = (summary[key] || 0) + 1;
  });
  return summary;
};

/**
 * Clear analytics data
 */
export const clearAnalyticsData = (): void => {
  analyticsData.length = 0;
};

/**
 * Export analytics data
 * @returns Blob containing analytics data
 */
export const exportAnalyticsData = (): Blob => {
  const data = JSON.stringify(analyticsData, null, 2);
  return new Blob([data], { type: 'application/json' });
};

/**
 * Track feature usage
 * @param feature - The feature name
 * @param action - The action performed
 */
export const trackFeatureUsage = (
  feature: string,
  action: string
): void => {
  trackEvent({
    category: 'Feature',
    action,
    label: feature,
  });
};

/**
 * Track user journey
 * @param step - The journey step
 * @param data - Additional journey data
 */
export const trackUserJourney = (
  step: string,
  data?: Record<string, any>
): void => {
  trackEvent({
    category: 'User Journey',
    action: step,
    properties: data,
  });
};

/**
 * Track session start
 * @param properties - Additional session properties
 */
export const trackSessionStart = (properties?: Record<string, any>): void => {
  trackEvent({
    category: 'Session',
    action: 'Start',
    properties: {
      sessionId: generateSessionId(),
      startTime: Date.now(),
      ...properties,
    },
  });
};

/**
 * Track session end
 * @param properties - Additional session properties
 */
export const trackSessionEnd = (properties?: Record<string, any>): void => {
  trackEvent({
    category: 'Session',
    action: 'End',
    properties: {
      endTime: Date.now(),
      ...properties,
    },
  });
};

/**
 * Track user segment
 * @param segment - The user segment
 * @param properties - Additional segment properties
 */
export const trackUserSegment = (
  segment: string,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'User Segment',
    action: 'Identify',
    label: segment,
    properties,
  });
};

/**
 * Track A/B test exposure
 * @param testId - The A/B test ID
 * @param variant - The test variant
 * @param properties - Additional test properties
 */
export const trackABTest = (
  testId: string,
  variant: string,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'A/B Test',
    action: 'Exposure',
    label: testId,
    properties: {
      variant,
      ...properties,
    },
  });
};

/**
 * Track conversion
 * @param goal - The conversion goal
 * @param value - The conversion value
 * @param properties - Additional conversion properties
 */
export const trackConversion = (
  goal: string,
  value: number,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'Conversion',
    action: goal,
    value,
    properties,
  });
};

/**
 * Track user engagement
 * @param type - The engagement type
 * @param duration - The engagement duration
 * @param properties - Additional engagement properties
 */
export const trackEngagement = (
  type: string,
  duration: number,
  properties?: Record<string, any>
): void => {
  trackEvent({
    category: 'Engagement',
    action: type,
    value: duration,
    properties,
  });
};

/**
 * Generate a unique session ID
 * @returns A unique session ID
 */
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}; 