import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';
import { TrackableButton } from './TrackableButton';

export const AnalyticsTestComponent: React.FC = () => {
  const { 
    trackButtonClick, 
    trackScreenView, 
    trackSwipe, 
    trackSearch,
    trackContentInteraction,
    trackNavigation,
    trackCustomEvent 
  } = useAnalyticsContext();

  const runAnalyticsTests = async () => {
    try {
      // Test all different types of analytics we implemented
      
      // 1. Onboarding card swipe simulation
      await trackSwipe('right', 'onboarding_card_swipe', {
        item_id: 'test_item_123',
        item_title: 'Test Restaurant',
        item_category: 'restaurant',
        onboarding_step: 'Discover Your Taste',
        swipe_type: 'like'
      });
      
      // 2. Main card swipe simulation
      await trackSwipe('left', 'main_card_swipe', {
        item_id: 'test_main_456',
        item_title: 'Test Event',
        item_category: 'event',
        swipe_type: 'dislike',
        card_position: 0,
        total_cards: 10,
        is_sponsored: false
      });
      
      // 3. Tab navigation simulation
      await trackButtonClick('tab_ask-kevin', {
        tab_name: 'ask-kevin',
        from_screen: 'tabs',
        interaction_type: 'tab_press'
      });
      
      await trackNavigation('tabs', 'ask-kevin', {
        navigation_type: 'tab_switch',
        target_tab: 'ask-kevin'
      });
      
      // 4. Ask Kevin interaction simulation
      await trackButtonClick('ask_kevin_send_button', {
        message_length: 25,
        keyboard_type: 'ios',
        is_focused: true
      });
      
      await trackSearch('best pizza places', {
        search_type: 'ask_kevin',
        source: 'ask_kevin_input',
        query_length: 18
      });
      
      // 5. Card tap simulation
      await trackButtonClick('main_card_tap', {
        item_id: 'test_tap_789',
        item_title: 'Test Venue',
        item_category: 'venue',
        card_position: 2,
        total_cards: 15,
        is_sponsored: true
      });
      
      // 6. Content interaction simulation
      await trackContentInteraction('main_card', 'test_interaction_101', 'swipe_up', {
        position: 1,
        total: 8,
        similarity: 0.85
      });
      
      // 7. Custom event for testing
      await trackCustomEvent('analytics_test_complete', { 
        events_fired: 7, 
        success: true,
        timestamp: new Date().toISOString()
      });

      Alert.alert(
        'Analytics Test Complete! 🎉',
        '7 different types of analytics events have been sent to Google Analytics/Firebase. Check your Firebase Console to see the events (they may take 1-2 minutes to appear).\n\nEvents tested:\n• Onboarding card swipes\n• Main card swipes\n• Tab navigation\n• Ask Kevin interactions\n• Card taps\n• Content interactions\n• Custom events'
      );
    } catch (error) {
      console.error('Analytics test failed:', error);
      Alert.alert('Analytics Test Failed', `Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <TrackableButton
        title="🧪 Test All Analytics Events"
        buttonName="analytics_test_runner"
        analyticsParams={{ test_suite: 'comprehensive', version: '2.0' }}
        onPress={runAnalyticsTests}
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
    backgroundColor: '#4CAF50',
    marginBottom: 8,
  },
});