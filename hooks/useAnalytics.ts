import { useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';

// Enable debug mode in development
if (__DEV__) {
  analytics().setAnalyticsCollectionEnabled(true);
}

export interface AnalyticsParams {
  [key: string]: string | number | boolean;
}

// Predefined event categories for better organization
export const AnalyticsEvents = {
  // Core Suggestion Events (Main Focus)
  SUGGESTION: {
    SWIPE_RIGHT: 'swipe_right',      // Like suggestion
    SWIPE_LEFT: 'swipe_left',        // Dislike suggestion  
    SAVE_SUGGESTION: 'save_suggestion', // Save for later
    BOOK_SUGGESTION: 'book_suggestion', // Swipe up / Book
    VIEW_SUGGESTION: 'view_suggestion'  // Suggestion viewed
  },
  // Authentication & User Management
  AUTH: {
    LOGIN_ATTEMPT: 'login_attempt',
    LOGIN_SUCCESS: 'login',
    LOGIN_FAILED: 'login_failed', 
    SIGNUP_ATTEMPT: 'sign_up_attempt',
    SIGNUP_SUCCESS: 'sign_up',
    SIGNUP_FAILED: 'sign_up_failed',
    OTP_REQUEST: 'otp_request',
    OTP_VERIFY: 'otp_verify',
    LOGOUT: 'logout'
  },
  // Onboarding Flow
  ONBOARDING: {
    START: 'onboarding_start',
    STEP_COMPLETE: 'onboarding_step_complete',
    COMPLETE: 'onboarding_complete',
    SKIP: 'onboarding_skip',
    BACK: 'onboarding_back'
  },
  // Navigation
  NAVIGATION: {
    SCREEN_VIEW: 'screen_view',
    TAB_SWITCH: 'tab_switch',
    DEEP_LINK: 'deep_link_open'
  },
  // User Actions
  USER_ACTION: {
    BUTTON_CLICK: 'button_click',
    FILTER_APPLY: 'filter_apply',
    SORT_CHANGE: 'sort_change',
    SEARCH: 'search'
  },
  // Business Events
  BUSINESS: {
    PURCHASE: 'purchase',
    VIEW_PROMOTION: 'view_promotion',
    SELECT_PROMOTION: 'select_promotion'
  }
} as const;

export const useAnalytics = () => {
  // Track button clicks with standardized parameters
  const trackButtonClick = useCallback(async (buttonName: string, params?: AnalyticsParams) => {
    try {
      const standardizedParams = {
        button_name: buttonName,
        screen: params?.screen || 'unknown',
        section: params?.section || 'main',
        timestamp: Date.now(),
        ...(params || {}),
      };
      
      await analytics().logEvent(AnalyticsEvents.USER_ACTION.BUTTON_CLICK, standardizedParams);
    } catch (error) {
      console.log('Analytics trackButtonClick error:', error);
    }
  }, []);

  // Track screen views with enhanced data
  const trackScreenView = useCallback(async (screenName: string, params?: AnalyticsParams) => {
    try {
      const screenParams = {
        screen_name: screenName,
        screen_class: screenName,
        user_type: params?.user_type || 'unknown',
        session_duration: params?.session_duration,
        previous_screen: params?.previous_screen,
        timestamp: Date.now(),
        ...params,
      };
      
      await analytics().logScreenView(screenParams);
      // Also log as custom event for better filtering
      await analytics().logEvent(AnalyticsEvents.NAVIGATION.SCREEN_VIEW, screenParams);
    } catch (error) {
      console.log('Analytics trackScreenView error:', error);
    }
  }, []);


  // NEW: Track suggestion interactions (main tracking function)
  const trackSuggestion = useCallback(async (
    action: 'swipe_right' | 'swipe_left' | 'save_suggestion' | 'book_suggestion' | 'view_suggestion',
    params: {
      suggestion_id: string;
      suggestion_type: 'venue' | 'experience' | 'event';
      category: string;
      user_id?: string;
      venue_partner_id?: string;
      suggestion_popularity_score?: number;
      similarity_score?: number;
      location?: string;
      price_range?: string;
      rating?: number;
      [key: string]: any;
    }
  ) => {
    try {
      const suggestionParams = {
        // Required parameters
        suggestion_id: params.suggestion_id,
        suggestion_type: params.suggestion_type,
        category: params.category,
        timestamp: Date.now(),
        
        // Optional demographic/context parameters
        user_id: params.user_id,
        venue_partner_id: params.venue_partner_id,
        suggestion_popularity_score: params.suggestion_popularity_score,
        similarity_score: params.similarity_score,
        location: params.location,
        price_range: params.price_range,
        rating: params.rating,
        
        // Additional context
        screen: 'swipe_cards',
        platform: 'mobile',
        
        // Include any additional parameters
        ...Object.fromEntries(
          Object.entries(params).filter(([key]) => 
            !['suggestion_id', 'suggestion_type', 'category', 'user_id', 'venue_partner_id', 
              'suggestion_popularity_score', 'similarity_score', 'location', 'price_range', 'rating'].includes(key)
          )
        )
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(suggestionParams).filter(([_, value]) => value !== undefined)
      );

      // Map action to event name directly
      const eventNameMap = {
        'swipe_right': AnalyticsEvents.SUGGESTION.SWIPE_RIGHT,
        'swipe_left': AnalyticsEvents.SUGGESTION.SWIPE_LEFT,
        'save_suggestion': AnalyticsEvents.SUGGESTION.SAVE_SUGGESTION,
        'book_suggestion': AnalyticsEvents.SUGGESTION.BOOK_SUGGESTION,
        'view_suggestion': AnalyticsEvents.SUGGESTION.VIEW_SUGGESTION
      };
      
      const eventName = eventNameMap[action];
      if (!eventName) {
        console.error(`Unknown suggestion action: ${action}`);
        return;
      }
      
      await analytics().logEvent(eventName, cleanParams);
    } catch (error) {
      console.log(`Analytics trackSuggestion (${action}) error:`, error);
    }
  }, []);

  // Track search events with context
  const trackSearch = useCallback(async (searchTerm: string, params?: AnalyticsParams) => {
    try {
      const searchParams = {
        search_term: searchTerm.toLowerCase(),
        search_length: searchTerm.length,
        screen: params?.screen || 'unknown',
        search_type: params?.search_type || 'general',
        results_count: params?.results_count || 0,
        timestamp: Date.now(),
        ...params,
      };
      
      await analytics().logEvent(AnalyticsEvents.USER_ACTION.SEARCH, searchParams);
    } catch (error) {
      console.log('Analytics trackSearch error:', error);
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

  // Specialized tracking functions for better organization
  
  // Authentication events
  const trackAuth = useCallback(async (action: 'login_attempt' | 'login_success' | 'login_failed' | 'signup_attempt' | 'signup_success' | 'signup_failed' | 'otp_request' | 'otp_verify' | 'logout', params?: AnalyticsParams) => {
    try {
      const authParams = {
        auth_method: params?.method || 'email',
        user_type: params?.user_type || 'unknown',
        error_code: params?.error_code,
        timestamp: Date.now(),
        ...params,
      };
      
      await analytics().logEvent(AnalyticsEvents.AUTH[action.toUpperCase() as keyof typeof AnalyticsEvents.AUTH], authParams);
    } catch (error) {
      console.log('Analytics trackAuth error:', error);
    }
  }, []);

  // Onboarding events
  const trackOnboarding = useCallback(async (action: 'start' | 'step_complete' | 'complete' | 'skip' | 'back', params?: AnalyticsParams) => {
    try {
      const onboardingParams = {
        step_name: params?.step_name || 'unknown',
        step_number: params?.step_number || 0,
        completion_time: params?.completion_time,
        user_selections: params?.user_selections,
        timestamp: Date.now(),
        ...params,
      };
      
      await analytics().logEvent(AnalyticsEvents.ONBOARDING[action.toUpperCase() as keyof typeof AnalyticsEvents.ONBOARDING], onboardingParams);
    } catch (error) {
      console.log('Analytics trackOnboarding error:', error);
    }
  }, []);

  // Business events (for monetization tracking)
  const trackBusiness = useCallback(async (action: 'purchase' | 'view_promotion' | 'select_promotion', params?: AnalyticsParams) => {
    try {
      const businessParams = {
        currency: params?.currency || 'USD',
        value: params?.value || 0,
        item_id: params?.item_id,
        item_name: params?.item_name,
        item_category: params?.item_category,
        timestamp: Date.now(),
        ...params,
      };
      
      await analytics().logEvent(AnalyticsEvents.BUSINESS[action.toUpperCase() as keyof typeof AnalyticsEvents.BUSINESS], businessParams);
    } catch (error) {
      console.log('Analytics trackBusiness error:', error);
    }
  }, []);

  // Navigation tracking for tab switches and screen navigation
  const trackNavigation = useCallback(async (fromScreen: string, toScreen: string, params?: AnalyticsParams) => {
    try {
      const navigationParams = {
        from_screen: fromScreen,
        to_screen: toScreen,
        navigation_type: params?.navigation_type || 'tab_switch',
        timestamp: Date.now(),
        ...params,
      };
      
      await analytics().logEvent(AnalyticsEvents.NAVIGATION.TAB_SWITCH, navigationParams);
    } catch (error) {
      console.log('Analytics trackNavigation error:', error);
    }
  }, []);

  return {
    // Core tracking functions
    trackButtonClick,
    trackScreenView,
    trackSearch,
    trackCustomEvent,
    setUserProperty,
    setUserId,
    
    // Main suggestion tracking function
    trackSuggestion,
    
    // Specialized tracking functions
    trackAuth,
    trackOnboarding,
    trackBusiness,
    trackNavigation,
  };
};