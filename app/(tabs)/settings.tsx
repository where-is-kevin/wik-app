import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useDeleteUser } from "@/hooks/useDeleteUser";
import { useAuth } from "@/hooks/useAuth"; // Changed from useAuthGuard
import { useUserLocation } from "@/contexts/UserLocationContext";
import AppInfoModal from "@/components/AppInfoModal";

const settingsData = [
  { id: "1", title: "Feedback" },
  { id: "2", title: "Privacy and security" },
  { id: "3", title: "Change password" },
  { id: "6", title: "App information" },
  { id: "4", title: "Log out" },
  { id: "5", title: "Delete user" },
];

const Settings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const deleteUserMutation = useDeleteUser();
  const { logout } = useAuth(); // Use the new auth hook
  const { clearUserLocation } = useUserLocation();
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);

  const handleFeedback = () => {
    router.push("/(settings)");
  };

  const handlePrivacyAndSecurity = () => {
    // console.log("Navigating to Privacy & Security");
    router.push("/privacy-policy");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleLogout = async () => {
    // Clear user location preference before logout
    await clearUserLocation();
    // Use the auth hook's logout function
    await logout();
  };

  const handleAppInfo = () => {
    setShowAppInfoModal(true);
  };

  const handleDeleteUser = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteUserMutation.mutate(undefined, {
              onSuccess: async () => {
                // Clear user location and auth data
                await clearUserLocation();
                await logout();
              },
              onError: (error) => {
                Alert.alert(
                  "Error",
                  "Failed to delete account. Please try again.",
                  [{ text: "OK" }]
                );
              },
            });
          },
        },
      ]
    );
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
        handleChangePassword();
        break;
      case "6":
        handleAppInfo();
        break;
      case "4":
        handleLogout();
        break;
      case "5":
        handleDeleteUser();
        break;
      default:
      // console.log("Unknown setting selected");
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
            opacity: item.id === "5" ? 0.7 : 1,
          },
        ]}
        onPress={() => handlePress(item.id)}
        activeOpacity={0.7}
        disabled={item.id === "5" && deleteUserMutation.isPending}
      >
        <CustomText
          style={[
            styles.settingText,
            {
              color: item.id === "5" ? "#FF3B30" : colors?.label_dark,
            },
          ]}
        >
          {item.title}
          {item.id === "5" && deleteUserMutation.isPending && " (Deleting...)"}
        </CustomText>
        {item.id === "6" ? (
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors?.event_gray}
          />
        ) : item.id !== "4" && item.id !== "5" ? (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors?.event_gray}
          />
        ) : null}
      </CustomTouchable>

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

        <AppInfoModal
          visible={showAppInfoModal}
          onClose={() => setShowAppInfoModal(false)}
        />
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
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(16),
  },
  settingText: {
    fontSize: scaleFontSize(14),
  },
  separator: {
    height: 1,
    width: "100%",
  },
  versionContainer: {
    marginTop: "auto",
    marginBottom: verticalScale(20),
  },
});

export default Settings;
