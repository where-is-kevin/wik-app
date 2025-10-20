import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';
import { TrackableButton } from './TrackableButton';

export const DebugAnalytics: React.FC = () => {
  const { 
    trackButtonClick, 
    trackScreenView, 
    trackSwipe, 
    trackSearch,
    trackCustomEvent 
  } = useAnalyticsContext();

  const testAnalytics = async () => {
    try {
      // Test different analytics events
      await trackButtonClick('debug_test_button', { test: true, timestamp: Date.now() });
      await trackScreenView('debug_screen', { test_mode: 'active' });
      await trackSwipe('left', 'debug_screen', { gesture_test: true });
      await trackSearch('test search query', { debug: true });
      await trackCustomEvent('debug_test_complete', { 
        events_fired: 4, 
        success: true 
      });

      Alert.alert(
        'Analytics Test Complete',
        'Check Firebase Console or app logs to see events. Events may take 1-2 minutes to appear in Firebase.'
      );
    } catch (error) {
      console.error('Analytics test failed:', error);
      Alert.alert('Analytics Test Failed', `Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <TrackableButton
        title="🔥 Test Firebase Analytics"
        buttonName="debug_analytics_test"
        analyticsParams={{ test_suite: 'debug', version: '1.0' }}
        onPress={testAnalytics}
        style={styles.testButton}
      />
      
      <TrackableButton
        title="📱 Track Screen View"
        buttonName="debug_screen_view"
        analyticsParams={{ manual_test: true }}
        onPress={() => trackScreenView('debug_manual_screen', { trigger: 'button' })}
        style={styles.testButton}
      />
      
      <TrackableButton
        title="👆 Track Swipe Gesture"
        buttonName="debug_swipe_test"
        onPress={() => trackSwipe('right', 'debug_screen', { direction: 'right', test: true })}
        style={styles.testButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    marginBottom: 8,
  },
});