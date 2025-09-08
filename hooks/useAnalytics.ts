import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';

// Enable debug mode in development
if (__DEV__) {
  analytics().setAnalyticsCollectionEnabled(true);
}

export interface AnalyticsParams {
  [key: string]: string | number | boolean;
}

export const useAnalytics = () => {
  // Track button clicks
  const trackButtonClick = useCallback(async (buttonName: string, params?: AnalyticsParams) => {
    try {
      // Clean parameters - only include our custom data
      const cleanParams = {
        button: buttonName,
        ...(params || {}),
      };
      
      await analytics().logEvent('user_button_click', cleanParams);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Track screen views
  const trackScreenView = useCallback(async (screenName: string, params?: AnalyticsParams) => {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
        ...params,
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Track swipe gestures
  const trackSwipe = useCallback(async (direction: 'left' | 'right' | 'up' | 'down', screenName?: string, params?: AnalyticsParams) => {
    try {
      // Clean parameters - only include our custom data
      const cleanParams = {
        swipe_direction: direction,
        screen: screenName || 'unknown',
        ...(params || {}),
      };
      
      await analytics().logEvent('user_swipe', cleanParams);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Track search events
  const trackSearch = useCallback(async (searchTerm: string, params?: AnalyticsParams) => {
    try {
      await analytics().logEvent('search', {
        search_term: searchTerm,
        ...params,
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Track content interaction
  const trackContentInteraction = useCallback(async (contentType: string, contentId: string, action: string, params?: AnalyticsParams) => {
    try {
      // Clean parameters - only include our custom data
      const cleanParams = {
        content_type: contentType,
        content_id: contentId,
        action: action,
        ...(params || {}),
      };
      
      await analytics().logEvent('user_content_interaction', cleanParams);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Track navigation events
  const trackNavigation = useCallback(async (fromScreen: string, toScreen: string, params?: AnalyticsParams) => {
    try {
      // Clean parameters - only include our custom data
      const cleanParams = {
        from_screen: fromScreen,
        to_screen: toScreen,
        ...(params || {}),
      };
      
      await analytics().logEvent('user_navigation', cleanParams);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Track custom events
  const trackCustomEvent = useCallback(async (eventName: string, params?: AnalyticsParams) => {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Set user properties
  const setUserProperty = useCallback(async (name: string, value: string) => {
    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  // Set user ID
  const setUserId = useCallback(async (userId: string) => {
    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, []);

  return {
    trackButtonClick,
    trackScreenView,
    trackSwipe,
    trackSearch,
    trackContentInteraction,
    trackNavigation,
    trackCustomEvent,
    setUserProperty,
    setUserId,
  };
};