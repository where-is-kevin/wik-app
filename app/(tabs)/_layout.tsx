import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, Image, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="dash"
        options={{
          title: 'Dash',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="globe.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.roundButtonContainer}
              onPress={() => {
                props.onPress?.();
              }}
            >
              <Image
                source={require('@/assets/images/kevin-icon.png')} // Replace with your image path
                style={styles.roundButtonImage}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="KevinGPT"
        options={{
          title: 'KevinGPT',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chat.bubble" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  roundButtonContainer: {
    position: 'absolute',
    bottom: 10, // Adjust to position the button above the tab bar
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  roundButtonImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});