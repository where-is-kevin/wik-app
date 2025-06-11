import React from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import CustomView from "@/components/CustomView";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import BackHeader from "@/components/Header/BackHeader";
import {
  verticalScale,
  horizontalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";

const settingsData = [
  { id: "1", title: "Feedback" },
  { id: "2", title: "Privacy and security" },
  { id: "3", title: "Log Out" },
];

const Settings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const handleFeedback = () => {
    router.push("/(settings)");
  };

  const handlePrivacyAndSecurity = () => {
    console.log("Navigating to Privacy & Security");
    // Add navigation logic here when Privacy & Security is implemented
  };

  const handleLogout = () => {
    console.log("Logging out...");
    queryClient.removeQueries({ queryKey: ["jwt"] });
    router.replace("/(auth)");
  };

  const handlePress = (id: string) => {
    switch (id) {
      case "1":
        handleFeedback();
        break;
      case "2":
        handlePrivacyAndSecurity();
        break;
      case "3":
        handleLogout();
        break;
      default:
        console.log("Unknown setting selected");
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: { id: string; title: string };
    index: number;
  }) => (
    <>
      <CustomTouchable
        style={[
          styles.settingItem,
          {
            backgroundColor: colors?.background,
          },
        ]}
        onPress={() => handlePress(item.id)}
        activeOpacity={0.7}
      >
        <CustomText style={[styles.settingText, { color: colors?.label_dark }]}>
          {item.title}
        </CustomText>
        <Ionicons name="chevron-forward" size={16} color={colors?.event_gray} />
      </CustomTouchable>

      {/* Separator - only show if not the last item */}
      {index < settingsData.length - 1 && (
        <View
          style={[
            styles.separator,
            {
              backgroundColor: colors?.onboarding_gray,
              marginVertical: verticalScale(16),
            },
          ]}
        />
      )}
    </>
  );

  return (
    <>
      <StatusBar style="dark" translucent />
      <CustomView
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: colors?.background || "#F8F9FA",
          },
        ]}
      >
        <BackHeader hasBackButton={false} title="Settings" transparent={true} />

        <CustomView style={styles.contentContainer}>
          <CustomView style={[styles.settingsCard]}>
            <FlatList
              scrollEnabled={false}
              data={settingsData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          </CustomView>
        </CustomView>
      </CustomView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  settingsCard: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
  },
  settingText: {
    fontSize: scaleFontSize(14),
  },
  separator: {
    height: 1,
    width: "100%",
  },
});

export default Settings;
