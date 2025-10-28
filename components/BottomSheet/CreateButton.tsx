import React from "react";
import { View, StyleSheet } from "react-native";
import { verticalScale } from "@/utilities/scaling";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NextButton from "../Button/NextButton";

interface CreateButtonProps {
  disabled: boolean;
  isCreating: boolean;
  onPress: () => void;
  title?: string;
  creatingTitle?: string;
  bgColor?: string;
}

// Separate component for button to prevent re-renders
const CreateButton: React.FC<CreateButtonProps> = ({
  disabled,
  isCreating,
  onPress,
  title = "Create Bucket",
  creatingTitle = "Creating...",
  bgColor = "#CCFF3A"
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.bottomSection,
      { paddingBottom: insets.bottom + 12 }
    ]}>
      <NextButton
        title={isCreating ? creatingTitle : title}
        onPress={onPress}
        disabled={disabled}
        bgColor={bgColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    paddingBottom: verticalScale(12),
    paddingHorizontal: 24,
  },
});

export default React.memo(CreateButton);