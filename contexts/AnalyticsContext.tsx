import React, { createContext, useContext, useEffect } from 'react';
import { useAnalytics, AnalyticsParams } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  // Core tracking functions
  trackButtonClick: (buttonName: string, params?: AnalyticsParams) => Promise<void>;
  trackScreenView: (screenName: string, params?: AnalyticsParams) => Promise<void>;
  trackSearch: (searchTerm: string, params?: AnalyticsParams) => Promise<void>;
  trackCustomEvent: (eventName: string, params?: AnalyticsParams) => Promise<void>;
  setUserProperty: (name: string, value: string) => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
  
  // Main suggestion tracking function
  trackSuggestion: (
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
  ) => Promise<void>;
  
  // Specialized tracking functions
  trackAuth: (action: 'login_attempt' | 'login_success' | 'login_failed' | 'signup_attempt' | 'signup_success' | 'signup_failed' | 'otp_request' | 'otp_verify' | 'logout', params?: AnalyticsParams) => Promise<void>;
  trackOnboarding: (action: 'start' | 'step_complete' | 'complete' | 'skip' | 'back', params?: AnalyticsParams) => Promise<void>;
  trackBusiness: (action: 'purchase' | 'view_promotion' | 'select_promotion', params?: AnalyticsParams) => Promise<void>;
  trackNavigation: (fromScreen: string, toScreen: string, params?: AnalyticsParams) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const analytics = useAnalytics();

  // Initialize analytics when provider mounts
  useEffect(() => {
    // You can set default user properties here
    // analytics.setUserProperty('app_version', '1.0.9');
  }, []);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};