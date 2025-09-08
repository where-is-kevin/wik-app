import React, { createContext, useContext, useEffect } from 'react';
import { useAnalytics, AnalyticsParams } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  trackButtonClick: (buttonName: string, params?: AnalyticsParams) => Promise<void>;
  trackScreenView: (screenName: string, params?: AnalyticsParams) => Promise<void>;
  trackSwipe: (direction: 'left' | 'right' | 'up' | 'down', screenName?: string, params?: AnalyticsParams) => Promise<void>;
  trackSearch: (searchTerm: string, params?: AnalyticsParams) => Promise<void>;
  trackContentInteraction: (contentType: string, contentId: string, action: string, params?: AnalyticsParams) => Promise<void>;
  trackNavigation: (fromScreen: string, toScreen: string, params?: AnalyticsParams) => Promise<void>;
  trackCustomEvent: (eventName: string, params?: AnalyticsParams) => Promise<void>;
  setUserProperty: (name: string, value: string) => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
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