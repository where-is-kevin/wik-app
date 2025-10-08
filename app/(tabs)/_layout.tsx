import CogSvg from "@/components/SvgComponents/CogSvg";
import NavPlusSvg from "@/components/SvgComponents/NavPlusSvg";
import NavProfileSvg from "@/components/SvgComponents/NavProfileSvg";
import NavProfileSvgFilled from "@/components/SvgComponents/NavProfileSvgFilled";
import NavStarSvg from "@/components/SvgComponents/NavStarSvg";
import NavStarSvgFilled from "@/components/SvgComponents/NavStarSvgFilled";
import NavSettingsSvgFilled from "@/components/SvgComponents/NavSettingsSvgFilled";
import PigeonSvg from "@/components/SvgComponents/PigeonSvg";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../../components/CustomText";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "../../utilities/scaling";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { trackNavigation, trackButtonClick } = useAnalyticsContext();
  const router = useRouter();

  // Individual jiggle values for each tab
  const profileJiggle = useSharedValue(0);
  const indexJiggle = useSharedValue(0);
  const createJiggle = useSharedValue(0);
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
  const handleTabPress = (
    tabName: string,
    jiggleValue: SharedValue<number>
  ) => {
    triggerJiggle(jiggleValue);

    // Track tab navigation
    trackButtonClick(`tab_${tabName}`, {
      tab_name: tabName,
      from_screen: "tabs",
      interaction_type: "tab_press",
    });

    trackNavigation("tabs", tabName, {
      navigation_type: "tab_switch",
      target_tab: tabName,
    });
  };

  // Special handler for create tab
  const handleCreateTabPress = (event: any) => {
    event.preventDefault();
    triggerJiggle(createJiggle);

    // Track create button click
    trackButtonClick("tab_create", {
      tab_name: "create",
      from_screen: "tabs",
      interaction_type: "tab_press",
    });

    // Navigate to create modal
    router.push("/create");
  };

  // Function to get tab-specific styles
  const getTabWrapperStyle = (tabName: string, focused: boolean) => {
    return [styles.tabWrapper, focused && styles.focusedTabBackground];
  };

  // Create jiggle styles for each tab
  const profileJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: profileJiggle.value }],
  }));

  const indexJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indexJiggle.value }],
  }));

  const createJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: createJiggle.value }],
  }));

  const askKevinJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: askKevinJiggle.value }],
  }));

  const settingsJiggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: settingsJiggle.value }],
  }));

  // Custom Tab Bar Component
  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    return (
      <View
        style={[
          styles.tabBarStyle,
          {
            height:
              Platform.OS === "ios" && bottom > 0
                ? verticalScale(45) + bottom
                : verticalScale(60) +
                  bottom +
                  (Platform.OS === "android" ? verticalScale(8) : 0),
            paddingBottom:
              bottom > 0
                ? verticalScale(10)
                : Platform.OS === "android"
                ? verticalScale(8)
                : verticalScale(8),
            paddingTop:
              bottom > 0
                ? 0
                : Platform.OS === "android"
                ? verticalScale(8)
                : verticalScale(8),
          },
        ]}
      >
        {/* Profile Tab */}
        <Pressable
          onPress={() => {
            handleTabPress("profile", profileJiggle);
            navigation.navigate("profile");
          }}
          style={styles.tabButton}
        >
          <Animated.View
            style={[
              getTabWrapperStyle("profile", state.index === 0),
              profileJiggleStyle,
            ]}
          >
            {state.index === 0 ? (
              <NavProfileSvgFilled />
            ) : (
              <NavProfileSvg color="#A3A3A8" />
            )}
            {state.index === 0 && (
              <CustomText
                fontFamily="Inter-Medium"
                style={[styles.tabBarLabel, styles.activeTabBarLabel]}
              >
                Profile
              </CustomText>
            )}
          </Animated.View>
        </Pressable>

        {/* Discover Tab */}
        <Pressable
          onPress={() => {
            handleTabPress("index", indexJiggle);
            navigation.navigate("index");
          }}
          style={styles.tabButton}
        >
          <Animated.View
            style={[
              getTabWrapperStyle("index", state.index === 1),
              indexJiggleStyle,
            ]}
          >
            <PigeonSvg color={state.index === 1 ? "#3C62FA" : "#A3A3A8"} />
            {state.index === 1 && (
              <CustomText
                fontFamily="Inter-Medium"
                style={[styles.tabBarLabel, styles.activeTabBarLabel]}
              >
                Discover
              </CustomText>
            )}
          </Animated.View>
        </Pressable>

        {/* Create Button - Hidden for release */}
        {/* <TouchableOpacity
          onPress={handleCreateTabPress}
          style={styles.tabButton}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.tabWrapper, createJiggleStyle]}>
            <NavPlusSvg color="#A3A3A8" />
          </Animated.View>
        </TouchableOpacity> */}

        {/* Ask Kevin Tab */}
        <Pressable
          onPress={() => {
            handleTabPress("ask-kevin", askKevinJiggle);
            navigation.navigate("ask-kevin");
          }}
          style={styles.tabButton}
        >
          <Animated.View
            style={[
              getTabWrapperStyle("ask-kevin", state.index === 2),
              askKevinJiggleStyle,
            ]}
          >
            {state.index === 2 ? (
              <NavStarSvgFilled color="#3C62FA" />
            ) : (
              <NavStarSvg color="#A3A3A8" />
            )}
            {state.index === 2 && (
              <CustomText
                fontFamily="Inter-Medium"
                style={[styles.tabBarLabel, styles.activeTabBarLabel]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Ask Kevin
              </CustomText>
            )}
          </Animated.View>
        </Pressable>

        {/* Settings Tab */}
        <Pressable
          onPress={() => {
            handleTabPress("settings", settingsJiggle);
            navigation.navigate("settings");
          }}
          style={styles.tabButton}
        >
          <Animated.View
            style={[
              getTabWrapperStyle("settings", state.index === 3),
              settingsJiggleStyle,
            ]}
          >
            {state.index === 3 ? (
              <NavSettingsSvgFilled />
            ) : (
              <CogSvg color="#A3A3A8" />
            )}
            {state.index === 3 && (
              <CustomText
                fontFamily="Inter-Medium"
                style={[styles.tabBarLabel, styles.activeTabBarLabel]}
              >
                Settings
              </CustomText>
            )}
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: "rgba(52, 64, 81, 1)",
          headerShown: false,
          tabBarShowLabel: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="profile" options={{ headerShown: false }} />
        <Tabs.Screen name="index" options={{ headerShown: false }} />
        <Tabs.Screen name="ask-kevin" options={{ headerShown: false }} />
        <Tabs.Screen name="settings" options={{ headerShown: false }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: horizontalScale(73),
    paddingVertical: 8,
    borderRadius: 10,
  },
  focusedTabBackground: {
    backgroundColor: "#F5F5FF",
  },
  tabBarLabel: {
    fontSize: scaleFontSize(12),
    color: "#637083",
    marginTop: 4,
    textAlign: "center",
  },
  activeTabBarLabel: {
    color: "#3C62FA",
  },
  tabBarStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2F2F3",
    borderRadius: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
