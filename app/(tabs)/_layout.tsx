import CogSvg from "@/components/SvgComponents/CogSvg";
import PigeonSvg from "@/components/SvgComponents/PigeonSvg";
import StarSvg from "@/components/SvgComponents/StarSvg";
import UserSvg from "@/components/SvgComponents/UserSvg";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../../components/CustomText";
import { scaleFontSize } from "../../utilities/scaling";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const activeTabIndex = useSharedValue(0);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarOpacity = useSharedValue(isTabBarVisible ? 1 : 0);

  // Animated style for the tab bar
  const animatedTabBarStyle = useAnimatedStyle(() => ({
    opacity: withTiming(tabBarOpacity.value, {
      duration: 300,
      easing: Easing.linear,
    }),
  }));

  // Animated style for the active tab index
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(-activeTabIndex.value * 100) }],
  }));

  // Update tabBarOpacity when isTabBarVisible changes
  useEffect(() => {
    tabBarOpacity.value = isTabBarVisible ? 1 : 0;
  }, [isTabBarVisible, tabBarOpacity]);

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: "rgba(52, 64, 81, 1)",
          headerShown: false,
          tabBarStyle: [
            styles.tabBarStyle,
            animatedTabBarStyle, // Apply animated opacity to the tab bar
          ],
          tabBarShowLabel: false, // Hide default labels
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[
                  styles.tabWrapper,
                  focused && styles.focusedTabBackground, // Add background for focused tab
                ]}
              >
                <UserSvg color={focused ? "#3C62FA" : "#A3A3A8"} /> {/* Grey when not focused */}
                {focused && (
                  <CustomText
                    fontFamily="Inter-Regular"
                    style={[
                      styles.tabBarLabel,
                      focused && styles.activeTabBarLabel,
                    ]}
                  >
                    Profile
                  </CustomText>
                )}
              </Animated.View>
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[
                  styles.tabWrapper,
                  focused && styles.focusedTabBackground, // Add background for focused tab
                ]}
              >
                <PigeonSvg color={focused ? "#3C62FA" : "#A3A3A8"} /> {/* Grey when not focused */}
                {focused && (
                  <CustomText
                    fontFamily="Inter-Regular"
                    style={[
                      styles.tabBarLabel,
                      focused && styles.activeTabBarLabel,
                    ]}
                  >
                    Discover
                  </CustomText>
                )}
              </Animated.View>
            ),
          }}
        />
        <Tabs.Screen
          name="ask-kevin"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[
                  styles.tabWrapper,
                  focused && styles.focusedTabBackground, // Add background for focused tab
                ]}
              >
                <StarSvg color={focused ? "#3C62FA" : "#A3A3A8"} /> {/* Grey when not focused */}
                {focused && (
                  <CustomText
                    fontFamily="Inter-Regular"
                    style={[
                      styles.tabBarLabel,
                      focused && styles.activeTabBarLabel,
                    ]}
                    numberOfLines={1} // Ensure text fits in one line
                    ellipsizeMode="clip" // Add ellipsis if text is too long
                  >
                    Ask Kevin
                  </CustomText>
                )}
              </Animated.View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[
                  styles.tabWrapper,
                  focused && styles.focusedTabBackground, // Add background for focused tab
                ]}
              >
                <CogSvg color={focused ? "#3C62FA" : "#A3A3A8"} /> {/* Grey when not focused */}
                {focused && (
                  <CustomText
                    fontFamily="Inter-Regular"
                    style={[
                      styles.tabBarLabel,
                      focused && styles.activeTabBarLabel,
                    ]}
                  >
                    Settings
                  </CustomText>
                )}
              </Animated.View>
            ),
          }}
        />
      </Tabs>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: "row", // Align icon and text horizontally
    alignItems: "center", // Center align items vertically
    justifyContent: "center", // Center align items horizontally
    paddingVertical: 6, // Reduce vertical padding
    paddingHorizontal: 10, // Reduce horizontal padding to fit text on one line
    borderRadius: 20, // Rounded corners for the tab
  },
  focusedTabBackground: {
    width: "auto", // Allow width to adjust based on content
    backgroundColor: "rgba(118, 75, 250, 0.1)", // Light purple background for focused tab
  },
  tabBarLabel: {
    fontSize: scaleFontSize(11), // Slightly reduce font size
    color: "#637083", // Gray color for inactive state
    marginLeft: 6, // Reduce spacing between the icon and text
  },
  activeTabBarLabel: {
    color: "#3C62FA", // Purple color for active state
    fontWeight: "600", // Slightly bold for active label
  },
  tabBarStyle: {
    flexDirection: "row", // Align tabs horizontally
    justifyContent: "space-between", // Space tabs evenly
    alignItems: "center", // Center align items vertically
    paddingHorizontal: 12, // Match the horizontal padding from the prompt
    gap: 10, // Add spacing between tabs
    height: 80, // Match the height from the prompt
    backgroundColor: "#FFFFFF", // White background
    borderWidth: 1, // Add border
    borderColor: "#F2F2F3", // Light gray border color
    borderRadius: 0, // Remove rounded corners
  },
});