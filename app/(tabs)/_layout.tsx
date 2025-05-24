import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import CustomText from "../../components/CustomText";
import { scaleFontSize } from "../../utilities/scaling";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlanetSvg from "@/components/SvgComponents/PlanetSvg";
import PigeonSvg from "@/components/SvgComponents/PigeonSvg";

const IconWithTopBorder = ({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) => {
  return (
    <View style={styles.container}>
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
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "rgba(52, 64, 81, 1)",
        headerShown: false,
        tabBarStyle: {
          paddingTop: 4,
          height: bottom > 0 ? 83 : 66,
        },
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
              style={[styles.tabBarLabel, focused && styles.activeTabBarLabel]}
            >
              Profile
            </CustomText>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
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
              style={[styles.tabBarLabel, focused && styles.activeTabBarLabel]}
            >
              Planner
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
        name="ask-kevin"
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
              style={[styles.tabBarLabel, focused && styles.activeTabBarLabel]}
            >
              Explore
            </CustomText>
          ),
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
              style={[styles.tabBarLabel, focused && styles.activeTabBarLabel]}
            >
              Settings
            </CustomText>
          ),
        }}
      />
    </Tabs>
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
