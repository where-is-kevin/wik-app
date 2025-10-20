import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';

interface TrackableButtonProps extends TouchableOpacityProps {
  title: string;
  buttonName: string;
  analyticsParams?: Record<string, string | number | boolean>;
  onPress?: () => void;
}

export const TrackableButton: React.FC<TrackableButtonProps> = ({
  title,
  buttonName,
  analyticsParams,
  onPress,
  style,
  ...props
}) => {
  const { trackButtonClick } = useAnalyticsContext();

  const handlePress = async () => {
    // Track the button click
    await trackButtonClick(buttonName, analyticsParams);
    
    // Call the original onPress handler
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      {...props}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});