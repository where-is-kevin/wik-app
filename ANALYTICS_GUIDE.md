# Analytics Setup Guide

## Overview
This guide explains the improved Google Analytics setup for better organization and tracking in Firebase Console.

## 📊 Event Categories

### 1. Authentication Events (`AUTH`)
Track user authentication flow:
- `login_attempt` - User attempts to log in
- `login` - Successful login
- `login_failed` - Failed login attempt
- `sign_up_attempt` - User attempts to sign up
- `sign_up` - Successful sign up
- `sign_up_failed` - Failed sign up attempt
- `otp_request` - OTP code requested
- `otp_verify` - OTP verification attempt
- `logout` - User logs out

### 2. Onboarding Events (`ONBOARDING`)
Track onboarding flow:
- `onboarding_start` - Onboarding started
- `onboarding_step_complete` - Step completed
- `onboarding_complete` - Onboarding finished
- `onboarding_skip` - Step skipped
- `onboarding_back` - User went back

### 3. Content Events (`CONTENT`)
Track content interactions:
- `view_item` - Content viewed
- `like_content` - Content liked (swipe right)
- `dislike_content` - Content disliked (swipe left)
- `save_content` - Content saved (swipe up)
- `share` - Content shared
- `search` - Search performed

### 4. Navigation Events (`NAVIGATION`)
Track user navigation:
- `screen_view` - Screen viewed
- `tab_switch` - Tab changed
- `deep_link_open` - Deep link opened

### 5. User Action Events (`USER_ACTION`)
Track user interactions:
- `button_click` - Button pressed
- `swipe_gesture` - Swipe performed
- `filter_apply` - Filter applied
- `sort_change` - Sort order changed

### 6. Business Events (`BUSINESS`)
Track monetization:
- `purchase` - Purchase made
- `view_promotion` - Promotion viewed
- `select_promotion` - Promotion selected

## 🛠 How to Use

### Basic Usage
```typescript
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';

const { trackAuth, trackOnboarding, trackButtonClick } = useAnalyticsContext();

// Track authentication
await trackAuth('login_attempt', {
  method: 'email',
  screen: 'login_screen'
});

// Track onboarding
await trackOnboarding('step_complete', {
  step_name: 'personal_info',
  step_number: 2,
  completion_time: 30000
});

// Track button click
await trackButtonClick('sign_in_button', {
  screen: 'login_screen',
  section: 'main'
});
```

### Standard Parameters
All events automatically include:
- `timestamp` - When event occurred
- `screen` - Current screen (when provided)
- `user_type` - Type of user (when available)

### Specialized Functions

#### Authentication Tracking
```typescript
// Login attempt
trackAuth('login_attempt', {
  method: 'email',
  screen: 'login_screen'
});

// Login success
trackAuth('login_success', {
  method: 'email',
  user_type: 'business'
});

// Login failed
trackAuth('login_failed', {
  method: 'email',
  error_code: '401',
  error_message: 'Invalid credentials'
});
```

#### Onboarding Tracking
```typescript
// Start onboarding
trackOnboarding('start', {
  user_type: 'business',
  entry_point: 'signup_button'
});

// Complete step
trackOnboarding('step_complete', {
  step_name: 'company_selection',
  step_number: 3,
  completion_time: 45000,
  user_selections: 'Apple,Google'
});
```

#### Content Interaction
```typescript
// Content swipe
trackSwipe('right', 'home_screen', {
  content_id: 'event_123',
  content_type: 'event',
  content_category: 'restaurant',
  similarity_score: 0.95
});

// Search
trackSearch('pizza near me', {
  screen: 'home_screen',
  search_type: 'location_based',
  results_count: 15
});
```

## 📈 Firebase Console Organization

### Custom Events to Monitor:
1. **Authentication Flow**:
   - Filter by `login_*` and `sign_up_*` events
   - Track conversion rates
   - Monitor error patterns

2. **Onboarding Funnel**:
   - Filter by `onboarding_*` events
   - Track step completion rates
   - Identify drop-off points

3. **Content Engagement**:
   - Filter by `like_content`, `dislike_content`, `save_content`
   - Track engagement rates
   - Analyze content preferences

4. **User Behavior**:
   - Filter by `button_click` events
   - Track feature usage
   - Identify popular actions

### Custom Dimensions to Create:
1. `screen` - Track which screens generate events
2. `user_type` - Segment business vs leisure users
3. `content_category` - Analyze content type preferences
4. `step_name` - Track onboarding step performance

### Conversion Events to Set Up:
1. `sign_up` - User registration
2. `onboarding_complete` - Onboarding completion
3. `like_content` - Content engagement
4. `purchase` - Monetization (if applicable)

## 🔍 Debugging

### Development Mode
Analytics debug mode is automatically enabled in development:
```typescript
if (__DEV__) {
  analytics().setAnalyticsCollectionEnabled(true);
}
```

### Error Handling
All analytics functions include error handling and logging:
```typescript
try {
  await analytics().logEvent(eventName, params);
} catch (error) {
  console.log('Analytics trackAuth error:', error);
}
```

## 📝 Migration Guide

### Update Existing Code:
Replace old analytics calls:
```typescript
// OLD
logEvent('otp_verify_attempt', { email });

// NEW
trackAuth('otp_request', {
  method: 'email',
  screen: 'login_screen'
});
```

### Add Context Parameters:
Always include screen and context:
```typescript
trackButtonClick('continue_button', {
  screen: 'onboarding_step_2',
  section: 'form_submission',
  step_number: 2
});
```

This improved setup will give you much better insights in Firebase Console with organized, searchable, and actionable analytics data.