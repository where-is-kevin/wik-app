import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CustomText from "@/components/CustomText";
import XButtonSvg from "@/components/SvgComponents/XButtonSvg";
import { useTheme } from "@/contexts/ThemeContext";

export default function CreateScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <CustomText fontFamily="Inter-SemiBold" style={styles.headerTitle}>
          Create
        </CustomText>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <XButtonSvg />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <CustomText style={[styles.placeholder, { color: colors.gray_regular }]}>
          Create content functionality will be implemented here
        </CustomText>
      </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F3",
  },
  headerLeft: {
    width: 24,
  },
  headerTitle: {
    fontSize: 18,
    color: "#344051",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholder: {
    fontSize: 16,
    textAlign: "center",
  },
});