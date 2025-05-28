import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomView from "../CustomView";

type AskKevinSectionProps = {
  onSend?: (message: string) => void;
  onSettingsPress?: () => void;
};

const AskKevinSection = ({
  onSend,
  onSettingsPress,
}: AskKevinSectionProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    console.log("AskKevin: Send pressed", input);

    // Redirect to /ask-kevin with the input as a query parameter
    router.push({
      pathname: "/ask-kevin",
      params: { query: input.trim() },
    });

    Keyboard.dismiss();
  };

  const handleSettings = () => {
    console.log("AskKevin: Settings pressed");
    onSettingsPress?.();
  };

  const handleInputFocus = () => {
    console.log("AskKevin: Input focused");
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    console.log("AskKevin: Input changed", text);
  };


  return (
    <CustomView
      bgColor={colors.lime}
      style={[
        styles.askKevinHeader,
        { paddingTop: insets.top + verticalScale(12) },
      ]}
    >
      <View style={styles.inputRow}>
        {/* Sparkle Icon */}
        <View style={styles.sparkleContainer}>
          <Ionicons
            name="sparkles"
            size={24}
            color={colors.profile_name_black}
          />
        </View>
        {/* Ask Kevin TextInput */}
        <TextInput
          style={styles.inputRow}
          placeholder="Ask Kevin..."
          placeholderTextColor={colors.profile_name_black + "99"}
          value={input}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSend}
          onFocus={handleInputFocus}
          returnKeyType="send"
        />
        {/* Settings Button with Red Dot */}
        <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
          <MaterialCommunityIcons
            name="tune-variant"
            size={24}
            color={colors.profile_name_black}
          />
          <View style={styles.redDot} />
        </TouchableOpacity>
      </View>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  askKevinHeader: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(10),
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundColor: "#D4FF3F", // fallback lime
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: scaleFontSize(16),
    marginRight: 10,
    backgroundColor: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#E9FF8A",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  sparkleContainer: {
    marginRight: 10,
  },
  askKevinTitle: {
    fontSize: scaleFontSize(18),
    flex: 1,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF2D55",
  },
});

export default AskKevinSection;