import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

const settingsData = [
  { id: "1", title: "Feedback" },
  { id: "2", title: "Notifications" }, // coming soon....
  { id: "3", title: "Privacy & Security" },
  { id: "4", title: "Log Out" },
];

const Settings = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleFeedback = () => {
    router.push("/(settings)/feedback");
  };

  const handleNotifications = () => {
    console.log("Navigating to Notifications (coming soon...)");
    // Add navigation logic here when Notifications is implemented
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
        handleNotifications();
        break;
      case "3":
        handlePrivacyAndSecurity();
        break;
      case "4":
        handleLogout();
        break;
      default:
        console.log("Unknown setting selected");
    }
  };

  const renderItem = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => handlePress(item.id)}
    >
      <Text style={styles.settingText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <FlatList
        data={settingsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: {
    fontSize: 16,
  },
});

export default Settings;