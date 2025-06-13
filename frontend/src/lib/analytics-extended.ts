/**
 * Extended Analytics Utility
 * 
 * This module provides additional analytics functionality that extends the base analytics utility,
 * including session tracking, user segmentation, and A/B testing support.
 */

import { trackEvent } from './analytics';

/**
 * Track session start
 * @param properties - Additional session properties
 */
export const trackSessionStart = (properties?: Record<string, any>): void => {
  trackEvent({
    category: 'Session',
    action: 'Start',
    properties: {
      sessionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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