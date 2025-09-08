import CogSvg from "@/components/SvgComponents/CogSvg";
import PigeonSvg from "@/components/SvgComponents/PigeonSvg";
import StarSvg from "@/components/SvgComponents/StarSvg";
import UserSvg from "@/components/SvgComponents/UserSvg";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../../components/CustomText";
import { scaleFontSize } from "../../utilities/scaling";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { trackNavigation, trackButtonClick } = useAnalyticsContext();

  // Individual jiggle values for each tab
  const profileJiggle = useSharedValue(0);
  const indexJiggle = useSharedValue(0);
  const askKevinJiggle = useSharedValue(0);
  const settingsJiggle = useSharedValue(0);

  // Function to trigger simple left-right jiggle
  const triggerJiggle = (jiggleValue: SharedValue<number>) => {
    jiggleValue.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(-1.2, { duration: 150 }),
      withTiming(0, { duration: 150 })
    );
  };

  // Enhanced tab press handlers with analytics
  const handleTabPress = (tabName: string, jiggleValue: SharedValue<number>) => {
    triggerJiggle(jiggleValue);
    
    // Track tab navigation
    trackButtonClick(`tab_${tabName}`, {
      tab_name: tabName,
      from_screen: 'tabs',
      interaction_type: 'tab_press'
    });
    
    trackNavigation('tabs', tabName, {
      navigation_type: 'tab_switch',
      target_tab: tabName
    });
  };

  // Function to get tab-specific styles
  const getTabWrapperStyle = (tabName: string, focused: boolean) => {
    const isWiderTab =
      tabName === "index" || tabName === "ask-kevin" || tabName === "settings";

    return [
      isWiderTab ? styles.widerTabWrapper : styles.tabWrapper,
      focused && styles.focusedTabBackground,
    ];
  };

  // Create jiggle styles for each tab
  const profileJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: profileJiggle.value }],
  }));

  const indexJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indexJiggle.value }],
  }));

  const askKevinJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: askKevinJiggle.value }],
  }));

  const settingsJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: settingsJiggle.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: "rgba(52, 64, 81, 1)",
          headerShown: false,
          tabBarStyle: [
            styles.tabBarStyle,
            {
              height: 80,
              ...(bottom > 0 ? { alignItems: "center" } : { paddingTop: 21 }),
            },
          ],
          tabBarShowLabel: false,
          tabBarButton: (props) => (
            // @ts-ignore
            <Pressable {...props} android_ripple={null} />
          ),
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[
                  getTabWrapperStyle("profile", focused),
                  profileJiggleStyle,
                ]}
              >
                <UserSvg color={focused ? "#3C62FA" : "#A3A3A8"} />
                {focused && (
                  <CustomText
                    fontFamily="Inter-Medium"
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
          listeners={{
            tabPress: () => handleTabPress('profile', profileJiggle),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[getTabWrapperStyle("index", focused), indexJiggleStyle]}
              >
                <PigeonSvg color={focused ? "#3C62FA" : "#A3A3A8"} />
                {focused && (
                  <CustomText
                    fontFamily="Inter-Medium"
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
          listeners={{
            tabPress: () => handleTabPress('index', indexJiggle),
          }}
        />
        <Tabs.Screen
          name="ask-kevin"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[
                  getTabWrapperStyle("ask-kevin", focused),
                  askKevinJiggleStyle,
                ]}
              >
                <StarSvg color={focused ? "#3C62FA" : "#A3A3A8"} />
                {focused && (
                  <CustomText
                    fontFamily="Inter-Medium"
                    style={[
                      styles.tabBarLabel,
                      focused && styles.activeTabBarLabel,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Ask Kevin
                  </CustomText>
                )}
              </Animated.View>
            ),
          }}
          listeners={{
            tabPress: () => handleTabPress('ask-kevin', askKevinJiggle),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Animated.View
                style={[
                  getTabWrapperStyle("settings", focused),
                  settingsJiggleStyle,
                ]}
              >
                <CogSvg color={focused ? "#3C62FA" : "#A3A3A8"} />
                {focused && (
                  <CustomText
                    fontFamily="Inter-Medium"
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
          listeners={{
            tabPress: () => handleTabPress('settings', settingsJiggle),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 44,
    minWidth: 95,
  },
  widerTabWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 44,
    minWidth: 108,
  },
  focusedTabBackground: {
    backgroundColor: "rgba(118, 75, 250, 0.1)",
  },
  tabBarLabel: {
    fontSize: scaleFontSize(12),
    color: "#637083",
    marginLeft: 6,
    flexShrink: 1,
  },
  activeTabBarLabel: {
    color: "#3C62FA",
  },
  tabBarStyle: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2F2F3",
    borderRadius: 0,
  },
});
