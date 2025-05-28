import PigeonSvg from "@/components/SvgComponents/PigeonSvg";
import PlanetSvg from "@/components/SvgComponents/PlanetSvg";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../../components/CustomText";
import { scaleFontSize } from "../../utilities/scaling";

const IconWithTopBorder = ({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) => {
  return (
    <View
      style={[
        styles.container,
        focused && styles.focusedTabShadow, // Add shadow when focused
      ]}
    >
      {focused && <View style={styles.topBorder} />}
      {children}
    </View>
  );
};

const HomeIcon = () => (
  <View style={styles.homeIconWrapper}>
    <PigeonSvg />
  </View>
);

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const activeTabIndex = useSharedValue(0);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarOpacity = useSharedValue(isTabBarVisible ? 1 : 0);

  const animatedTabBarStyle = useAnimatedStyle(() => ({
    opacity: withTiming(tabBarOpacity.value, {
      duration: 300,
      easing: Easing.linear,
    }),
  }));

  useEffect(() => {
    tabBarOpacity.value = isTabBarVisible ? 1 : 0;
  }, [isTabBarVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(-activeTabIndex.value * 100) }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: "rgba(52, 64, 81, 1)",
          headerShown: false,
          tabBarStyle: [
            {
              paddingTop: 4,
              height: bottom > 0 ? 83 : 66,
            },
            animatedTabBarStyle, // Apply animated opacity to the tab bar
          ],
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconWithTopBorder focused={focused}>
                <PlanetSvg color={color} />
              </IconWithTopBorder>
            ),
            tabBarLabel: ({ focused }) => (
              <CustomText
                fontFamily="Inter-Regular"
                style={[
                  styles.tabBarLabel,
                  focused && styles.activeTabBarLabel,
                ]}
              >
                Profile
              </CustomText>
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: () => <HomeIcon />,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <IconWithTopBorder focused={focused}>
                <PlanetSvg color={color} />
              </IconWithTopBorder>
            ),
            tabBarLabel: ({ focused }) => (
              <CustomText
                fontFamily="Inter-Regular"
                style={[
                  styles.tabBarLabel,
                  focused && styles.activeTabBarLabel,
                ]}
              >
                Settings
              </CustomText>
            ),
          }}
        />
      </Tabs>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    position: "relative",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 3.2,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    backgroundColor: "#764BFA",
  },
  focusedTabShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  homeIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 95,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    borderColor: "#FFFFFF",
    borderWidth: 4,
    alignItems: "center",
  },
  tabBarLabel: {
    fontSize: scaleFontSize(12),
    color: "#637083", // gray color for inactive state
  },
  activeTabBarLabel: {
    color: "rgba(52, 64, 81, 1)", // purple color for active state
  },
});